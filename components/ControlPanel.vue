<template>
  <div class="control-panel-content">
    <!-- Search Section -->
    <div class="section">
      <h3 class="section-title">
        <i class="pi pi-search"></i>
        Search Area
      </h3>
      <Button
        label="Search This Area"
        icon="pi pi-refresh"
        :loading="loading"
        @click="$emit('search')"
        class="w-full"
        severity="warning"
      />
      <Button
        label="Use My Location"
        icon="pi pi-map-marker"
        @click="$emit('locate-me')"
        class="w-full mt-2"
        severity="secondary"
        outlined
      />
    </div>

    <!-- Date/Time Section -->
    <div class="section">
      <h3 class="section-title">
        <i class="pi pi-clock"></i>
        Date & Time
      </h3>
      <div class="datetime-controls">
        <Calendar
          v-model="localDateTime"
          :show-time="true"
          hour-format="24"
          :show-icon="true"
          :show-button-bar="true"
          date-format="dd/mm/yy"
          class="w-full"
          @update:model-value="handleDateTimeChange"
        />
        <div class="time-buttons">
          <Button
            icon="pi pi-minus"
            severity="secondary"
            text
            rounded
            @click="adjustTime(-1)"
            v-tooltip="'-1 hour'"
          />
          <Button
            label="Now"
            severity="secondary"
            text
            size="small"
            @click="setToNow"
          />
          <Button
            icon="pi pi-plus"
            severity="secondary"
            text
            rounded
            @click="adjustTime(1)"
            v-tooltip="'+1 hour'"
          />
        </div>
      </div>
    </div>

    <!-- Sun Info Section -->
    <div class="section" v-if="sunInfo">
      <h3 class="section-title">
        <i class="pi pi-sun" :class="{ 'sun-icon': sunInfo.isDaytime }"></i>
        Sun Position
      </h3>
      <div class="sun-info-grid">
        <div class="sun-info-item">
          <span class="label">Altitude</span>
          <span class="value">{{ sunInfo.position.altitudeDegrees.toFixed(1) }}°</span>
        </div>
        <div class="sun-info-item">
          <span class="label">Azimuth</span>
          <span class="value">{{ sunInfo.position.azimuthDegrees.toFixed(1) }}°</span>
        </div>
        <div class="sun-info-item">
          <span class="label">Sunrise</span>
          <span class="value">{{ formatTime(sunInfo.times.sunrise) }}</span>
        </div>
        <div class="sun-info-item">
          <span class="label">Sunset</span>
          <span class="value">{{ formatTime(sunInfo.times.sunset) }}</span>
        </div>
      </div>
      <Tag
        v-if="!sunInfo.isDaytime"
        severity="secondary"
        class="w-full mt-2 justify-center"
      >
        <i class="pi pi-moon mr-2"></i>
        It's currently nighttime
      </Tag>
    </div>

    <!-- Filters Section -->
    <div class="section">
      <h3 class="section-title">
        <i class="pi pi-filter"></i>
        Filters
      </h3>
      <div class="filter-options">
        <div class="filter-option">
          <Checkbox
            v-model="localFilters.onlySunny"
            :binary="true"
            input-id="filter-sunny"
            @update:model-value="emitFilters"
          />
          <label for="filter-sunny">
            <i class="pi pi-sun" style="color: var(--sunbar-sunny)"></i>
            Only sunny venues
          </label>
        </div>
        <div class="filter-option">
          <Checkbox
            v-model="localFilters.onlyWithOutdoorSeating"
            :binary="true"
            input-id="filter-outdoor"
            @update:model-value="emitFilters"
          />
          <label for="filter-outdoor">
            <i class="pi pi-table"></i>
            Only with outdoor seating
          </label>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="section">
      <h3 class="section-title">
        <i class="pi pi-chart-bar"></i>
        Results
      </h3>
      <div class="stats-grid">
        <div class="stat-item total">
          <span class="stat-value">{{ venuesCount }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item sunny">
          <span class="stat-value">{{ sunnyCount }}</span>
          <span class="stat-label">Sunny</span>
        </div>
        <div class="stat-item shaded">
          <span class="stat-value">{{ shadedCount }}</span>
          <span class="stat-label">Shaded</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import Tag from 'primevue/tag';
import type { GetSunInfoResult } from '~/application/use-cases/GetSunInfoUseCase';
import type { VenueFilters } from '~/composables/useVenues';

interface Props {
  loading: boolean;
  venuesCount: number;
  sunnyCount: number;
  shadedCount: number;
  sunInfo: GetSunInfoResult | null;
  selectedDateTime: Date;
  filters: VenueFilters;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  search: [];
  'update-datetime': [datetime: Date];
  'update-filters': [filters: Partial<VenueFilters>];
  'locate-me': [];
}>();

// Local state
const localDateTime = ref(props.selectedDateTime);
const localFilters = ref({ ...props.filters });

// Watch for prop changes
watch(() => props.selectedDateTime, (newVal) => {
  localDateTime.value = newVal;
});

watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });

// Methods
const handleDateTimeChange = (value: Date | null): void => {
  if (value) {
    emit('update-datetime', value);
  }
};

const adjustTime = (hours: number): void => {
  const newDate = new Date(localDateTime.value);
  newDate.setHours(newDate.getHours() + hours);
  localDateTime.value = newDate;
  emit('update-datetime', newDate);
};

const setToNow = (): void => {
  const now = new Date();
  localDateTime.value = now;
  emit('update-datetime', now);
};

const emitFilters = (): void => {
  emit('update-filters', localFilters.value);
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.control-panel-content {
  padding: 1rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-title i {
  font-size: 1rem;
  color: #6b7280;
}

.datetime-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.sun-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.sun-info-item {
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.sun-info-item .label {
  font-size: 0.75rem;
  color: #6b7280;
}

.sun-info-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-option label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f9fafb;
}

.stat-item.sunny {
  background: #fef3c7;
}

.stat-item.shaded {
  background: #f3f4f6;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-item.sunny .stat-value {
  color: #d97706;
}

.stat-item.shaded .stat-value {
  color: #6b7280;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.w-full {
  width: 100%;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.justify-center {
  justify-content: center;
}
</style>
