import type { GeolocationErrorType } from '../enums/geolocation-error-type'

// Geolocation state — tracks the current position, accuracy, and any error.
export type GeolocationState = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  errorType: GeolocationErrorType | null;
  loading: boolean;
};
