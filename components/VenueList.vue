<template>
  <div class="venue-list">
    <div class="venue-list-header">
      <h3>Nearby Venues</h3>
      <span class="venue-count">{{ venues.length }} found</span>
    </div>

    <div v-if="loading" class="loading-state">
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>

    <div v-else-if="venues.length === 0" class="empty-state">
      <i class="pi pi-search" style="font-size: 2rem; color: #d1d5db"></i>
      <p>No venues found</p>
      <p class="hint">Try searching a different area</p>
    </div>

    <div v-else class="venue-items">
      <div
        v-for="venue in venues"
        :key="venue.id"
        class="venue-item"
        :class="{
          selected: venue.id === selectedVenueId,
          sunny: venue.isSunny()
        }"
        @click="$emit('venue-select', venue)"
      >
        <div class="venue-icon" :class="{ sunny: venue.isSunny() }">
          <i :class="getVenueIcon(venue.type)"></i>
        </div>
        <div class="venue-info">
          <h4 class="venue-name">{{ venue.name }}</h4>
          <div class="venue-meta">
            <span class="venue-type">{{ getVenueTypeLabel(venue.type) }}</span>
            <span v-if="venue.outdoor_seating" class="outdoor-badge">
              <i class="pi pi-external-link"></i>
              Outdoor
            </span>
          </div>
        </div>
        <div class="venue-status">
          <Tag
            :severity="venue.isSunny() ? 'warning' : 'secondary'"
            :value="venue.isSunny() ? 'Sunny' : 'Shaded'"
          >
            <template #default>
              <i :class="venue.isSunny() ? 'pi pi-sun' : 'pi pi-cloud'" class="mr-1"></i>
              {{ venue.isSunny() ? 'Sunny' : 'Shaded' }}
            </template>
          </Tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import type { Venue, VenueType } from '~/domain/entities/Venue';

interface Props {
  venues: Venue[];
  selectedVenueId: string | null;
  loading: boolean;
}

defineProps<Props>();

defineEmits<{
  'venue-select': [venue: Venue];
}>();

const getVenueIcon = (type: VenueType): string => {
  const icons: Record<string, string> = {
    bar: 'pi pi-star',
    restaurant: 'pi pi-bookmark',
    cafe: 'pi pi-heart',
    pub: 'pi pi-star-fill',
    biergarten: 'pi pi-sun'
  };
  return icons[type] || 'pi pi-map-marker';
};

const getVenueTypeLabel = (type: VenueType): string => {
  const labels: Record<string, string> = {
    bar: 'Bar',
    restaurant: 'Restaurant',
    cafe: 'Café',
    pub: 'Pub',
    biergarten: 'Beer Garden'
  };
  return labels[type] || type;
};
</script>

<style scoped>
.venue-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.venue-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.venue-list-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.venue-count {
  font-size: 0.85rem;
  color: #6b7280;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.5rem;
  flex: 1;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

.empty-state .hint {
  font-size: 0.85rem;
  color: #9ca3af;
}

.venue-items {
  flex: 1;
  overflow-y: auto;
}

.venue-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s;
}

.venue-item:hover {
  background-color: #f9fafb;
}

.venue-item.selected {
  background-color: #fef3c7;
}

.venue-item.sunny {
  border-left: 3px solid #fbbf24;
}

.venue-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.venue-icon.sunny {
  background: #fef3c7;
  color: #d97706;
}

.venue-info {
  flex: 1;
  min-width: 0;
}

.venue-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.venue-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.venue-type {
  font-size: 0.75rem;
  color: #6b7280;
}

.outdoor-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: #059669;
  background: #d1fae5;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.venue-status {
  flex-shrink: 0;
}

.mr-1 {
  margin-right: 0.25rem;
}
</style>
