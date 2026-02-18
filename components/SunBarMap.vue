<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { Map as LeafletMap, CircleMarker } from 'leaflet';
import type { Venue } from '~/domain/entities/Venue';

interface Props {
  venues: Venue[];
  center: [number, number];
  zoom: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'bounds-changed': [bounds: { south: number; west: number; north: number; east: number }];
  'venue-click': [venue: Venue];
}>();

// Refs
const mapContainer = ref<HTMLElement | null>(null);
let map: LeafletMap | null = null;
let markers: globalThis.Map<string, CircleMarker> = new globalThis.Map();
let L: typeof import('leaflet') | null = null;

// Expose methods
defineExpose({
  flyTo: (lat: number, lng: number, zoom?: number) => {
    if (map) {
      map.flyTo([lat, lng], zoom || map.getZoom());
    }
  }
});

const emitBounds = (): void => {
  if (!map) return;
  const bounds = map.getBounds();
  emit('bounds-changed', {
    south: bounds.getSouth(),
    west: bounds.getWest(),
    north: bounds.getNorth(),
    east: bounds.getEast()
  });
};

const createMarker = (venue: Venue): CircleMarker | null => {
  if (!L) return null;

  const isSunny = venue.isSunny();

  const marker = L.circleMarker(
    [venue.coordinates.latitude, venue.coordinates.longitude],
    {
      radius: 10,
      fillColor: isSunny ? '#fbbf24' : '#6b7280',
      color: isSunny ? '#f59e0b' : '#4b5563',
      weight: 2,
      opacity: 1,
      fillOpacity: isSunny ? 0.9 : 0.6
    }
  );

  const sunlightText = venue.sunlightStatus
    ? `<span class="status ${isSunny ? 'sunny' : 'shaded'}">
        <i class="pi ${isSunny ? 'pi-sun' : 'pi-cloud'}"></i>
        ${isSunny ? 'Sunny' : 'Shaded'}
       </span>`
    : '';

  const popupContent = `
    <div class="venue-popup">
      <h3>${venue.name}</h3>
      <p style="color: #6b7280; font-size: 0.85rem; margin-bottom: 8px;">
        ${getVenueTypeLabel(venue.type)}
        ${venue.outdoor_seating ? ' • Outdoor seating' : ''}
      </p>
      ${sunlightText}
      ${venue.address ? `<p style="margin-top: 8px; font-size: 0.85rem;">${venue.address}</p>` : ''}
    </div>
  `;

  marker.bindPopup(popupContent);

  marker.on('click', () => {
    emit('venue-click', venue);
  });

  return marker;
};

const getVenueTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    bar: 'Bar',
    restaurant: 'Restaurant',
    cafe: 'Cafe',
    pub: 'Pub',
    biergarten: 'Beer Garden'
  };
  return labels[type] || type;
};

const updateMarkers = (): void => {
  if (!map || !L) return;

  markers.forEach((marker: CircleMarker) => marker.remove());
  markers.clear();

  props.venues.forEach(venue => {
    const marker = createMarker(venue);
    if (marker) {
      marker.addTo(map!);
      markers.set(venue.id, marker);
    }
  });
};

onMounted(async () => {
  if (!mapContainer.value) return;

  L = await import('leaflet');

  map = L.map(mapContainer.value).setView(props.center, props.zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  map.on('moveend', emitBounds);
  map.on('zoomend', emitBounds);

  emitBounds();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
  markers.clear();
});

watch(() => props.venues, () => {
  updateMarkers();
}, { deep: true });

watch(() => props.center, (newCenter) => {
  if (map) {
    map.setView(newCenter, props.zoom);
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
