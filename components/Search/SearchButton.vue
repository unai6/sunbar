<script setup lang="ts">
import Button from 'primevue/button'

type Props = {
  loading: boolean
  variant?: 'desktop' | 'mobile'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'mobile'
})

const emit = defineEmits<{
  search: []
}>()
</script>

<template>
  <!-- Desktop variant -->
  <Button
    v-if="props.variant === 'desktop'"
    :label="$t('controlPanel.button.searchThisArea')"
    icon="pi pi-refresh"
    :loading="loading"
    class="w-full"
    severity="warning"
    @click="emit('search')"
  />

  <!-- Mobile variant -->
  <Button
    v-else
    unstyled
    :disabled="loading"
    :aria-label="$t('controlPanel.button.searchThisArea')"
    :aria-busy="loading"
    class="flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50"
    :class="loading ? 'bg-gray-100 text-gray-400' : 'bg-amber-500 text-white active:bg-amber-600'"
    @click="emit('search')"
  >
    <span class="contents">
      <SunSpinner v-if="loading" class="w-4 h-4" />
      <i v-else class="pi pi-refresh text-base" aria-hidden="true" />
      <span class="text-[10px] mt-0.5 font-medium">{{ $t('controlPanel.mobile.search') }}</span>
    </span>
  </Button>
</template>
