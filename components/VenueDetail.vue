<template>
  <div class="venue-detail">
    <!-- Sunlight Status Banner -->
    <div
      class="status-banner"
      :class="{ sunny: venue.isSunny(), shaded: !venue.isSunny() }"
    >
      <i :class="venue.isSunny() ? 'pi pi-sun sun-icon' : 'pi pi-cloud'"></i>
      <div class="status-info">
        <span class="status-label">
          {{ venue.isSunny() ? 'Currently Sunny! ☀️' : 'Currently Shaded' }}
        </span>
        <span class="status-confidence" v-if="venue.sunlightStatus">
          {{ Math.round(venue.sunlightStatus.confidence * 100) }}% confidence
        </span>
      </div>
    </div>

    <!-- Venue Info -->
    <div class="info-section">
      <div class="info-row">
        <i class="pi pi-tag"></i>
        <div>
          <span class="info-label">Type</span>
          <span class="info-value">{{ getVenueTypeLabel(venue.type) }}</span>
        </div>
      </div>

      <div class="info-row" v-if="venue.address">
        <i class="pi pi-map-marker"></i>
        <div>
          <span class="info-label">Address</span>
          <span class="info-value">{{ venue.address }}</span>
        </div>
      </div>

      <div class="info-row" v-if="venue.outdoor_seating !== undefined">
        <i class="pi pi-external-link"></i>
        <div>
          <span class="info-label">Outdoor Seating</span>
          <span class="info-value">
            {{ venue.outdoor_seating ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>

      <div class="info-row" v-if="venue.openingHours">
        <i class="pi pi-clock"></i>
        <div>
          <span class="info-label">Opening Hours</span>
          <span class="info-value">{{ venue.openingHours }}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <Button
        v-if="venue.website"
        label="Website"
        icon="pi pi-external-link"
        severity="secondary"
        outlined
        size="small"
        @click="openUrl(venue.website)"
      />
      <Button
        v-if="venue.phone"
        label="Call"
        icon="pi pi-phone"
        severity="secondary"
        outlined
        size="small"
        @click="callPhone(venue.phone)"
      />
      <Button
        label="Directions"
        icon="pi pi-directions"
        severity="warning"
        size="small"
        @click="openDirections"
      />
    </div>

    <!-- Shadow Reason -->
    <div class="shadow-info" v-if="venue.sunlightStatus?.reason">
      <i class="pi pi-info-circle"></i>
      <span>{{ venue.sunlightStatus.reason }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import type { Venue, VenueType } from '~/domain/entities/Venue';

interface Props {
  venue: Venue;
}

const props = defineProps<Props>();

const getVenueTypeLabel = (type: VenueType): string => {
  const labels: Record<string, string> = {
    bar: '🍺 Bar',
    restaurant: '🍽️ Restaurant',
    cafe: '☕ Café',
    pub: '🍻 Pub',
    biergarten: '🌳 Beer Garden'
  };
  return labels[type] || type;
};

const openUrl = (url: string | undefined): void => {
  if (url) {
    window.open(url, '_blank');
  }
};

const callPhone = (phone: string | undefined): void => {
  if (phone) {
    window.location.href = `tel:${phone}`;
  }
};

const openDirections = (): void => {
  const { latitude, longitude } = props.venue.coordinates;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  window.open(url, '_blank');
};
</script>

<style scoped>
.venue-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
}

.status-banner.sunny {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
}

.status-banner.shaded {
  background: #f3f4f6;
  color: #4b5563;
}

.status-banner i {
  font-size: 2rem;
}

.status-info {
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 1.1rem;
  font-weight: 600;
}

.status-confidence {
  font-size: 0.85rem;
  opacity: 0.8;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.info-row > i {
  color: #6b7280;
  margin-top: 0.2rem;
}

.info-row > div {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 0.95rem;
  color: #1f2937;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
}

.shadow-info {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #6b7280;
}

.shadow-info i {
  flex-shrink: 0;
  margin-top: 0.1rem;
}
</style>
