import { ref } from 'vue'
import type { GeolocationState } from '~/shared/types'

const GEOLOCATION_TIMEOUT_MS = 10000
const GEOLOCATION_MAX_AGE_MS = 60000

export type { GeolocationState }

export function useGeolocation() {
  const state = ref<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false
  })

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      state.value.loading = true
      state.value.error = null

      navigator.geolocation.getCurrentPosition(
        (position) => {
          state.value.latitude = position.coords.latitude
          state.value.longitude = position.coords.longitude
          state.value.accuracy = position.coords.accuracy
          state.value.loading = false
          resolve(position)
        },
        (err) => {
          state.value.error = err.message
          state.value.loading = false
          reject(err)
        },
        {
          enableHighAccuracy: true,
          timeout: GEOLOCATION_TIMEOUT_MS,
          maximumAge: GEOLOCATION_MAX_AGE_MS
        }
      )
    })
  }

  return {
    state,
    getCurrentPosition
  }
}
