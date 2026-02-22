<script setup lang="ts">
import Button from 'primevue/button'

type Props = {
  variant?: 'desktop' | 'mobile'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'desktop'
})

const emit = defineEmits<{
  locate: []
}>()
</script>

<template>
  <!-- Desktop variant -->
  <Button
    v-if="props.variant === 'desktop'"
    :label="$t('controlPanel.button.useMyLocation')"
    icon="pi pi-map-marker"
    class="w-full"
    severity="secondary"
    outlined
    @click="emit('locate')"
  />

  <!-- Mobile variant (circular button for map) -->
  <button
    v-else-if="props.variant === 'mobile'"
    class="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 transition-all duration-200 active:scale-95 active:bg-gray-100"
    @click="emit('locate')"
  >
    <i class="pi pi-map-marker text-base" />
  </button>
</template>

