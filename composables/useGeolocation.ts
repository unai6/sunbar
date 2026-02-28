import { ref } from 'vue'
import { GeolocationErrorType } from '~/shared/enums'
import type { GeolocationState } from '~/shared/types'

const GEOLOCATION_TIMEOUT_MS = 10000
const GEOLOCATION_MAX_AGE_MS = 0 // Always request fresh position to trigger permission prompt.

// Detect Tauri context — present in both dev and production Tauri builds
const isTauri = globalThis.window !== undefined && '__TAURI_INTERNALS__' in globalThis

export function useGeolocation() {
  const state = ref<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    errorType: null,
    loading: false
  })

  /**
   * Maps GeolocationPositionError code to our error type
   */
  function getErrorType(code: number): GeolocationErrorType {
    switch (code) {
      case 1: // PERMISSION_DENIED
        return GeolocationErrorType.PERMISSION_DENIED
      case 2: // POSITION_UNAVAILABLE
        return GeolocationErrorType.POSITION_UNAVAILABLE
      case 3: // TIMEOUT
        return GeolocationErrorType.TIMEOUT
      default:
        return GeolocationErrorType.UNKNOWN
    }
  }

  /**
   * Check permission state using Permissions API (when available).
   * In Tauri, delegates to the native geolocation plugin.
   */
  async function checkPermission(): Promise<PermissionState | null> {
    if (isTauri) {
      const { checkPermissions } = await import('@tauri-apps/plugin-geolocation')
      const result = await checkPermissions()
      let mapped: PermissionState
      if (result.location === 'granted') {
        mapped = 'granted'
      } else if (result.location === 'denied') {
        mapped = 'denied'
      } else {
        mapped = 'prompt'
      }
      return mapped
    }

    if (!('permissions' in navigator)) {
      return null
    }

    try {
      const result = await navigator.permissions.query({
        name: 'geolocation' as PermissionName
      })
      return result.state
    } catch {
      // Permissions API not fully supported (Safari) or query failed
      return null
    }
  }

  /**
   * Get current position with proper error handling for all browsers and Tauri.
   * In Tauri (iOS/Android), uses the native geolocation plugin which handles
   * OS-level permission dialogs. In browser, falls back to navigator.geolocation.
   */
  function getCurrentPosition(): Promise<GeolocationPosition> {
    state.value.loading = true
    state.value.error = null
    state.value.errorType = null

    if (isTauri) {
      return getTauriPosition()
    }

    return getBrowserPosition()
  }

  async function getTauriPosition(): Promise<GeolocationPosition> {
    const { checkPermissions, requestPermissions, getCurrentPosition: tauriGetPos } =
      await import('@tauri-apps/plugin-geolocation')

    // Check existing permission; request if not yet granted
    let permState = await checkPermissions()
    if (permState.location !== 'granted' && permState.coarseLocation !== 'granted') {
      permState = await requestPermissions(['location'])
    }

    if (permState.location !== 'granted' && permState.coarseLocation !== 'granted') {
      const err = { code: 1, message: 'User denied geolocation permission', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }
      state.value.error = err.message
      state.value.errorType = GeolocationErrorType.PERMISSION_DENIED
      state.value.loading = false
      throw err
    }

    const pos = await tauriGetPos({
      enableHighAccuracy: true,
      timeout: GEOLOCATION_TIMEOUT_MS,
      maximumAge: GEOLOCATION_MAX_AGE_MS
    })

    state.value.latitude = pos.coords.latitude
    state.value.longitude = pos.coords.longitude
    state.value.accuracy = pos.coords.accuracy
    state.value.error = null
    state.value.errorType = null
    state.value.loading = false
    return pos as unknown as GeolocationPosition
  }

  function getBrowserPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const error = new Error('Geolocation is not supported')
        state.value.error = error.message
        state.value.errorType = GeolocationErrorType.NOT_SUPPORTED
        state.value.loading = false
        reject(error)
        return
      }

      // Always call getCurrentPosition to trigger permission prompt
      // Safari and Firefox will show the prompt again if not permanently denied
      navigator.geolocation.getCurrentPosition(
        (position) => {
          state.value.latitude = position.coords.latitude
          state.value.longitude = position.coords.longitude
          state.value.accuracy = position.coords.accuracy
          state.value.error = null
          state.value.errorType = null
          state.value.loading = false
          resolve(position)
        },
        (err) => {
          const errorType = getErrorType(err.code)
          state.value.error = err.message
          state.value.errorType = errorType
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
    getCurrentPosition,
    checkPermission
  }
}
