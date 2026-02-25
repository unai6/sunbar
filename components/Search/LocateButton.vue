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

// primary (amber) when located, secondary (gray) when not
const mobileSeverity = computed<'warning' | 'info'>(() =>
  props.isLocated ? 'info' : 'warning'
)

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
    :aria-label="$t('controlPanel.button.useMyLocation')"
    :icon="mobileIcon"
    :severity="mobileSeverity"
    :outlined="isAtLocation"
    :class="{'bg-white': isAtLocation}"
    rounded
    @click="emit('locate')"
  />
</template>
