import { defineStore } from 'pinia'
import { ref } from 'vue'

export type MapViewMode = '2d' | '3d';

// ArcGIS SceneView requires WebGL2 and a working RGBA16F texture allocation for
// its HDR deferred rendering pipeline. Android emulators (gfxstream virtual GPU)
// report WebGL2 as available but silently reject glTexImage2D with RGBA16F,
// producing GL_INVALID_ENUM (0x500) and leaving SceneView blank and broken.
// Real devices with proper GPUs handle RGBA16F natively. We probe the texture
// allocation directly so emulators are detected and 3D mode is disabled for them,
// while real devices and desktop browsers pass the check and can use the toggle.
function checkWebGL2Support(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return false

    // Probe RGBA16F texture creation, which is the exact format ArcGIS SceneView
    // allocates for its HDR framebuffer. Emulator gfxstream rejects this with
    // GL_INVALID_ENUM; real device GPUs accept it without error.
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 1, 1, 0, gl.RGBA, gl.FLOAT, null)
    const supported = gl.getError() === gl.NO_ERROR
    gl.deleteTexture(texture)
    return supported
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
