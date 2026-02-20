/**
 * API-related types for venues
 */

/**
 * Venue data from API
 */
export type ApiVenue = {
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
  venues: ApiVenue[];
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
