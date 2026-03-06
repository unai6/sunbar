import type { SunlightStatusInfo, Venue } from '@/shared/types'
import { useSunlightStatus } from './useSunlightStatus'

// useVenue composable
// Provides utility functions for working with individual venues.
export function useVenue() {
  const { isSunny: isSunlightSunny } = useSunlightStatus()

  // Create a venue object, throwing if required fields are missing.
  function create(props: Venue): Venue {
    if (!props.id) {
      throw new Error('Venue must have an id')
    }
    if (!props.name) {
      throw new Error('Venue must have a name')
    }
    return { ...props }
  }

  // Return true if the venue is currently sunny.
  function isSunny(venue: Venue): boolean {
    return venue.sunlightStatus ? isSunlightSunny(venue.sunlightStatus) : false
  }

  // Return true if the venue has outdoor seating.
  function hasOutdoorSeating(venue: Venue): boolean {
    return venue.outdoor_seating === true
  }

  // Return a copy of the venue with an updated sunlight status.
  function withSunlightStatus(venue: Venue, status: SunlightStatusInfo): Venue {
    return { ...venue, sunlightStatus: status }
  }

  return {
    create,
    isSunny,
    hasOutdoorSeating,
    withSunlightStatus
  }
}
