import { ref } from 'vue'
import type { SearchResult } from '@/shared/types'

// useNominatimSearch composable
// Searches for places using the server-side Nominatim geocoding API.
export function useNominatimSearch() {
  const searchResults = ref<SearchResult[]>([])
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)

  const { public: { apiBaseUrl } } = useRuntimeConfig()
  const apiUrl = (path: string) => `${apiBaseUrl}${path}`

  // Search for a place by name.
  // query: the search string, e.g. "La Rambla Barcelona" or "Plaza Mayor Madrid".
  // Returns an array of search results.
  async function searchPlace(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      searchResults.value = []
      return []
    }

    isSearching.value = true
    searchError.value = null

    try {
      // Call server API endpoint
      const response = await $fetch<{ results: SearchResult[]; count: number }>(
        apiUrl('/api/search'),
        {
          query: {
            q: query,
            limit: 5
          }
        }
      )

      searchResults.value = response.results
      return response.results
    } catch (error) {
      console.error('Search error:', error)
      searchError.value = 'search.error.failed'
      searchResults.value = []
      return []
    } finally {
      isSearching.value = false
    }
  }

  // Reverse geocode: look up the address for a given latitude and longitude.
  // Returns the address string, or null if the lookup fails.
  async function reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    try {
      // Call server API endpoint
      const response = await $fetch<{ address: string | null; found: boolean }>(
        apiUrl('/api/reverse-geocode'),
        {
          query: {
            lat: latitude,
            lon: longitude
          }
        }
      )

      return response.address
    } catch (error) {
      console.error('Reverse geocode error:', error)
      return null
    }
  }

  // Clear search results and reset any error.
  function clearResults(): void {
    searchResults.value = []
    searchError.value = null
  }

  return {
    searchResults,
    isSearching,
    searchError,
    searchPlace,
    reverseGeocode,
    clearResults
  }
}
