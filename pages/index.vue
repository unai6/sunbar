<template>
  <div class="home-page">
    <!-- Control Panel -->
    <aside class="control-panel sidebar-panel">
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
        @update-filters="setFilters"
        @locate-me="handleLocateMe"
      />
    </aside>

    <!-- Map -->
    <div class="map-wrapper">
      <div v-if="loading" class="loading-overlay">
        <ProgressSpinner />
      </div>

      <SunBarMap
        ref="mapRef"
        :venues="filteredVenues"
        :center="mapCenter"
        :zoom="mapZoom"
        @bounds-changed="handleBoundsChanged"
        @venue-click="handleVenueClick"
      />
    </div>

    <!-- Venue List Sidebar -->
    <aside class="venue-list-panel sidebar-panel">
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
      :header="selectedVenue?.name || 'Venue Details'"
      :modal="true"
      :dismissable-mask="true"
      :style="{ width: '450px' }"
    >
      <VenueDetail v-if="selectedVenue" :venue="selectedVenue" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Dialog from 'primevue/dialog';
import ProgressSpinner from 'primevue/progressspinner';
import type { Venue } from '~/domain/entities/Venue';
import type { BoundingBox } from '~/domain/repositories/VenueRepository';

// Composables
const {
  venues,
  loading,
  error,
  filters,
  sunnyVenues,
  shadedVenues,
  filteredVenues,
  fetchVenuesByBoundingBox,
  setFilters
} = useVenues();

const {
  sunInfo,
  selectedDateTime,
  updateSunInfo,
  setDateTime
} = useSunInfo();

const { state: geoState, getCurrentPosition } = useGeolocation();

// Refs
const mapRef = ref<InstanceType<typeof SunBarMap> | null>(null);
const mapCenter = ref<[number, number]>([40.4168, -3.7038]); // Madrid default
const mapZoom = ref(15);
const selectedVenueId = ref<string | null>(null);
const selectedVenue = ref<Venue | null>(null);
const showVenueDetail = ref(false);
const currentBounds = ref<BoundingBox | null>(null);

// Methods
const handleSearch = async (): Promise<void> => {
  if (!currentBounds.value) return;

  await fetchVenuesByBoundingBox(currentBounds.value, selectedDateTime.value);

  // Update sun info for map center
  const centerLat = (currentBounds.value.north + currentBounds.value.south) / 2;
  const centerLng = (currentBounds.value.east + currentBounds.value.west) / 2;
  updateSunInfo(centerLat, centerLng, selectedDateTime.value);
};

const handleBoundsChanged = (bounds: BoundingBox): void => {
  currentBounds.value = bounds;

  // Update sun info for new center
  const centerLat = (bounds.north + bounds.south) / 2;
  const centerLng = (bounds.east + bounds.west) / 2;
  updateSunInfo(centerLat, centerLng, selectedDateTime.value);
};

const handleDateTimeUpdate = async (datetime: Date): Promise<void> => {
  setDateTime(datetime);

  if (currentBounds.value) {
    await fetchVenuesByBoundingBox(currentBounds.value, datetime);
  }
};

const handleVenueClick = (venue: Venue): void => {
  selectedVenue.value = venue;
  showVenueDetail.value = true;
};

const handleVenueSelect = (venue: Venue): void => {
  selectedVenueId.value = venue.id;
  mapRef.value?.flyTo(venue.coordinates.latitude, venue.coordinates.longitude, 17);
};

const handleLocateMe = async (): Promise<void> => {
  try {
    await getCurrentPosition();
    if (geoState.value.latitude && geoState.value.longitude) {
      mapCenter.value = [geoState.value.latitude, geoState.value.longitude];
      mapZoom.value = 16;
      mapRef.value?.flyTo(geoState.value.latitude, geoState.value.longitude, 16);
    }
  } catch (e) {
    console.error('Failed to get location:', e);
  }
};

// Initialize with user location if available
onMounted(async () => {
  try {
    await getCurrentPosition();
    if (geoState.value.latitude && geoState.value.longitude) {
      mapCenter.value = [geoState.value.latitude, geoState.value.longitude];
      updateSunInfo(geoState.value.latitude, geoState.value.longitude);
    }
  } catch {
    // Use default location (Madrid)
    updateSunInfo(mapCenter.value[0], mapCenter.value[1]);
  }
});

// Watch for errors
watch(error, (newError) => {
  if (newError) {
    console.error('Error:', newError);
  }
});
</script>

<style scoped>
.home-page {
  display: grid;
  grid-template-columns: 320px 1fr 300px;
  height: 100%;
  gap: 0;
}

.control-panel {
  border-radius: 0;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.map-wrapper {
  position: relative;
  height: 100%;
}

.venue-list-panel {
  border-radius: 0;
  border-left: 1px solid #e5e7eb;
  overflow-y: auto;
}

@media (max-width: 1200px) {
  .home-page {
    grid-template-columns: 280px 1fr;
  }

  .venue-list-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .home-page {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .control-panel {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 200px;
  }
}
</style>
