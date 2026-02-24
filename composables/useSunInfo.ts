import SunCalc from 'suncalc'
import { storeToRefs } from 'pinia'
import type { Coordinates, SunPosition } from '~/shared/types'
import { useSunInfoStore } from '~/stores/sunInfo'
import { useCoordinates } from './useCoordinates'

// --- Sun position utilities ---

function createPosition(azimuth: number, altitude: number, timestamp: Date): SunPosition {
  return { azimuth, altitude, timestamp }
}

function isAboveHorizon(position: SunPosition): boolean {
  return position.altitude > 0
}

function getAzimuthDegrees(position: SunPosition): number {
  // SunCalc returns azimuth where 0 = south, convert to 0 = north
  let degrees = (position.azimuth * 180) / Math.PI + 180
  if (degrees >= 360) degrees -= 360
  return degrees
}

function getAltitudeDegrees(position: SunPosition): number {
  return (position.altitude * 180) / Math.PI
}

// --- SunCalc wrappers ---

function getSunPosition(coordinates: Coordinates, datetime: Date): SunPosition {
  const raw = SunCalc.getPosition(datetime, coordinates.latitude, coordinates.longitude)
  return createPosition(raw.azimuth, raw.altitude, datetime)
}

function getSunTimes(coordinates: Coordinates, date: Date) {
  const times = SunCalc.getTimes(date, coordinates.latitude, coordinates.longitude)
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
    goldenHour: times.goldenHour
  }
}

function isDaytime(coordinates: Coordinates, datetime: Date): boolean {
  return isAboveHorizon(getSunPosition(coordinates, datetime))
}

// --- Composable ---

/**
 * useSunInfo Composable
 * Manages sun information state and provides sun calculation utilities
 */
export function useSunInfo() {
  const store = useSunInfoStore()
  const { sunInfo, selectedDateTime, currentLocation } = storeToRefs(store)
  const coordinates = useCoordinates()

  function updateSunInfo(latitude: number, longitude: number, date?: Date): void {
    try {
      const datetime = date || selectedDateTime.value
      const coords = coordinates.create(latitude, longitude)
      const position = getSunPosition(coords, datetime)

      store.sunInfo = {
        position: {
          azimuthDegrees: getAzimuthDegrees(position),
          altitudeDegrees: getAltitudeDegrees(position),
          isAboveHorizon: isAboveHorizon(position)
        },
        times: getSunTimes(coords, datetime),
        isDaytime: isDaytime(coords, datetime)
      }

      store.currentLocation = { latitude, longitude }
    } catch {
      store.sunInfo = null
    }
  }

  function setDateTime(datetime: Date): void {
    store.selectedDateTime = datetime

    if (currentLocation.value) {
      updateSunInfo(
        currentLocation.value.latitude,
        currentLocation.value.longitude,
        datetime
      )
    }
  }

  return {
    sunInfo,
    selectedDateTime,
    currentLocation,
    updateSunInfo,
    setDateTime,
    isDaytime
  }
}
