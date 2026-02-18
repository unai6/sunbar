import { ref, onMounted } from 'vue'

const GEOLOCATION_TIMEOUT_MS = 10000
const GEOLOCATION_MAX_AGE_MS = 60000

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const state = ref<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false
  })

  const isSupported = ref(false)

  onMounted(() => {
    isSupported.value = 'geolocation' in navigator
  })

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!isSupported.value) {
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

  function hasLocation(): boolean {
    return state.value.latitude !== null && state.value.longitude !== null
  }

  return {
    state,
    isSupported,
    getCurrentPosition,
    hasLocation
  }
}
