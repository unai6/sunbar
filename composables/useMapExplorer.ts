import { ref, onMounted } from 'vue'
import type { Venue } from '~/domain/entities/Venue'
import type { BoundingBox } from '~/domain/repositories/VenueRepository'
import type { VenueFilters, VenueErrorCode } from '~/composables/useVenues'

const DEFAULT_CENTER: [number, number] = [41.39, 2.1] // Barcelona
const DEFAULT_ZOOM = 15
const LOCATE_ME_ZOOM = 16
const VENUE_SELECT_ZOOM = 17

export interface MapRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void
  closePopups: () => void
}

export function useMapExplorer() {
  // Composables
  const {
    loading,
    filters,
    sunnyVenues,
    shadedVenues,
    filteredVenues,
    fetchVenuesByBoundingBox,
    setFilters
  } = useVenues()

  const {
    sunInfo,
    selectedDateTime,
    updateSunInfo,
    setDateTime
  } = useSunInfo()

  const { state: geoState, getCurrentPosition } = useGeolocation()

  // Map state
  const mapRef = ref<MapRef | null>(null)
  const mapCenter = ref<[number, number]>(DEFAULT_CENTER)
  const mapZoom = ref(DEFAULT_ZOOM)
  const currentBounds = ref<BoundingBox | null>(null)

  // Venue selection state
  const selectedVenueId = ref<string | null>(null)
  const selectedVenue = ref<Venue | null>(null)
  const showVenueDetail = ref(false)

  // Helpers
  function getBoundsCenter(bounds: BoundingBox): { lat: number; lng: number } {
    return {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2
    }
  }

  // Actions
  async function handleSearch(): Promise<VenueErrorCode | null> {
    if (!currentBounds.value) return null

    const errorCode = await fetchVenuesByBoundingBox(currentBounds.value, selectedDateTime.value)

    const { lat, lng } = getBoundsCenter(currentBounds.value)
    updateSunInfo(lat, lng, selectedDateTime.value)

    return errorCode
  }

  function handleBoundsChanged(bounds: BoundingBox): void {
    currentBounds.value = bounds

    const { lat, lng } = getBoundsCenter(bounds)
    updateSunInfo(lat, lng, selectedDateTime.value)
  }

  async function handleDateTimeUpdate(datetime: Date): Promise<VenueErrorCode | null> {
    setDateTime(datetime)

    if (currentBounds.value) {
      const { lat, lng } = getBoundsCenter(currentBounds.value)
      updateSunInfo(lat, lng, datetime)

      return fetchVenuesByBoundingBox(currentBounds.value, datetime)
    }

    return null
  }

  async function handleFilterUpdate(newFilters: Partial<VenueFilters>): Promise<VenueErrorCode | null> {
    setFilters(newFilters)
    return handleSearch()
  }

  function handleVenueClick(venue: Venue): void {
    mapRef.value?.closePopups()
    selectedVenue.value = venue
    showVenueDetail.value = true
  }

  function handleVenueSelect(venue: Venue): void {
    selectedVenueId.value = venue.id
    mapRef.value?.flyTo(venue.coordinates.latitude, venue.coordinates.longitude, VENUE_SELECT_ZOOM)
  }

  async function handleLocateMe(): Promise<void> {
    await getCurrentPosition()
    if (geoState.value.latitude && geoState.value.longitude) {
      mapCenter.value = [geoState.value.latitude, geoState.value.longitude]
      mapZoom.value = LOCATE_ME_ZOOM
      mapRef.value?.flyTo(geoState.value.latitude, geoState.value.longitude, LOCATE_ME_ZOOM)
    }
  }

  // Lifecycle
  onMounted(async () => {
    const { error } = await attempt(() => getCurrentPosition())

    if (!error && geoState.value.latitude && geoState.value.longitude) {
      mapCenter.value = [geoState.value.latitude, geoState.value.longitude]
      updateSunInfo(geoState.value.latitude, geoState.value.longitude)
    } else {
      updateSunInfo(mapCenter.value[0], mapCenter.value[1])
    }
  })

  return {
    // State
    loading,
    filters,
    sunnyVenues,
    shadedVenues,
    filteredVenues,
    sunInfo,
    selectedDateTime,
    mapRef,
    mapCenter,
    mapZoom,
    selectedVenueId,
    selectedVenue,
    showVenueDetail,

    // Actions
    handleSearch,
    handleBoundsChanged,
    handleDateTimeUpdate,
    handleFilterUpdate,
    handleVenueClick,
    handleVenueSelect,
    handleLocateMe
  }
}
