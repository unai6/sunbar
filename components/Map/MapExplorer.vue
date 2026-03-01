<script setup lang="ts">
import Button from 'primevue/button'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { IMapGateway } from '~/composables/map-adapter/IMapGateway'
import { useVenues } from '~/composables/useVenues'
import type { SearchResult, Venue } from '~/shared/types'
import { useCookieConsentStore } from '~/stores/cookieConsent'
import { attempt } from '~/utils/attempt'

type Props = {
  gateway: IMapGateway
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

const { gateway } = props
const { createVenueFromSearchResult, addVenue } = useVenues()
const cookieConsentStore = useCookieConsentStore()
const { isMappingConsented } = storeToRefs(cookieConsentStore)

const mapContainerRef = useTemplateRef<HTMLDivElement | null>('mapContainer')
const isLoading = computed(() => gateway.isLoading.value)

let initialized = false

defineExpose({
  flyTo: (lat: number, lng: number, zoom?: number) => gateway.flyTo(lat, lng, zoom),
  closePopups: () => gateway.closePopups(),
  setUserLocation: (lat: number, lng: number) => gateway.setUserLocation(lat, lng)
})

function handleVenueClick(venueId: string): void {
  const venue = props.venues.find(v => v.id === venueId)
  if (venue) emit('venue-click', venue)
}

function handlePlaceSelected(searchResult: SearchResult): void {
  const venue = createVenueFromSearchResult(searchResult, props.selectedDateTime)
  addVenue(venue)
  gateway.flyTo(searchResult.latitude, searchResult.longitude, 16)
}

async function initializeMap(): Promise<void> {
  if (!mapContainerRef.value || initialized) return

  const { error } = await attempt(() =>
    gateway.initialize(
      mapContainerRef.value!,
      props.center,
      props.zoom,
      {
        onBoundsChanged: (bounds) => emit('bounds-changed', bounds),
        onVenueClick: handleVenueClick
      }
    )
  )

  if (error) {
    console.error('Failed to initialize map:', error)
    return
  }

  initialized = true
  emit('map-ready')
}

onMounted(() => {
  if (isMappingConsented.value) initializeMap()
})

watch(isMappingConsented, async (consented) => {
  if (consented && !initialized) {
    await nextTick()
    initializeMap()
  }
})

onUnmounted(() => {
  gateway.cleanup()
})

watch(() => props.venues, (venues) => {
  gateway.updateVenueMarkers(venues)
}, { deep: true })

watch(() => props.center, (center) => {
  gateway.setCenter(center)
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
