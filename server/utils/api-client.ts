/**
 * API Client for sunbar-api backend
 *
 * Provides a server-side client to communicate with the Fastify backend.
 * This keeps backend URL configuration server-side only.
 */

import type { H3Event } from 'h3'

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

interface VenueQueryParams {
  south?: number;
  west?: number;
  north?: number;
  east?: number;
  onlyOutdoorSeating?: boolean;
  maxAgeDays?: number;
  limit?: number;
  skip?: number;
}

interface BackendVenue {
  venueId: string;
  osmId: string;
  osmType: 'node' | 'way' | 'relation';
  name: string;
  venueType: string;
  latitude: number;
  longitude: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  outdoorSeating?: boolean;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    formatted?: string;
  };
  phone?: string;
  website?: string;
  openingHours?: string;
  lastSyncedOverpass?: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendVenuesResponse {
  success: boolean;
  data: BackendVenue[];
  meta: {
    total: number;
    limit: number;
    skip: number;
    count: number;
  };
}

interface BackendVenueResponse {
  success: boolean;
  data: BackendVenue;
}

interface BulkUpsertResponse {
  success: boolean;
  data: {
    inserted: number;
    updated: number;
    total: number;
  };
}

/**
 * Create API client instance
 */
function createApiClient(config: ApiClientConfig) {
  const { baseURL, timeout = 10000 } = config

  /**
   * Get all venues with optional filters
   */
  async function getVenues(
    params?: VenueQueryParams
  ): Promise<BackendVenuesResponse> {
    const query = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString())
        }
      })
    }

    const url = `${baseURL}/api/venues${query.toString() ? `?${query.toString()}` : ''}`

    try {
      return await $fetch<BackendVenuesResponse>(url, {
        method: 'GET',
        timeout
      })
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string }
      console.error('[API Client] Failed to fetch venues:', err.message)
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: `Backend API error: ${err.message}`
      })
    }
  }

  /**
   * Get single venue by ID
   */
  async function getVenue(venueId: string): Promise<BackendVenueResponse> {
    const url = `${baseURL}/api/venues/${venueId}`

    try {
      return await $fetch<BackendVenueResponse>(url, {
        method: 'GET',
        timeout
      })
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string }
      console.error('[API Client] Failed to fetch venue:', err.message)
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: `Backend API error: ${err.message}`
      })
    }
  }

  /**
   * Create a new venue
   */
  async function createVenue(
    venue: Partial<BackendVenue>
  ): Promise<BackendVenueResponse> {
    const url = `${baseURL}/api/venues`

    try {
      return await $fetch<BackendVenueResponse>(url, {
        method: 'POST',
        body: venue,
        timeout
      })
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string }
      console.error('[API Client] Failed to create venue:', err.message)
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: `Backend API error: ${err.message}`
      })
    }
  }

  /**
   * Update existing venue
   */
  async function updateVenue(
    venueId: string,
    updates: Partial<BackendVenue>
  ): Promise<BackendVenueResponse> {
    const url = `${baseURL}/api/venues/${venueId}`

    try {
      return await $fetch<BackendVenueResponse>(url, {
        method: 'PUT',
        body: updates,
        timeout
      })
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string }
      console.error('[API Client] Failed to update venue:', err.message)
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: `Backend API error: ${err.message}`
      })
    }
  }

  /**
   * Delete a venue
   */
  async function deleteVenue(
    venueId: string
  ): Promise<{ success: boolean; message: string }> {
    const url = `${baseURL}/api/venues/${venueId}`

    try {
      return await $fetch<{ success: boolean; message: string }>(url, {
        method: 'DELETE',
        timeout
      })
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string }
      console.error('[API Client] Failed to delete venue:', err.message)
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: `Backend API error: ${err.message}`
      })
    }
  }

  /**
   * Bulk upsert venues (typically from Overpass sync)
   */
  async function bulkUpsertVenues(
    venues: Partial<BackendVenue>[]
  ): Promise<BulkUpsertResponse> {
    const url = `${baseURL}/api/venues/bulk-upsert`

    try {
      return await $fetch<BulkUpsertResponse>(url, {
        method: 'POST',
        body: { venues },
        timeout: timeout * 3 // Longer timeout for bulk operations
      })
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string }
      console.error('[API Client] Failed to bulk upsert venues:', err.message)
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: `Backend API error: ${err.message}`
      })
    }
  }

  /**
   * Check backend health
   */
  async function checkHealth(): Promise<{ status: string; timestamp: string }> {
    const url = `${baseURL}/health`

    try {
      return await $fetch<{ status: string; timestamp: string }>(url, {
        method: 'GET',
        timeout: 5000
      })
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string }
      console.error('[API Client] Backend health check failed:', err.message)
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: `Backend unreachable: ${err.message}`
      })
    }
  }

  return {
    getVenues,
    getVenue,
    createVenue,
    updateVenue,
    deleteVenue,
    bulkUpsertVenues,
    checkHealth
  }
}

/**
 * Get API client instance configured from runtime config
 */
export function useBackendApi(event: H3Event) {
  const config = useRuntimeConfig(event)

  return createApiClient({
    baseURL: config.sunbarApiUrl as string,
    timeout: 10000
  })
}

export type {
    BackendVenue, BackendVenuesResponse,
    BulkUpsertResponse, VenueQueryParams
}

