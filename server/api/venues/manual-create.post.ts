import { useBackendApi } from '~/server/utils/api-client'

/**
 * Create a venue manually via the backend API
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { venue } = body

  if (!venue) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Venue data is required'
    })
  }

  const apiClient = useBackendApi(event)

  try {
    const createdVenue = await apiClient.createVenue(venue)

    return {
      success: true,
      venue: createdVenue,
      message: 'Venue created successfully'
    }
  } catch (error) {
    console.error('Failed to create venue:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create venue in backend'
    })
  }
})
