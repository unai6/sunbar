<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { useMapGateway } from '@/composables/map-adapter/useMapGateway'
import { VenueErrorCode } from '@/shared/enums'

enum ToastSeverity {
  ERROR = 'error',
  WARN = 'warn'
}

const toast = useToast()
const { t } = useI18n()

const showVenuesDrawer = ref(false)
const showContributeDialog = ref(false)
const showCreateVenueDialog = ref(false)
const isPinDropMode = ref(false)
const pinCoordinates = ref<{ latitude: number; longitude: number } | null>(null)

const TOAST_DURATION_MS = 5000

const ERROR_TOAST_MAP: Record<VenueErrorCode, { severity: ToastSeverity; key: string }> = {
  [VenueErrorCode.BBOX_TOO_LARGE]: { severity: ToastSeverity.WARN, key: 'toast.error.bboxTooLarge' },
  [VenueErrorCode.NETWORK]: { severity: ToastSeverity.ERROR, key: 'toast.error.network' },
  [VenueErrorCode.FETCH_FAILED]: { severity: ToastSeverity.ERROR, key: 'toast.error.fetchVenues' }
}

const mapExplorer = useMapExplorer()

const gateway = useMapGateway()

const isNight = computed(() => mapExplorer.sunInfo.value !== null && !mapExplorer.sunInfo.value.isDaytime)

onMounted(async () => {
  await mapExplorer.initialize()
})

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
  const errorCode = await mapExplorer.handleSearch()
  if (errorCode) showVenueError(errorCode)
}

async function handleDateTimeUpdate(datetime: Date): Promise<void> {
  const errorCode = await mapExplorer.handleDateTimeUpdate(datetime)
  if (errorCode) showVenueError(errorCode)
}

async function handleFilterUpdate(newFilters: Parameters<typeof mapExplorer.handleFilterUpdate>[0]): Promise<void> {
  const errorCode = await mapExplorer.handleFilterUpdate(newFilters)
  if (errorCode) showVenueError(errorCode)
}

async function onLocateMe(): Promise<void> {
  const { error } = await attempt(() => mapExplorer.handleLocateMe())
  if (error) {
    console.error('Geolocation error:', error)

    let errorKey = 'toast.error.geolocation'

    if ('code' in error && typeof error.code === 'number') {
      const errorCode = error.code
      if (errorCode === 1) {
        errorKey = 'toast.error.geolocationDenied'
      } else if (errorCode === 2) {
        errorKey = 'toast.error.geolocationUnavailable'
      } else if (errorCode === 3) {
        errorKey = 'toast.error.geolocationTimeout'
      }
    }

    toast.add({
      severity: ToastSeverity.ERROR,
      summary: t('toast.error.title'),
      detail: t(errorKey),
      life: TOAST_DURATION_MS
    })
  }
}

async function handleVenueCreated(): Promise<void> {
  await handleSearch()
  showCreateVenueDialog.value = false
}

function handleStartCreateVenue(): void {
  isPinDropMode.value = true
}

function handlePinConfirm(): void {
  pinCoordinates.value = { latitude: mapExplorer.mapCenter.value[0], longitude: mapExplorer.mapCenter.value[1] }
  isPinDropMode.value = false
  showCreateVenueDialog.value = true
}

function handlePinCancel(): void {
  isPinDropMode.value = false
}
</script>

<template>
  <div class="relative h-full">
    <!-- Mobile Bottom Action Bar -->
    <MobileBottomActionBar
      :loading="mapExplorer.loading.value"
      :venues-count="mapExplorer.filteredVenues.value.length"
      @search="handleSearch"
      @contribute="showContributeDialog = true"
      @show-venues="showVenuesDrawer = true"
    />

    <!-- Mobile Venues Bottom Drawer -->
    <MobileVenuesDrawer
      v-model:visible="showVenuesDrawer"
      :venues="mapExplorer.filteredVenues.value"
      :selected-venue-id="mapExplorer.selectedVenueId.value"
      :loading="mapExplorer.loading.value"
      @venue-select="mapExplorer.handleVenueSelect"
    />

    <!-- Desktop Layout -->
    <div class="h-full lg:grid lg:grid-cols-[260px_1fr_300px] gap-0">
      <!-- Control Panel (desktop only) -->
      <aside class="hidden lg:block border-r border-gray-200 overflow-y-auto" aria-label="Search controls">
        <ControlPanel
          :loading="mapExplorer.loading.value"
          :venues-count="mapExplorer.filteredVenues.value.length"
          :sunny-count="mapExplorer.sunnyVenues.value.length"
          :shaded-count="mapExplorer.shadedVenues.value.length"
          :sun-info="mapExplorer.sunInfo.value"
          :selected-date-time="mapExplorer.selectedDateTime.value"
          :filters="mapExplorer.filters.value"
          @search="handleSearch"
          @update-datetime="handleDateTimeUpdate"
          @update-filters="handleFilterUpdate"
          @locate-me="onLocateMe"
        />
      </aside>

      <!-- Map -->
      <div
        class="relative h-full pb-[calc(4rem_+_env(safe-area-inset-bottom,0px))] lg:pb-0"
      >
        <div
          v-if="mapExplorer.loading.value"
          class="absolute inset-0 flex items-center justify-center z-10 transition-colors"
          :class="isNight ? 'bg-slate-900/80' : 'bg-white/80'"
        >
          <SunSpinner class="w-10 h-10" />
          <output class="sr-only">{{ $t('common.label.loading') }}</output>
        </div>

        <ClientOnly>
          <MapExplorer
            :ref="mapExplorer.mapRef"
            :gateway="gateway"
            :venues="mapExplorer.filteredVenues.value"
            :center="mapExplorer.mapCenter.value"
            :zoom="mapExplorer.mapZoom.value"
            :selected-date-time="mapExplorer.selectedDateTime.value"
            :is-user-located="!!mapExplorer.userLocation.value"
            :is-at-user-location="mapExplorer.isAtUserLocation.value"
            @bounds-changed="mapExplorer.handleBoundsChanged"
            @venue-click="mapExplorer.handleVenueClick"
            @locate-me="onLocateMe"
            @map-ready="mapExplorer.handleMapReady"
          />
        </ClientOnly>

        <!-- Pin Drop Overlay -->
        <PinDropOverlay
          :visible="isPinDropMode"
          @confirm="handlePinConfirm"
          @cancel="handlePinCancel"
        />

        <!-- Contribute Floating Button (Desktop Only) -->
        <div class="hidden lg:block absolute z-[200] bottom-6 right-6">
          <ContributeButton
            v-if="!isPinDropMode"
            v-model="showContributeDialog"
            variant="desktop"
            @click="showContributeDialog = true"
          />
        </div>

        <!-- Mobile Map Controls Overlay -->
        <div
          class="lg:hidden absolute bottom-0 left-2 right-2 z-[200] pointer-events-auto pb-[calc(5rem_+_env(safe-area-inset-bottom,0px))]"
        >
          <MapControls
            :selected-date-time="mapExplorer.selectedDateTime.value"
            :filters="mapExplorer.filters.value"
            :sunny-count="mapExplorer.sunnyVenues.value.length"
            :shaded-count="mapExplorer.shadedVenues.value.length"
            @update-datetime="handleDateTimeUpdate"
            @update-filters="handleFilterUpdate"
          />
        </div>
      </div>

      <!-- Venue List Sidebar (desktop only) -->
      <aside class="hidden lg:block border-l border-gray-200 overflow-y-auto" aria-label="Venue results">
        <VenueList
          :venues="mapExplorer.filteredVenues.value"
          :selected-venue-id="mapExplorer.selectedVenueId.value"
          :loading="mapExplorer.loading.value"
          @venue-select="mapExplorer.handleVenueSelect"
        />
      </aside>
    </div>

    <!-- Venue Detail Dialog -->
    <Dialog
      v-model:visible="mapExplorer.showVenueDetail.value"
      :header="mapExplorer.selectedVenue.value?.name || $t('venueDetail.title.venueDetails')"
      :modal="true"
      :dismissable-mask="true"
      :closable="true"
      :draggable="false"
      class="venue-dialog"
    >
      <VenueDetail v-if="mapExplorer.selectedVenue.value" :venue="mapExplorer.selectedVenue.value" />
    </Dialog>

    <!-- Contribute Dialog -->
    <ContributeDialog
      v-model="showContributeDialog"
      @create-venue="handleStartCreateVenue"
    />

    <!-- Create Venue Dialog -->
    <CreateVenueDialog
      v-model="showCreateVenueDialog"
      :initial-coordinates="pinCoordinates ?? { latitude: mapExplorer.mapCenter.value[0], longitude: mapExplorer.mapCenter.value[1] }"
      @venue-created="handleVenueCreated"
    />
  </div>
</template>
