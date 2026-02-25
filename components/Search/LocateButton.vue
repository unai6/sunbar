<script setup lang="ts">
import Button from 'primevue/button'

type Props = {
  variant?: 'desktop' | 'mobile'
  isLocated?: boolean
  isAtLocation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'desktop',
  isLocated: false,
  isAtLocation: false
})

const emit = defineEmits<{
  locate: []
}>()

const mobileIcon = computed<string>(() =>
  props.isAtLocation ? 'pi pi-compass' : 'pi pi-map-marker'
)
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

  <Button
    v-else-if="props.variant === 'mobile'"
    unstyled
    :aria-label="$t('controlPanel.button.useMyLocation')"
    class="bg-white rounded-full w-9 h-9 shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
    :class="isAtLocation ? 'text-amber-500' : 'text-slate-600 hover:text-slate-900'"
    @click="emit('locate')"
  >
    <i :class="[mobileIcon, 'text-lg']" aria-hidden="true" />
  </Button>
</template>
