/**
 * API-related types for venues
 */

/**
 * Venue shape returned by the Nuxt API to the client
 */
export type VenueResponse = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  outdoor_seating?: boolean;
  phone?: string;
  website?: string;
  openingHours?: string;
  rating?: number;
  priceRange?: string;
  description?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  sunlightStatus?: 'sunny' | 'shaded' | 'partially_sunny';
};

/**
 * API response for venues endpoint
 */
export type ApiResponse = {
  venues: VenueResponse[];
  sunPosition: {
    azimuth: number;
    altitude: number;
    isDaytime: boolean;
  };
  meta: {
    timestamp: string;
    buildingsAnalyzed: number;
    venueCount: number;
  };
};
