import type { IMapGateway } from './IMapGateway'
import { useArcGISMapGateway } from './arcgis/useArcGISMapGateway'
import { useMapLibreMapGateway } from './maplibre/useMapLibreMapGateway'

/**
 * Returns true when running inside a Tauri-wrapped Android app.
 * Tauri injects `window.__TAURI__` at runtime; the UA check narrows to Android.
 */
function isTauriAndroid(): boolean {
  if (typeof window === 'undefined') return false
  return '__TAURI__' in window && /android/i.test(navigator.userAgent)
}

/**
 * useMapGateway — factory composable
 *
 * Selects the appropriate IMapGateway implementation based on the runtime
 * environment:
 *   - Tauri on Android → MapLibre GL JS (WebGL1, no RGBA16F requirement)
 *   - Everything else  → ArcGIS Maps SDK (full 2D + 3D support)
 *
 * Extending to a new renderer only requires adding a new gateway composable
 * and a condition here; AppMap.vue is untouched.
 */
export function useMapGateway(): IMapGateway {
  console.info('Initializing map gateway for platform:', isTauriAndroid() ? 'Tauri Android (MapLibre)' : 'Default (ArcGIS)')
  if (isTauriAndroid()) {
    return useMapLibreMapGateway()
  }
  return useArcGISMapGateway()
}
