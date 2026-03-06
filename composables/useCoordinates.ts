import type { Coordinates } from '@/shared/types'

// useCoordinates composable
// Provides utility functions for creating and working with geographic coordinates.
export function useCoordinates() {
  // Create a Coordinates object, throwing if the values are out of range.
  function create(latitude: number, longitude: number): Coordinates {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90')
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180')
    }
    return { latitude, longitude }
  }

  // Convert coordinates to a [lat, lng] tuple.
  function toArray(coords: Coordinates): [number, number] {
    return [coords.latitude, coords.longitude]
  }

  // Convert coordinates to a { lat, lng } object.
  function toLatLng(coords: Coordinates): { lat: number; lng: number } {
    return { lat: coords.latitude, lng: coords.longitude }
  }

  // Return true if two coordinate objects have identical latitude and longitude values.
  function areEqual(a: Coordinates, b: Coordinates): boolean {
    return a.latitude === b.latitude && a.longitude === b.longitude
  }

  // Calculate the distance in meters between two coordinate points using the Haversine formula.
  function calculateDistance(from: Coordinates, to: Coordinates): number {
    const earthRadiusMeters = 6371e3
    const latitudeFromRadians = (from.latitude * Math.PI) / 180
    const latitudeToRadians = (to.latitude * Math.PI) / 180
    const latitudeDifferenceRadians =
      ((to.latitude - from.latitude) * Math.PI) / 180
    const longitudeDifferenceRadians =
      ((to.longitude - from.longitude) * Math.PI) / 180

    const squareOfHalfChordLength =
      Math.sin(latitudeDifferenceRadians / 2) *
        Math.sin(latitudeDifferenceRadians / 2) +
      Math.cos(latitudeFromRadians) *
        Math.cos(latitudeToRadians) *
        Math.sin(longitudeDifferenceRadians / 2) *
        Math.sin(longitudeDifferenceRadians / 2)
    const angularDistance =
      2 *
      Math.atan2(
        Math.sqrt(squareOfHalfChordLength),
        Math.sqrt(1 - squareOfHalfChordLength)
      )

    return earthRadiusMeters * angularDistance
  }

  return {
    create,
    toArray,
    toLatLng,
    areEqual,
    calculateDistance
  }
}
