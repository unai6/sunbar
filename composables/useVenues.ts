import { ref, computed } from 'vue';
import type { Venue } from '~/domain/entities/Venue';
import type { BoundingBox } from '~/domain/repositories/VenueRepository';
import { GetSunnyVenuesUseCase, type GetSunnyVenuesResult } from '~/application/use-cases/GetSunnyVenuesUseCase';
import { OverpassVenueAdapter } from '~/infrastructure/adapters/OverpassVenueAdapter';
import { OverpassBuildingAdapter } from '~/infrastructure/adapters/OverpassBuildingAdapter';
import { SunCalcAdapter } from '~/infrastructure/adapters/SunCalcAdapter';
import { ShadowAnalyzerAdapter } from '~/infrastructure/adapters/ShadowAnalyzerAdapter';

export interface VenueFilters {
  onlySunny: boolean;
  onlyWithOutdoorSeating: boolean;
}

export function useVenues() {
  const config = useRuntimeConfig();

  // State
  const venues = ref<Venue[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastResult = ref<GetSunnyVenuesResult | null>(null);

  // Filters
  const filters = ref<VenueFilters>({
    onlySunny: false,
    onlyWithOutdoorSeating: false
  });

  // Computed
  const sunnyVenues = computed(() =>
    venues.value.filter(v => v.isSunny())
  );

  const shadedVenues = computed(() =>
    venues.value.filter(v => !v.isSunny())
  );

  const filteredVenues = computed(() => {
    let result = venues.value;

    if (filters.value.onlySunny) {
      result = result.filter(v => v.isSunny());
    }

    if (filters.value.onlyWithOutdoorSeating) {
      result = result.filter(v => v.hasOutdoorSeating());
    }

    return result;
  });

  // Create use case with dependencies
  const createUseCase = (): GetSunnyVenuesUseCase => {
    const venueRepo = new OverpassVenueAdapter(config.public.overpassApiUrl as string);
    const buildingRepo = new OverpassBuildingAdapter(config.public.overpassApiUrl as string);
    const sunCalculator = new SunCalcAdapter();
    const shadowAnalyzer = new ShadowAnalyzerAdapter();

    return new GetSunnyVenuesUseCase(
      venueRepo,
      buildingRepo,
      sunCalculator,
      shadowAnalyzer
    );
  };

  // Actions
  const fetchVenuesByBoundingBox = async (
    bbox: BoundingBox,
    datetime?: Date
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const useCase = createUseCase();
      const result = await useCase.execute({
        bbox,
        datetime,
        onlySunny: false, // We filter client-side for reactivity
        onlyWithOutdoorSeating: false
      });

      venues.value = result.venues;
      lastResult.value = result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch venues';
      venues.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchVenuesNearby = async (
    latitude: number,
    longitude: number,
    radiusMeters: number = 500,
    datetime?: Date
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const useCase = createUseCase();
      const result = await useCase.execute({
        center: { latitude, longitude },
        radiusMeters,
        datetime,
        onlySunny: false,
        onlyWithOutdoorSeating: false
      });

      venues.value = result.venues;
      lastResult.value = result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch venues';
      venues.value = [];
    } finally {
      loading.value = false;
    }
  };

  const refreshSunlightStatus = async (datetime?: Date): Promise<void> => {
    if (!lastResult.value) return;

    // Re-fetch with new datetime
    const bbox = lastResult.value.venues.length > 0
      ? calculateBoundingBox(lastResult.value.venues)
      : null;

    if (bbox) {
      await fetchVenuesByBoundingBox(bbox, datetime);
    }
  };

  const setFilters = (newFilters: Partial<VenueFilters>): void => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const clearVenues = (): void => {
    venues.value = [];
    lastResult.value = null;
    error.value = null;
  };

  return {
    // State
    venues,
    loading,
    error,
    lastResult,
    filters,

    // Computed
    sunnyVenues,
    shadedVenues,
    filteredVenues,

    // Actions
    fetchVenuesByBoundingBox,
    fetchVenuesNearby,
    refreshSunlightStatus,
    setFilters,
    clearVenues
  };
}

// Helper function
function calculateBoundingBox(venues: Venue[]): BoundingBox {
  const lats = venues.map(v => v.coordinates.latitude);
  const lngs = venues.map(v => v.coordinates.longitude);

  return {
    south: Math.min(...lats) - 0.001,
    north: Math.max(...lats) + 0.001,
    west: Math.min(...lngs) - 0.001,
    east: Math.max(...lngs) + 0.001
  };
}
