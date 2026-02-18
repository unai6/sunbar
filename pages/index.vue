<script setup lang="ts">
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import type { VenueErrorCode } from '~/composables/useVenues'

const toast = useToast()
const { t } = useI18n()

const TOAST_DURATION_MS = 5000

const ERROR_TOAST_MAP: Record<VenueErrorCode, { severity: 'error' | 'warn'; key: string }> = {
  'bbox-too-large': { severity: 'warn', key: 'toast.error.bboxTooLarge' },
  'network': { severity: 'error', key: 'toast.error.network' },
  'fetch-failed': { severity: 'error', key: 'toast.error.fetchVenues' }
}

const {
  loading,
  filters,
  sunnyVenues,
  shadedVenues,
  filteredVenues,
  sunInfo,
  selectedDateTime,
  mapRef,
  mapCenter,
  mapZoom,
  selectedVenueId,
  selectedVenue,
  showVenueDetail,
  handleSearch: search,
  handleBoundsChanged,
  handleDateTimeUpdate: updateDateTime,
  handleFilterUpdate: updateFilters,
  handleVenueClick,
  handleVenueSelect,
  handleLocateMe
} = useMapExplorer()

function showVenueError(errorCode: VenueErrorCode): void {
  const { severity, key } = ERROR_TOAST_MAP[errorCode]
  toast.add({
    severity,
    summary: t('toast.error.title'),
    detail: t(key),
    life: TOAST_DURATION_MS
  })
}

async function handleSearch(): Promise<void> {
  const errorCode = await search()
  if (errorCode) showVenueError(errorCode)
}

async function handleDateTimeUpdate(datetime: Date): Promise<void> {
  const errorCode = await updateDateTime(datetime)
  if (errorCode) showVenueError(errorCode)
}

async function handleFilterUpdate(newFilters: Parameters<typeof updateFilters>[0]): Promise<void> {
  const errorCode = await updateFilters(newFilters)
  if (errorCode) showVenueError(errorCode)
}

async function onLocateMe(): Promise<void> {
  const { error } = await attempt(() => handleLocateMe())
  if (error) {
    console.error('Geolocation error:', error)
    toast.add({
      severity: 'error',
      summary: t('toast.error.title'),
      detail: t('toast.error.geolocation'),
      life: TOAST_DURATION_MS
    })
  }
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr_300px] h-full gap-0">
    <!-- Control Panel -->
    <aside class="border-r border-gray-200 overflow-y-auto order-1 md:order-1" aria-label="Search controls">
      <ControlPanel
        :loading="loading"
        :venues-count="filteredVenues.length"
        :sunny-count="sunnyVenues.length"
        :shaded-count="shadedVenues.length"
        :sun-info="sunInfo"
        :selected-date-time="selectedDateTime"
        :filters="filters"
        @search="handleSearch"
        @update-datetime="handleDateTimeUpdate"
        @update-filters="handleFilterUpdate"
        @locate-me="onLocateMe"
      />
    </aside>

    <!-- Map -->
    <div class="relative h-full order-2 md:order-2">
      <div v-if="loading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
        <ProgressSpinner />
      </div>

      <ArcGISMap
        ref="mapRef"
        :venues="filteredVenues"
        :center="mapCenter"
        :zoom="mapZoom"
        :selected-date-time="selectedDateTime"
        @bounds-changed="handleBoundsChanged"
        @venue-click="handleVenueClick"
      />
    </div>

    <!-- Venue List Sidebar -->
    <aside class="hidden lg:block border-l border-gray-200 overflow-y-auto order-3" aria-label="Venue results">
      <VenueList
        :venues="filteredVenues"
        :selected-venue-id="selectedVenueId"
        :loading="loading"
        @venue-select="handleVenueSelect"
      />
    </aside>

    <!-- Venue Detail Dialog -->
    <Dialog
      v-model:visible="showVenueDetail"
      :header="selectedVenue?.name || $t('venueDetail.title.venueDetails')"
      :modal="true"
      :dismissable-mask="true"
      :closable="true"
      :draggable="false"
      class="venue-dialog"
    >
      <VenueDetail v-if="selectedVenue" :venue="selectedVenue" />
    </Dialog>
  </div>
</template>
