import type { IMapGateway } from './IMapGateway'
import { useArcGISMapGateway } from './arcgis/useArcGISMapGateway'
import { useMapLibreMapGateway } from './maplibre/useMapLibreMapGateway'
import { isTauri } from '@tauri-apps/api/core'
import { platform } from '@tauri-apps/plugin-os'

/**
 * useMapGateway — factory composable
 *
 * Selects the appropriate IMapGateway implementation based on the runtime
 * environment:
 *   - Tauri on Android → MapLibre GL JS (WebGL1, no RGBA16F requirement)
 *   - Everything else  → ArcGIS Maps SDK (full 2D + 3D support)
 *
 * Must be called inside onMounted (client-only) since isTauri() requires window.
 */
export function useMapGateway(): IMapGateway {
  if (isTauri() && platform() === 'android') {
    return useMapLibreMapGateway()
  }
  return useArcGISMapGateway()
}
