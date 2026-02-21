<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import { useMapViewStore } from '~/stores/mapView'

const mapViewStore = useMapViewStore()
const { viewMode } = storeToRefs(mapViewStore)

function toggleView() {
  mapViewStore.toggle()
}
</script>

<template>
  <div class="absolute top-4 right-4 z-100">
    <Button
      :icon="viewMode === '2d' ? 'pi pi-box' : 'pi pi-map'"
      :label="viewMode === '2d' ? $t('map.button.view3d') : $t('map.button.view2d')"
      :severity="viewMode === '3d' ? 'secondary' : 'info'"
      size="small"
      @click="toggleView"
    />
  </div>
</template>