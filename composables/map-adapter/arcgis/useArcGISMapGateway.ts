import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Venue } from '@/shared/types'
import type { IMapGateway, MapCallbacks } from '../IMapGateway'
import { useArcGISModules } from './useArcGISModules'
import { useMapView } from './useMapView'
import { useSceneView } from './useSceneView'
import { useVenueMarkers } from './useVenueMarkers'
import { useVenueSymbols } from './useVenueSymbols'
import { useUserLocationMarker } from './useUserLocationMarker'
import { useMapBounds } from './useMapBounds'
import { useVenue } from '@/composables/useVenue'
import { useMapViewStore } from '@/stores/mapView'

// IMapGateway implementation backed by the ArcGIS Maps SDK.
export function useArcGISMapGateway(): IMapGateway {
  const { isSunny } = useVenue()
  const { loadModules } = useArcGISModules()
  const mapView = useMapView()
  const sceneView = useSceneView()
  const mapViewStore = useMapViewStore()
  const { viewMode } = storeToRefs(mapViewStore)

  // ArcGIS module references: populated after the first loadModules() call
  let arcGISModules: Awaited<ReturnType<typeof loadModules>> | null = null

  // Marker / bounds helpers: initialised after modules are loaded
  let venueMarkers: ReturnType<typeof useVenueMarkers> | null = null
  let userLocationMarker: ReturnType<typeof useUserLocationMarker> | null = null
  let mapBounds: ReturnType<typeof useMapBounds> | null = null

  // Stored initialisation params so initializeView() can be called on mode switch
  let storedContainer: HTMLDivElement | null = null
  let storedCenter: [number, number] = [0, 0]
  let storedZoom: number = 12
  let storedCallbacks: MapCallbacks | null = null

  // Last known venue list: restored to the new view after a mode switch
  let storedVenues: Venue[] = []

  // Loading reflects the active view's own loading flag
  const isLoading = computed(() =>
    (viewMode.value === '2d' ? mapView : sceneView).isLoading.value
  )

  function activeView() {
    return viewMode.value === '2d' ? mapView : sceneView
  }

  function handleBoundsChanged(): void {
    if (mapBounds && storedCallbacks) {
      mapBounds.emitBounds(activeView().getView(), storedCallbacks.onBoundsChanged)
    }
  }

  async function initializeView(): Promise<void> {
    if (!storedContainer || !arcGISModules || !storedCallbacks) return

    // The outgoing view is the opposite of where we're switching to
    const outgoingView = viewMode.value === '2d' ? sceneView : mapView
    const center = outgoingView.getCenter() ?? storedCenter
    outgoingView.cleanup()

    const viewCallbacks = {
      onBoundsChanged: handleBoundsChanged,
      onVenueClick: (venueId: string) => storedCallbacks!.onVenueClick(venueId)
    }

    if (viewMode.value === '2d') {
      await mapView.initialize(
        storedContainer,
        center,
        storedZoom,
        {
          MapView: arcGISModules.MapView,
          EsriMap: arcGISModules.EsriMap,
          GraphicsLayer: arcGISModules.GraphicsLayer,
          reactiveUtils: arcGISModules.reactiveUtils
        },
        viewCallbacks
      )
    } else {
      await sceneView.initialize(
        storedContainer,
        center,
        storedZoom,
        {
          SceneView: arcGISModules.SceneView,
          EsriMap: arcGISModules.EsriMap,
          GraphicsLayer: arcGISModules.GraphicsLayer,
          Ground: arcGISModules.Ground,
          ElevationLayer: arcGISModules.ElevationLayer,
          SceneLayer: arcGISModules.SceneLayer,
          reactiveUtils: arcGISModules.reactiveUtils
        },
        viewCallbacks
      )
    }

    // Emit initial bounds immediately after view is ready
    if (mapBounds && storedCallbacks) {
      mapBounds.emitBoundsImmediate(activeView().getView(), storedCallbacks.onBoundsChanged)
    }

    // Restore venue markers on the new view
    if (storedVenues.length > 0 && venueMarkers) {
      venueMarkers.updateMarkers(activeView().getVenueGraphicsLayer(), storedVenues)
    }
  }

  // Reinitialise whenever the user toggles 2D ↔ 3D
  watch(viewMode, async () => {
    if (arcGISModules) {
      await initializeView()
    }
  })

  async function initialize(
    container: HTMLDivElement,
    center: [number, number],
    zoom: number,
    callbacks: MapCallbacks
  ): Promise<void> {
    storedContainer = container
    storedCenter = center
    storedZoom = zoom
    storedCallbacks = callbacks

    arcGISModules = await loadModules()

    const venueSymbols = useVenueSymbols(arcGISModules.SimpleMarkerSymbol)
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

    await initializeView()
  }

  function cleanup(): void {
    // Clear user location pin before the graphics layer is destroyed
    userLocationMarker?.clearUserLocation(activeView().getVenueGraphicsLayer())
    mapBounds?.cleanup()
    mapView.cleanup()
    sceneView.cleanup()
  }

  function flyTo(latitude: number, longitude: number, zoom?: number): void {
    activeView().flyTo(latitude, longitude, zoom)
  }

  function setCenter(center: [number, number]): void {
    activeView().setCenter(center)
  }

  function setZoom(zoom: number): void {
    activeView().setZoom(zoom)
  }

  function closePopups(): void {
    activeView().closePopups()
  }

  function updateVenueMarkers(venues: Venue[]): void {
    storedVenues = venues
    if (venueMarkers) {
      venueMarkers.updateMarkers(activeView().getVenueGraphicsLayer(), venues)
    }
  }

  function setUserLocation(latitude: number, longitude: number): void {
    userLocationMarker?.setUserLocation(
      activeView().getVenueGraphicsLayer(),
      latitude,
      longitude
    )
  }

  function clearUserLocation(): void {
    userLocationMarker?.clearUserLocation(activeView().getVenueGraphicsLayer())
  }

  return {
    isLoading,
    initialize,
    cleanup,
    flyTo,
    setCenter,
    setZoom,
    closePopups,
    updateVenueMarkers,
    setUserLocation,
    clearUserLocation
  }
}
