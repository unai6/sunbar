<script setup lang="ts">
import Button from 'primevue/button'
import { storeToRefs } from 'pinia'
import { useMapBounds } from '~/composables/map-interaction/useMapBounds'
import { useArcGISModules } from '~/composables/map-rendering/useArcGISModules'
import { useMapView } from '~/composables/map-rendering/useMapView'
import { useSceneView } from '~/composables/map-rendering/useSceneView'
import { useUserLocationMarker } from '~/composables/map-rendering/useUserLocationMarker'
import { useVenue } from '~/composables/useVenue'
import { useVenues } from '~/composables/useVenues'
import { useVenueMarkers } from '~/composables/venue-visualization/useVenueMarkers'
import { useVenueSymbols } from '~/composables/venue-visualization/useVenueSymbols'
import type { SearchResult, Venue } from '~/shared/types'
import { useCookieConsentStore } from '~/stores/cookieConsent'
import { useMapViewStore } from '~/stores/mapView'
import { attempt } from '~/utils/attempt'

type Props = {
  venues: Venue[]
  center: [number, number]
  zoom: number
  selectedDateTime: Date
  isUserLocated?: boolean
  isAtUserLocation?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'bounds-changed': [bounds: { south: number; west: number; north: number; east: number }]
  'venue-click': [venue: Venue]
  'locate-me': []
  'map-ready': []
}>()

// Composables
const { isSunny } = useVenue()
const { createVenueFromSearchResult, addVenue } = useVenues()
const { loadModules } = useArcGISModules()
const mapView = useMapView()
const sceneView = useSceneView()
const mapViewStore = useMapViewStore()
const { viewMode } = storeToRefs(mapViewStore)
const cookieConsentStore = useCookieConsentStore()
const { isMappingConsented } = storeToRefs(cookieConsentStore)

// Refs
const mapContainerRef = useTemplateRef<HTMLDivElement | null>('mapContainer')
const currentView = computed(() => viewMode.value === '2d' ? mapView : sceneView)
const isLoading = computed(() => currentView.value.isLoading.value)

// Map modules (loaded dynamically)
let arcGISModules: Awaited<ReturnType<typeof loadModules>> | null = null
let venueSymbols: ReturnType<typeof useVenueSymbols> | null = null
let venueMarkers: ReturnType<typeof useVenueMarkers> | null = null
let userLocationMarker: ReturnType<typeof useUserLocationMarker> | null = null
let mapBounds: ReturnType<typeof useMapBounds> | null = null

// Expose methods for parent component
defineExpose({
  flyTo: (lat: number, lng: number, zoom?: number) => {
    currentView.value.flyTo(lat, lng, zoom)
  },
  closePopups: () => {
    currentView.value.closePopups()
  },
  setUserLocation: (lat: number, lng: number) => {
    if (userLocationMarker) {
      userLocationMarker.setUserLocation(
        currentView.value.getVenueGraphicsLayer(),
        lat,
        lng
      )
    }
  }
})

// Event handlers
function handleBoundsChanged(): void {
  if (mapBounds) {
    mapBounds.emitBounds(currentView.value.getView(), (bounds) => {
      emit('bounds-changed', bounds)
    })
  }
}

function handleVenueClick(venueId: string): void {
  const venue = props.venues.find(venueItem => venueItem.id === venueId)
  if (venue) {
    emit('venue-click', venue)
  }
}

function handlePlaceSelected(searchResult: SearchResult): void {
  // Create a venue from the search result with sunlight status calculated for current datetime
  const venue = createVenueFromSearchResult(searchResult, props.selectedDateTime)

  // Add the venue to the store (this will trigger the map to render it)
  addVenue(venue)

  // Fly to the selected place with a comfortable zoom level
  currentView.value.flyTo(searchResult.latitude, searchResult.longitude, 16)
}

// Initialize map
async function initializeMap(): Promise<void> {
  if (!mapContainerRef.value) return

  const { error } = await attempt(async () => {
    // Load ArcGIS modules
    arcGISModules = await loadModules()

    // Initialize composables that depend on ArcGIS modules
    venueSymbols = useVenueSymbols(arcGISModules.SimpleMarkerSymbol)
    venueMarkers = useVenueMarkers(
      arcGISModules.Graphic,
      arcGISModules.Point,
      venueSymbols.createSunnySymbol,
      venueSymbols.createShadedSymbol,
      isSunny
    )
    userLocationMarker = useUserLocationMarker(
      arcGISModules.Graphic,
      arcGISModules.Point,
      arcGISModules.SimpleMarkerSymbol
    )
    mapBounds = useMapBounds(arcGISModules.webMercatorToGeographic)

    // Initialize the appropriate view based on mode
    await initializeView()
  })

  if (error) {
    console.error('Failed to initialize ArcGIS map:', error)
    return
  }

  emit('map-ready')
}

async function initializeView(): Promise<void> {
  if (!mapContainerRef.value || !arcGISModules) return

  // Cleanup existing view
  currentView.value.cleanup()

  if (viewMode.value === '2d') {
    // Initialize 2D map view
    await mapView.initialize(
      mapContainerRef.value,
      props.center,
      props.zoom,
      {
        MapView: arcGISModules.MapView,
        EsriMap: arcGISModules.EsriMap,
        GraphicsLayer: arcGISModules.GraphicsLayer,
        reactiveUtils: arcGISModules.reactiveUtils
      },
      {
        onBoundsChanged: handleBoundsChanged,
        onVenueClick: handleVenueClick
      }
    )
  } else {
    // Initialize 3D scene view
    await sceneView.initialize(
      mapContainerRef.value,
      props.center,
      props.zoom,
      {
        SceneView: arcGISModules.SceneView,
        EsriMap: arcGISModules.EsriMap,
        GraphicsLayer: arcGISModules.GraphicsLayer,
        Ground: arcGISModules.Ground,
        ElevationLayer: arcGISModules.ElevationLayer,
        SceneLayer: arcGISModules.SceneLayer,
        reactiveUtils: arcGISModules.reactiveUtils
      },
      {
        onBoundsChanged: handleBoundsChanged,
        onVenueClick: handleVenueClick
      }
    )
  }

  // Emit initial bounds
  if (mapBounds) {
    mapBounds.emitBoundsImmediate(currentView.value.getView(), (bounds) => {
      emit('bounds-changed', bounds)
    })
  }

  // Update markers if venues already exist
  if (props.venues.length > 0 && venueMarkers) {
    venueMarkers.updateMarkers(currentView.value.getVenueGraphicsLayer(), props.venues)
  }
}

// Lifecycle hooks
onMounted(() => {
  if (isMappingConsented.value) initializeMap()
})

watch(isMappingConsented, async (consented) => {
  if (consented && !arcGISModules) {
    await nextTick()
    initializeMap()
  }
})

onUnmounted(() => {
  if (mapBounds) {
    mapBounds.cleanup()
  }
  mapView.cleanup()
  sceneView.cleanup()
  userLocationMarker?.clearUserLocation(currentView.value.getVenueGraphicsLayer())
})

// Watchers
watch(() => props.venues, (value) => {
  if (venueMarkers) {
      venueMarkers.updateMarkers(currentView.value.getVenueGraphicsLayer(), value)
    }
  },
  { deep: true }
)

watch(() => props.center, (newCenter) => {
    currentView.value.setCenter(newCenter)
  }
)

// Watch for view mode changes and reinitialize
watch(viewMode, async () => {
  if (arcGISModules) {
    await initializeView()
  }
})
</script>

<template>
  <div class="w-full h-full min-h-[400px] relative">
    <!-- Map consent placeholder -->
    <div
      v-if="!isMappingConsented"
      class="w-full h-full flex flex-col items-center justify-center gap-4 bg-gray-50 text-center px-6"
    >
      <i class="pi pi-map text-5xl text-gray-300" aria-hidden="true" />
      <div>
        <p class="font-semibold text-gray-700">{{ $t('cookies.map.placeholder.title') }}</p>
        <p class="text-sm text-gray-500 mt-1">{{ $t('cookies.map.placeholder.description') }}</p>
      </div>
      <Button
        unstyled
        class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
        @click="cookieConsentStore.openPopup()"
      >
        {{ $t('cookies.map.placeholder.button') }}
      </Button>
    </div>

    <div v-else ref="mapContainer" class="w-full h-full arcgis-map-container" />

    <!-- Top Bar with Search and View Toggle -->
    <div v-if="isMappingConsented" class="absolute top-4 left-4 right-4 z-[200] flex items-center gap-2">
      <div class="flex-1 lg:w-full lg:max-w-xl lg:mx-auto">
        <MapSearchBar @place-selected="handlePlaceSelected" />
      </div>
      <div class="absolute bottom-[-3rem] lg:relative lg:bottom-auto flex-shrink-0 flex items-center gap-2">
      <!-- Locate Me Button (Mobile Only) -->
        <MapViewToggle />
        <LocateButton
          class="lg:hidden"
          variant="mobile"
          :is-located="isUserLocated"
          :is-at-location="isAtUserLocation"
          @locate="emit('locate-me')"
        />
      </div>
    </div>

    <MapLegend v-if="isMappingConsented" />
    <MapLoadingOverlay v-if="isMappingConsented" :is-loading="isLoading" />
  </div>
</template>

<style scoped>
.arcgis-map-container :deep(.esri-view-surface),
.arcgis-map-container :deep(.esri-view-surface::after) {
  outline: none !important;
  background: none !important;
}

/* Hide zoom controls on mobile */
@media (max-width: 1023px) {
  .arcgis-map-container :deep(.esri-ui-top-left .esri-zoom) {
    display: none;
  }
}
</style>
