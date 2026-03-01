import type { Ref } from 'vue'
import type { Venue } from '~/shared/types'

export interface MapCallbacks {
  onBoundsChanged: (bounds: { south: number; west: number; north: number; east: number }) => void
  onVenueClick: (venueId: string) => void
}

/**
 * IMapGateway
 * Abstracts the map rendering engine (ArcGIS, MapLibre, etc.) from the
 * AppMap component. Any map implementation must satisfy this contract.
 */
export interface IMapGateway {
  /** Reactive loading state reflecting the active view */
  readonly isLoading: Ref<boolean>

  /** Set up the map inside the given container */
  initialize(
    container: HTMLDivElement,
    center: [number, number],
    zoom: number,
    callbacks: MapCallbacks
  ): Promise<void>

  /** Destroy all map resources */
  cleanup(): void

  /** Animate camera to a lat/lng, optionally at a given zoom level */
  flyTo(latitude: number, longitude: number, zoom?: number): void

  /** Silently reposition the map center */
  setCenter(center: [number, number]): void

  /** Set the zoom level */
  setZoom(zoom: number): void

  /** Close any open popups */
  closePopups(): void

  /** Re-render venue markers from the current venue list */
  updateVenueMarkers(venues: Venue[]): void

  /** Place the user-location pin on the map */
  setUserLocation(latitude: number, longitude: number): void

  /** Remove the user-location pin */
  clearUserLocation(): void
}
