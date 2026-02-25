<script setup lang="ts">
import Popover from 'primevue/popover'

const legendPanel = ref<InstanceType<typeof Popover> | null>(null)

function toggleLegend(event: Event): void {
  legendPanel.value?.toggle(event)
}
</script>

<template>
  <div class="absolute bottom-20 left-3 z-[100] lg:bottom-6">
    <button
      type="button"
      :aria-label="$t('map.title.legend')"
      class="bg-white rounded-full w-9 h-9 shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:shadow-xl transition-shadow"
      @click="toggleLegend"
    >
      <i class="pi pi-question-circle text-lg" aria-hidden="true" />
    </button>

    <Popover ref="legendPanel" class="w-64">
      <div class="space-y-3">
        <div class="font-bold text-slate-800 text-sm border-b pb-2">☀️ {{ $t('map.title.legend') }}</div>

        <div class="flex items-center gap-2.5">
          <span class="w-4 h-4 rounded-full bg-amber-400 border-[2.5px] border-white shadow-[0_0_0_1px_#d97706,0_2px_6px_rgba(255,193,7,0.4)]" />
          <span class="text-gray-700 font-medium text-xs">{{ $t('map.label.sunny') }}</span>
        </div>

        <div class="flex items-center gap-2.5">
          <span class="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow-[0_0_0_1px_#4b5563]" />
          <span class="text-gray-700 font-medium text-xs">{{ $t('map.label.shaded') }}</span>
        </div>

        <div class="border-t border-gray-200 pt-3 space-y-2">
          <div class="flex items-center gap-2.5">
            <i class="pi pi-sun text-amber-500 text-sm w-4 text-center" />
            <span class="text-gray-700 font-medium text-xs">{{ $t('controlPanel.filter.onlySunnyVenues') }}</span>
          </div>
          <div class="flex items-center gap-2.5">
            <i class="pi pi-table text-gray-600 text-sm w-4 text-center" />
            <span class="text-gray-700 font-medium text-xs">{{ $t('controlPanel.filter.onlyOutdoorSeating') }}</span>
          </div>
        </div>
      </div>
    </Popover>
  </div>
</template>
