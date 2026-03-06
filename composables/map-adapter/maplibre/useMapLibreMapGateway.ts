import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Map as MaplibreMap, Marker, GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'
import type { Venue } from '@/shared/types'
import type { IMapGateway, MapCallbacks } from '../IMapGateway'
import { useVenue } from '@/composables/useVenue'
import { useMapViewStore } from '@/stores/mapView'

// OpenFreeMap liberty style — free, no API key required, full OSM vector tiles
// with building extrusion data for 3D rendering.
// https://openfreemap.org
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

const FLY_DURATION_MS = 1000
const BOUNDS_DEBOUNCE_MS = 500
const PITCH_3D = 60
const PITCH_2D = 0

// IMapGateway implementation backed by MapLibre GL JS and OpenStreetMap tiles.
export function useMapLibreMapGateway(): IMapGateway {
  const { isSunny } = useVenue()
  const mapViewStore = useMapViewStore()
  const { viewMode } = storeToRefs(mapViewStore)

  // Lazily-loaded module reference — populated inside initialize()
  let ml: typeof import('maplibre-gl') | null = null

  let map: MaplibreMap | null = null
  let userMarker: Marker | null = null
  let boundsTimer: ReturnType<typeof setTimeout> | null = null
  let storedCallbacks: MapCallbacks | null = null
  let storedVenues: Venue[] = []

  const isLoading = ref(true)

  // 2D ↔ 3D: tilt the camera instead of swapping layers.
  // The liberty style already contains fill-extrusion building layers which
  // become visible as soon as pitch > 0.
  watch(viewMode, (mode) => {
    map?.easeTo({ pitch: mode === '3d' ? PITCH_3D : PITCH_2D, duration: FLY_DURATION_MS })
  })

  function scheduleBoundsEmit(): void {
    if (boundsTimer) clearTimeout(boundsTimer)
    boundsTimer = setTimeout(() => {
      if (!map || !storedCallbacks) return
      const b = map.getBounds()
      storedCallbacks.onBoundsChanged({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast()
      })
    }, BOUNDS_DEBOUNCE_MS)
  }

  function flushBoundsNow(): void {
    if (!map || !storedCallbacks) return
    const b = map.getBounds()
    storedCallbacks.onBoundsChanged({
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast()
    })
  }

  function getVenueFeatureCollection(venues: Venue[]) {
    return {
      type: 'FeatureCollection' as const,
      features: venues.map((v) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [v.coordinates.longitude, v.coordinates.latitude] as [number, number]
        },
        properties: {
          id: v.id,
          name: v.name,
          isSunny: isSunny(v)
        }
      }))
    }
  }

  function applyVenueData(venues: Venue[]): void {
    if (!map) return
    const source = map.getSource('venues') as GeoJSONSource | undefined
    source?.setData(getVenueFeatureCollection(venues))
  }

  function addVenueLayers(): void {
    if (!map) return

    map.addSource('venues', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    })

    // Sunny venues: amber circle matching ArcGIS symbol colours
    map.addLayer({
      id: 'venues-sunny',
      type: 'circle',
      source: 'venues',
      filter: ['==', ['get', 'isSunny'], true],
      paint: {
        'circle-radius': 8,
        'circle-color': '#FFC107',
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-width': 2.5
      }
    })

    // Shaded venues: grey circle
    map.addLayer({
      id: 'venues-shaded',
      type: 'circle',
      source: 'venues',
      filter: ['==', ['get', 'isSunny'], false],
      paint: {
        'circle-radius': 6,
        'circle-color': '#6B7280',
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-width': 2
      }
    })

    const handleClick = (e: MapLayerMouseEvent) => {
      const id = (e.features?.[0]?.properties?.id) as string | undefined
      if (id) storedCallbacks?.onVenueClick(id)
    }

    for (const layer of ['venues-sunny', 'venues-shaded'] as const) {
      map.on('click', layer, handleClick)
      map.on('mouseenter', layer, () => { if (map) map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', layer, () => { if (map) map.getCanvas().style.cursor = '' })
    }
  }

  async function initialize(
    container: HTMLDivElement,
    center: [number, number],
    zoom: number,
    callbacks: MapCallbacks
  ): Promise<void> {
    storedCallbacks = callbacks
    isLoading.value = true

    try {
      ml = await import('maplibre-gl')
      await import('maplibre-gl/dist/maplibre-gl.css')

      map = new ml.Map({
        container,
        style: STYLE_URL,
        center: [center[1], center[0]], // MapLibre uses [lng, lat]
        zoom,
        pitch: viewMode.value === '3d' ? PITCH_3D : PITCH_2D
      })

      await new Promise<void>((resolve, reject) => {
        map!.on('load', resolve)
        map!.on('error', (e) => reject(new Error(e.error?.message ?? 'MapLibre load error')))
      })

      addVenueLayers()

      // Restore venues if updateVenueMarkers was called before initialize completed
      if (storedVenues.length > 0) applyVenueData(storedVenues)

      map.on('moveend', scheduleBoundsEmit)
      flushBoundsNow()
    } finally {
      isLoading.value = false
    }
  }

  function cleanup(): void {
    if (boundsTimer) clearTimeout(boundsTimer)
    userMarker?.remove()
    userMarker = null
    map?.remove()
    map = null
  }

  function flyTo(latitude: number, longitude: number, zoom?: number): void {
    map?.flyTo({
      center: [longitude, latitude],
      zoom: zoom ?? map.getZoom(),
      duration: FLY_DURATION_MS
    })
  }

  function setCenter(center: [number, number]): void {
    map?.setCenter([center[1], center[0]])
  }

  function setZoom(zoom: number): void {
    map?.setZoom(zoom)
  }

  function closePopups(): void {
    // MapLibre popups are not used, venue clicks emit events directly
  }

  function updateVenueMarkers(venues: Venue[]): void {
    storedVenues = venues
    applyVenueData(venues)
  }

  function setUserLocation(latitude: number, longitude: number): void {
    if (!map || !ml) return

    if (userMarker) {
      userMarker.setLngLat([longitude, latitude])
      return
    }

    // Custom pin DOM element matching the ArcGIS user location symbol style
    const el = document.createElement('div')
    el.style.cssText = [
      'width:20px', 'height:20px', 'border-radius:50%',
      'background:#FF0000', 'border:3px solid #FFFFFF',
      'box-shadow:0 2px 6px rgba(0,0,0,0.4)', 'cursor:default'
    ].join(';')

    userMarker = new ml.Marker({ element: el })
      .setLngLat([longitude, latitude])
      .addTo(map)
  }

  function clearUserLocation(): void {
    userMarker?.remove()
    userMarker = null
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
