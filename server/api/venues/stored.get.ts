/**
 * GET /api/venues/stored
 *
 * Fetches venues from the backend MongoDB database (already synced data).
 * This is faster than fetching from Overpass but data may be stale.
 *
 * Query params:
 * - south: southern latitude (optional)
 * - west: western longitude (optional)
 * - north: northern latitude (optional)
 * - east: eastern longitude (optional)
 * - onlyOutdoorSeating: filter by outdoor seating (optional)
 * - maxAgeDays: max age of data in days (default: 7)
 * - limit: max number of results (default: 100)
 * - skip: number of results to skip (default: 0)
 * - datetime: ISO timestamp for shadow analysis (optional, defaults to now)
 */

import { useBackendApi, type BackendVenue } from '~/server/utils/api-client'
import {
  buildCombinedQuery,
  executeOverpassQuery
} from '~/server/utils/overpass'
import { analyzeVenueShadow, parseBuildings } from '~/server/utils/shadow'
import { calculateSunPosition } from '~/server/utils/sun'
import type { ApiVenue } from '~/shared/types'

/**
 * Transform backend venue to API venue format
 */
function transformToApiVenue(
  backendVenue: BackendVenue,
  sunlightStatus?: 'sunny' | 'shaded' | 'partially_sunny'
): ApiVenue {
  return {
    id: backendVenue.venueId,
    name: backendVenue.name,
    type: backendVenue.venueType,
    latitude: backendVenue.latitude,
    longitude: backendVenue.longitude,
    outdoor_seating: backendVenue.outdoorSeating,
    address: backendVenue.address?.formatted,
    phone: backendVenue.phone,
    website: backendVenue.website,
    openingHours: backendVenue.openingHours,
    sunlightStatus
  }
}

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event)

    // Parse bbox params (optional)
    const south = query.south
      ? Number.parseFloat(query.south as string)
      : undefined
    const west = query.west
      ? Number.parseFloat(query.west as string)
      : undefined
    const north = query.north
      ? Number.parseFloat(query.north as string)
      : undefined
    const east = query.east
      ? Number.parseFloat(query.east as string)
      : undefined

    // Parse other filters
    const onlyOutdoorSeating = query.onlyOutdoorSeating === 'true'
    const maxAgeDays = query.maxAgeDays
      ? Number.parseInt(query.maxAgeDays as string, 10)
      : 7
    const limit = query.limit
      ? Number.parseInt(query.limit as string, 10)
      : 100
    const skip = query.skip ? Number.parseInt(query.skip as string, 10) : 0

    // Parse datetime or use now
    const parsedDate = query.datetime
      ? new Date(query.datetime as string)
      : null
    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid datetime format. Expected ISO 8601 string.'
      })
    }
    const datetime = parsedDate ?? new Date()

    console.info('[Stored Venues] Fetching from backend database')

    try {
      const backendApi = useBackendApi(event)

      // Fetch venues from backend
      const response = await backendApi.getVenues({
        south,
        west,
        north,
        east,
        onlyOutdoorSeating: onlyOutdoorSeating || undefined,
        maxAgeDays,
        limit,
        skip
      })

      const backendVenues = response.data

      console.info(
        `[Stored Venues] Retrieved ${backendVenues.length} venues from backend`
      )

      // If no bbox provided, return without shadow analysis
      if (
        south === undefined ||
        west === undefined ||
        north === undefined ||
        east === undefined
      ) {
        const venues = backendVenues.map((v) => transformToApiVenue(v))

        return {
          venues,
          meta: {
            timestamp: datetime.toISOString(),
            venueCount: venues.length,
            source: 'stored',
            ...response.meta
          }
        }
      }

      // Fetch buildings for shadow analysis
      console.info('[Stored Venues] Fetching buildings for shadow analysis')
      const overpassResponse = await executeOverpassQuery(
        buildCombinedQuery(south, west, north, east)
      )

      const buildingElements = overpassResponse.elements.filter(
        (el) => el.type === 'way' && el.tags?.building
      )

      const buildings = parseBuildings(buildingElements)

      // Calculate sun position
      const centerLat = (south + north) / 2
      const centerLon = (west + east) / 2
      const sunPosition = calculateSunPosition(centerLat, centerLon, datetime)

      console.info(
        `[Stored Venues] Analyzing shadows for ${backendVenues.length} venues with ${buildings.length} buildings`
      )

      // Analyze shadow for each venue
      const venuesWithShadow = backendVenues.map((backendVenue) => {
        const shadowStatus = analyzeVenueShadow(
          {
            id: backendVenue.venueId,
            latitude: backendVenue.latitude,
            longitude: backendVenue.longitude,
            name: backendVenue.name,
            type: backendVenue.venueType,
            outdoor_seating: backendVenue.outdoorSeating
          },
          buildings,
          sunPosition.azimuthDegrees,
          sunPosition.altitudeRadians
        )

        return transformToApiVenue(backendVenue, shadowStatus)
      })

      return {
        venues: venuesWithShadow,
        sunPosition: {
          azimuth: sunPosition.azimuthDegrees,
          altitude: sunPosition.altitudeDegrees,
          isDaytime: sunPosition.altitudeRadians > 0
        },
        meta: {
          timestamp: datetime.toISOString(),
          buildingsAnalyzed: buildings.length,
          venueCount: venuesWithShadow.length,
          source: 'stored',
          ...response.meta
        }
      }
    } catch (error: unknown) {
      const err = error as {
        statusCode?: number;
        statusMessage?: string;
        message?: string;
      }
      console.error('[Stored Venues] Failed:', err.message)

      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: err.statusMessage || 'Failed to fetch stored venues'
      })
    }
  },
  {
    // Cache key based on bbox and filters
    getKey: (event) => {
      const query = getQuery(event)
      const south = query.south || 'all'
      const west = query.west || 'all'
      const north = query.north || 'all'
      const east = query.east || 'all'
      const outdoor = query.onlyOutdoorSeating || 'false'
      const dt = query.datetime
        ? new Date(query.datetime as string)
        : new Date()
      const timeKey = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}-${dt.getHours()}`
      return `stored:${south},${west},${north},${east}:${outdoor}:${timeKey}`
    },
    // Cache for 30 minutes (stored data is already persisted)
    maxAge: 60 * 30,
    staleMaxAge: 60 * 60,
    shouldBypassCache: () => false
  }
)
