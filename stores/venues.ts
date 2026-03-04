import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useVenue } from '~/composables/useVenue'
import type { ApiResponse, BoundingBox, Venue, VenueFilters } from '~/shared/types'

export type BboxCacheEntry = {
  venues: Venue[]
  sunPosition: ApiResponse['sunPosition']
  fetchedAt: number
}

export const BBOX_CACHE_TTL_MS = 5 * 60 * 1000

/**
 * Venues Store
 * Holds shared state for venues across the app
 * Business logic is handled in the useVenues composable
 */
export const useVenuesStore = defineStore('venues', () => {
  const venue = useVenue()

  const venues = ref<Venue[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastBbox = ref<BoundingBox | null>(null)
  const bboxCache = ref<Record<string, BboxCacheEntry>>({})
  const filters = ref<VenueFilters>({
    onlySunny: false,
    onlyWithOutdoorSeating: false
  })

  // Computed values for convenience
  const sunnyVenues = computed(() =>
    venues.value.filter((venueItem) => venue.isSunny(venueItem))
  )
  const shadedVenues = computed(() =>
    venues.value.filter((venueItem) => !venue.isSunny(venueItem))
  )
  const filteredVenues = computed(() => {
    let result = venues.value

    if (filters.value.onlySunny) {
      result = result.filter((venueItem) => venue.isSunny(venueItem))
    }

    if (filters.value.onlyWithOutdoorSeating) {
      result = result.filter((venueItem) => venue.hasOutdoorSeating(venueItem))
    }

    return result
  })

  /**
   * Add a single venue (e.g., from search results)
   */
  function addVenue(newVenue: Venue): void {
    // Check if venue already exists
    const existingIndex = venues.value.findIndex((v) => v.id === newVenue.id)
    if (existingIndex >= 0) {
      // Replace existing venue
      venues.value[existingIndex] = newVenue
    } else {
      // Add new venue
      venues.value.push(newVenue)
    }
  }

  /**
   * Remove a venue by ID
   */
  function removeVenue(venueId: string): void {
    venues.value = venues.value.filter((v) => v.id !== venueId)
  }

  return {
    venues,
    loading,
    error,
    lastBbox,
    bboxCache,
    filters,
    sunnyVenues,
    shadedVenues,
    filteredVenues,
    addVenue,
    removeVenue
  }
})
