<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import { useMapViewStore } from '@/stores/mapView'

const mapViewStore = useMapViewStore()
const { viewMode, is3dSupported } = storeToRefs(mapViewStore)

function toggleView() {
  mapViewStore.toggle()
}
</script>

<template>
  <Button
    v-if="is3dSupported"
    :icon="viewMode === '2d' ? 'pi pi-box' : 'pi pi-map'"
    :label="viewMode === '2d' ? $t('map.button.view3d') : $t('map.button.view2d')"
    :severity="viewMode === '3d' ? 'secondary' : 'info'"
    size="small"
    @click="toggleView"
  />
</template>
