import { storeToRefs } from 'pinia'
import {
  NominatimAmenity,
  NominatimLeisure,
  NominatimTourism,
  VenueErrorCode
} from '~/shared/enums'
import type {
    ApiResponse,
    VenueResponse,
    BoundingBox,
    SearchResult,
    Venue,
    VenueFilters,
    VenueType
} from '~/shared/types'
import { useVenuesStore } from '~/stores/venues'
import { useCoordinates } from './useCoordinates'
import { useSunCalculator } from './useSunCalculator'
import { useSunlightStatus } from './useSunlightStatus'
import { useVenue } from './useVenue'

const MAX_BBOX_DEGREES = 0.05

const AMENITY_TO_VENUE_TYPE: Partial<Record<NominatimAmenity, VenueType>> = {
  [NominatimAmenity.Bar]: 'bar',
  [NominatimAmenity.Pub]: 'bar',
  [NominatimAmenity.Restaurant]: 'restaurant',
  [NominatimAmenity.Cafe]: 'cafe',
  [NominatimAmenity.Biergarten]: 'biergarten'
}

const TOURISM_TO_VENUE_TYPE: Partial<Record<NominatimTourism, VenueType>> = {
  [NominatimTourism.Hotel]: 'restaurant',
  [NominatimTourism.Hostel]: 'restaurant'
}

const TYPE_SUBSTRING_TO_VENUE_TYPE: Array<[string, VenueType]> = [
  [NominatimAmenity.Bar, 'bar'],
  [NominatimAmenity.Pub, 'bar'],
  [NominatimAmenity.Restaurant, 'restaurant'],
  [NominatimAmenity.Cafe, 'cafe'],
  ['coffee', 'cafe'],
  [NominatimAmenity.Biergarten, 'biergarten']
]

/**
 * Map Nominatim type to VenueType
 */
function mapNominatimTypeToVenueType(
  type: string,
  address?: SearchResult['address']
): VenueType {
  if (address?.amenity) {
    const mapped = AMENITY_TO_VENUE_TYPE[address.amenity.toLowerCase() as NominatimAmenity]
    if (mapped) return mapped
  }

  if (address?.tourism) {
    const mapped = TOURISM_TO_VENUE_TYPE[address.tourism.toLowerCase() as NominatimTourism]
    if (mapped) return mapped
  }

  if (address?.leisure === NominatimLeisure.Biergarten) return 'biergarten'

  const typeLower = type.toLowerCase()
  const match = TYPE_SUBSTRING_TO_VENUE_TYPE.find(([key]) => typeLower.includes(key))
  return match?.[1] ?? 'cafe'
}

/**
 * Build address string from SearchResult
 */
function buildAddressFromSearchResult(result: SearchResult): string {
  if (!result.address) return result.name

  const parts: string[] = []
  const addr = result.address

  if (addr.road) {
    if (addr.house_number) {
      parts.push(`${addr.road} ${addr.house_number}`)
    } else {
      parts.push(addr.road)
    }
  }

  const city = addr.city || addr.town || addr.village
  if (city) parts.push(city)

  if (addr.postcode) parts.push(addr.postcode)
  if (addr.country) parts.push(addr.country)

  return parts.length > 0 ? parts.join(', ') : result.name
}

/**
 * Convert API venue response to Venue model
 * Stores i18n keys as reason — translated at the view layer via $t()
 */
function apiVenueToDomain(
  apiVenue: VenueResponse,
  coordinatesUtil: ReturnType<typeof useCoordinates>,
  sunlightStatusUtil: ReturnType<typeof useSunlightStatus>,
  venueUtil: ReturnType<typeof useVenue>
): Venue {
  const coords = coordinatesUtil.create(apiVenue.latitude, apiVenue.longitude)

  let status
  if (apiVenue.sunlightStatus) {
    switch (apiVenue.sunlightStatus) {
      case 'sunny':
        status = sunlightStatusUtil.createSunny(
          1,
          'sunlight.description.directSunlight'
        )
        break
      case 'shaded':
        status = sunlightStatusUtil.createShaded(
          1,
          'sunlight.description.inBuildingShadow'
        )
        break
      case 'partially_sunny':
        status = sunlightStatusUtil.createPartiallySunny(
          0.7,
          'sunlight.description.partialShadow'
        )
        break
    }
  }

  return venueUtil.create({
    id: apiVenue.id,
    name: apiVenue.name,
    type: (apiVenue.type as VenueType) || 'bar',
    coordinates: coords,
    address: apiVenue.address,
    outdoor_seating: apiVenue.outdoor_seating,
    phone: apiVenue.phone,
    website: apiVenue.website,
    openingHours: apiVenue.openingHours,
    rating: apiVenue.rating,
    priceRange: apiVenue.priceRange,
    description: apiVenue.description,
    socialMedia: apiVenue.socialMedia,
    sunlightStatus: status
  })
}

function isBboxTooLarge(bbox: BoundingBox): boolean {
  return (
    bbox.north - bbox.south > MAX_BBOX_DEGREES ||
    bbox.east - bbox.west > MAX_BBOX_DEGREES
  )
}

function classifyFetchError(e: Error): VenueErrorCode {
  const err = e as Error & {
    statusCode?: number;
    data?: { statusMessage?: string };
  }
  const statusMessage = err.data?.statusMessage || ''

  if (statusMessage.includes('Bounding box too large'))
    return VenueErrorCode.BBOX_TOO_LARGE
  if (err.statusCode === 0 || e.message === 'Failed to fetch')
    return VenueErrorCode.NETWORK
  return VenueErrorCode.FETCH_FAILED
}

/**
 * useVenues Composable
 * Manages venues state and provides venue fetching/filtering actions
 * Combines Pinia store for shared state with business logic
 */
export function useVenues() {
  const store = useVenuesStore()
  const coordinates = useCoordinates()
  const sunlightStatus = useSunlightStatus()
  const sunCalculator = useSunCalculator()
  const venue = useVenue()

  const {
    venues,
    loading,
    error,
    lastBbox,
    filters,
    sunnyVenues,
    shadedVenues,
    filteredVenues
  } = storeToRefs(store)

  /**
   * Fetch venues within a bounding box from Overpass API (real-time)
   */
  async function fetchVenuesByBoundingBox(
    bbox: BoundingBox,
    datetime?: Date
  ): Promise<VenueErrorCode | null> {
    if (isBboxTooLarge(bbox)) {
      store.error = VenueErrorCode.BBOX_TOO_LARGE
      return VenueErrorCode.BBOX_TOO_LARGE
    }

    store.loading = true
    store.error = null

    const { data, error: fetchError } = await attempt(async () => {
      const params = new URLSearchParams({
        south: bbox.south.toString(),
        west: bbox.west.toString(),
        north: bbox.north.toString(),
        east: bbox.east.toString(),
        ...(datetime && { datetime: datetime.toISOString() })
      })

      return $fetch<ApiResponse>(`/api/venues?${params}`)
    })

    if (fetchError) {
      const errorCode = classifyFetchError(fetchError)
      store.error = errorCode
      store.venues = []
      store.loading = false

      return errorCode
    }

    store.venues = data.venues.map((apiVenue) =>
      apiVenueToDomain(apiVenue, coordinates, sunlightStatus, venue)
    )
    store.lastBbox = bbox
    store.loading = false

    return null
  }

  /**
   * Fetch venues from backend database (stored/cached data)
   * Faster but potentially stale
   */
  async function fetchStoredVenues(
    bbox: BoundingBox,
    datetime?: Date,
    options?: { maxAgeDays?: number }
  ): Promise<VenueErrorCode | null> {
    if (isBboxTooLarge(bbox)) {
      store.error = VenueErrorCode.BBOX_TOO_LARGE
      return VenueErrorCode.BBOX_TOO_LARGE
    }

    store.loading = true
    store.error = null

    const { data, error: fetchError } = await attempt(async () => {
      const params = new URLSearchParams({
        south: bbox.south.toString(),
        west: bbox.west.toString(),
        north: bbox.north.toString(),
        east: bbox.east.toString(),
        ...(datetime && { datetime: datetime.toISOString() }),
        ...(options?.maxAgeDays && {
          maxAgeDays: options.maxAgeDays.toString()
        })
      })

      return $fetch<ApiResponse>(`/api/venues/stored?${params}`)
    })

    if (fetchError) {
      const errorCode = classifyFetchError(fetchError)
      store.error = errorCode
      store.venues = []
      store.loading = false

      return errorCode
    }

    store.venues = data.venues.map((apiVenue) =>
      apiVenueToDomain(apiVenue, coordinates, sunlightStatus, venue)
    )
    store.lastBbox = bbox
    store.loading = false

    return null
  }

  /**
   * Fetch venues from Overpass and automatically sync to backend
   * Best of both worlds: real-time data + persistence
   */
  async function fetchVenuesWithAutoSync(
    bbox: BoundingBox,
    datetime?: Date
  ): Promise<VenueErrorCode | null> {
    // First fetch from Overpass (for real-time accuracy)
    const error = await fetchVenuesByBoundingBox(bbox, datetime)

    if (error) {
      return error
    }

    // Then sync to backend asynchronously (don't wait for it)
    syncVenuesToBackend(bbox).catch((syncError) => {
      console.warn('[useVenues] Background sync failed:', syncError)
      // Don't propagate sync errors to user - they already have their data
    })

    return null
  }

  /**
   * Sync venues from Overpass to backend database
   * Returns sync statistics
   */
  async function syncVenuesToBackend(
    bbox: BoundingBox
  ): Promise<{ inserted: number; updated: number; total: number } | null> {
    if (isBboxTooLarge(bbox)) {
      console.warn('[useVenues] Cannot sync - bbox too large')
      return null
    }

    const { data, error: syncError } = await attempt(async () => {
      const params = new URLSearchParams({
        south: bbox.south.toString(),
        west: bbox.west.toString(),
        north: bbox.north.toString(),
        east: bbox.east.toString()
      })

      return $fetch<{
        success: boolean;
        message: string;
        data: {
          inserted: number;
          updated: number;
          total: number;
        };
      }>(`/api/venues/sync?${params}`, {
        method: 'POST'
      })
    })

    if (syncError) {
      console.error('[useVenues] Sync failed:', syncError)
      return null
    }

    console.info('[useVenues] Sync completed:', data.data)
    return data.data
  }

  /**
   * Update venue filters
   */
  function setFilters(newFilters: Partial<VenueFilters>): void {
    store.filters = { ...store.filters, ...newFilters }
  }

  /**
   * Add a single venue (e.g., from search results)
   */
  function addVenue(newVenue: Venue): void {
    store.addVenue(newVenue)
  }

  /**
   * Remove a venue by ID
   */
  function removeVenue(venueId: string): void {
    store.removeVenue(venueId)
  }

  /**
   * Create a venue from a search result (Nominatim)
   */
  function createVenueFromSearchResult(
    searchResult: SearchResult,
    datetime?: Date
  ): Venue {
    const coords = coordinates.create(
      searchResult.latitude,
      searchResult.longitude
    )
    const venueName = searchResult.name.split(',')[0] || searchResult.name
    const venueType = mapNominatimTypeToVenueType(
      searchResult.type,
      searchResult.address
    )
    const address = buildAddressFromSearchResult(searchResult)

    // Calculate sunlight status for the location if datetime is provided
    let sunlightStatusInfo = undefined
    if (datetime) {
      const isDaytime = sunCalculator.isDaytime(coords, datetime)

      if (isDaytime) {
        // If sun is above horizon, the location is sunny
        sunlightStatusInfo = sunlightStatus.createSunny(
          1,
          'sunlight.description.directSunlight'
        )
      } else {
        // If sun is below horizon, it's night
        sunlightStatusInfo = sunlightStatus.createNight()
      }
    }

    return venue.create({
      id: `search_${searchResult.id}`,
      name: venueName,
      type: venueType,
      coordinates: coords,
      address: address,
      sunlightStatus: sunlightStatusInfo
    })
  }

  return {
    // State
    venues,
    loading,
    error,
    lastBbox,
    filters,

    // Computed
    sunnyVenues,
    shadedVenues,
    filteredVenues,

    // Actions
    fetchVenuesByBoundingBox,
    fetchStoredVenues,
    fetchVenuesWithAutoSync,
    syncVenuesToBackend,
    setFilters,
    addVenue,
    removeVenue,
    createVenueFromSearchResult
  }
}
