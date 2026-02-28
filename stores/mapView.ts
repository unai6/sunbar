import { defineStore } from 'pinia'
import { ref } from 'vue'

export type MapViewMode = '2d' | '3d';

/**
 * ArcGIS SceneView requires WebGL2 + EXT_color_buffer_float for its deferred
 * rendering pipeline. Android System WebView (used by Tauri Android) doesn't
 * expose this extension even when the device GPU supports it, so 3D rendering
 * is silently broken. Check at runtime rather than UA-sniffing.
 */
function checkWebGL2Support(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return false
    return gl.getExtension('EXT_color_buffer_float') !== null
  } catch {
    return false
  }
}

export const useMapViewStore = defineStore('mapView', () => {
  const is3dSupported = ref(checkWebGL2Support())
  const viewMode = ref<MapViewMode>('2d')

  function setViewMode(mode: MapViewMode) {
    if (mode === '3d' && !is3dSupported.value) return
    viewMode.value = mode
  }

  function toggle() {
    if (!is3dSupported.value) return
    viewMode.value = viewMode.value === '2d' ? '3d' : '2d'
  }

  return {
    viewMode,
    is3dSupported,
    setViewMode,
    toggle
  }
})
