<script setup lang="ts">
type Props = {
  isLoading: boolean
}

defineProps<Props>()

const sunInfoStore = useSunInfoStore()
const isNight = computed(() => sunInfoStore.sunInfo !== null && !sunInfoStore.sunInfo.isDaytime)
</script>

<template>
  <div
    v-if="isLoading"
    class="absolute inset-0 flex flex-col items-center justify-center gap-4 z-[200] font-medium transition-colors"
    :class="isNight
      ? 'bg-slate-900/95 text-slate-300'
      : 'bg-white/95 text-slate-600'"
  >
    <SunSpinner class="w-10 h-10" />
    <output>{{ $t('map.message.loadingMap') }}</output>
  </div>
</template>
