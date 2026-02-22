/**
 * POST /api/venues/sync
 *
 * Syncs venues from Overpass API to the backend database.
 *
 * This endpoint:
 * 1. Fetches venues from Overpass for a given bounding box
 * 2. Transforms them to backend format
 * 3. Bulk upserts them to the MongoDB backend
 *
 * Query params:
 * - south: southern latitude
 * - west: western longitude
 * - north: northern latitude
 * - east: eastern longitude
 */

import { useBackendApi, type BackendVenue } from '~/server/utils/api-client'
import {
  buildCombinedQuery,
  executeOverpassQuery
} from '~/server/utils/overpass'
import { parseVenues, type Venue as ParsedVenue } from '~/server/utils/shadow'

/**
 * Transform parsed Overpass venue to backend format
 */
function transformToBackendVenue(venue: ParsedVenue): Partial<BackendVenue> {
  return {
    venueId: venue.id,
    osmId: venue.id.split('/')[1] || venue.id,
    osmType: 'node',
    name: venue.name,
    venueType: venue.type,
    latitude: venue.latitude,
    longitude: venue.longitude,
    outdoorSeating: venue.outdoor_seating === true,
    address: venue.address
      ? {
          formatted: venue.address
        }
      : undefined,
    phone: venue.phone,
    website: venue.website,
    openingHours: venue.openingHours
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Parse and validate bbox
  const south = Number.parseFloat(query.south as string)
  const west = Number.parseFloat(query.west as string)
  const north = Number.parseFloat(query.north as string)
  const east = Number.parseFloat(query.east as string)

  if (
    Number.isNaN(south) ||
    Number.isNaN(west) ||
    Number.isNaN(north) ||
    Number.isNaN(east)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Invalid bounding box. Required params: south, west, north, east'
    })
  }

  // Validate bbox size (prevent huge queries)
  const MAX_BBOX_DEGREES = 0.05
  const latDiff = north - south
  const lonDiff = east - west
  if (latDiff > MAX_BBOX_DEGREES || lonDiff > MAX_BBOX_DEGREES) {
    throw createError({
      statusCode: 400,
      statusMessage: `Bounding box too large. Max ${MAX_BBOX_DEGREES} degrees (~5km)`
    })
  }

  console.info('[Sync] Starting venue sync from Overpass to backend')
  console.info(`[Sync] Bounding box: [${south}, ${west}, ${north}, ${east}]`)

  try {
    // Fetch from Overpass
    const response = await executeOverpassQuery(
      buildCombinedQuery(south, west, north, east)
    )

    // Parse venues (filter only nodes with amenity tags)
    const venueElements = response.elements.filter(
      (el) => el.type === 'node' && el.tags?.amenity
    )

    const parsedVenues = parseVenues(venueElements)
    console.info(`[Sync] Fetched ${parsedVenues.length} venues from Overpass`)

    if (parsedVenues.length === 0) {
      return {
        success: true,
        message: 'No venues found in this area',
        data: {
          inserted: 0,
          updated: 0,
          total: 0
        }
      }
    }

    // Transform to backend format
    const backendVenues = parsedVenues.map(transformToBackendVenue)

    // Send to backend
    const backendApi = useBackendApi(event)
    const result = await backendApi.bulkUpsertVenues(backendVenues)

    console.info(
      `[Sync] Completed: ${result.data.inserted} inserted, ${result.data.updated} updated`
    )

    return {
      success: true,
      message: 'Venues synced successfully',
      data: result.data
    }
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number;
      statusMessage?: string;
      message?: string;
    }
    console.error('[Sync] Failed:', err.message)

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to sync venues'
    })
  }
})
