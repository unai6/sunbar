import type { Ref } from 'vue'
import type { Venue } from '@/shared/types'

export interface MapCallbacks {
  onBoundsChanged: (bounds: { south: number; west: number; north: number; east: number }) => void
  onVenueClick: (venueId: string) => void
}

// IMapGateway
// Abstracts the map rendering engine (ArcGIS, MapLibre, etc.) from the
// AppMap component. Every map implementation must satisfy this interface.
export interface IMapGateway {
  // Reactive loading state reflecting whether the active view is still loading.
  readonly isLoading: Ref<boolean>

  // Set up the map inside the given container element.
  initialize(
    container: HTMLDivElement,
    center: [number, number],
    zoom: number,
    callbacks: MapCallbacks
  ): Promise<void>

  // Destroy all map resources and clean up event listeners.
  cleanup(): void

  // Animate the camera to the given lat/lng, optionally snapping to a zoom level.
  flyTo(latitude: number, longitude: number, zoom?: number): void

  // Silently reposition the map center without animation.
  setCenter(center: [number, number]): void

  // Set the zoom level.
  setZoom(zoom: number): void

  // Close any open popups.
  closePopups(): void

  // Re-render venue markers from the current venue list.
  updateVenueMarkers(venues: Venue[]): void

  // Place the user-location pin on the map.
  setUserLocation(latitude: number, longitude: number): void

  // Remove the user-location pin from the map.
  clearUserLocation(): void
}
