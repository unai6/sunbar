import { describe, it, expect, vi } from 'vitest'
import { GetSunnyVenuesUseCase, type GetSunnyVenuesQuery } from '../../application/use-cases/GetSunnyVenuesUseCase'
import { Venue, VenueType } from '../../domain/entities/Venue'
import { Coordinates } from '../../domain/value-objects/Coordinates'
import { SunPosition } from '../../domain/value-objects/SunPosition'
import { SunlightStatus } from '../../domain/value-objects/SunlightStatus'

describe('GetSunnyVenuesUseCase', () => {
  const createMockVenueRepository = () => ({
    findByBoundingBox: vi.fn(),
    findNearby: vi.fn(),
    findById: vi.fn()
  })

  const createMockBuildingRepository = () => ({
    findByBoundingBox: vi.fn(),
    findNearby: vi.fn()
  })

  const createMockSunCalculator = () => ({
    getPosition: vi.fn(),
    getSunTimes: vi.fn(),
    isDaytime: vi.fn()
  })

  const createMockShadowAnalyzer = () => ({
    analyzeVenue: vi.fn(),
    analyzeVenues: vi.fn()
  })

  const createTestVenue = (id: string, lat: number, lng: number) => {
    return Venue.create({
      id,
      name: `Test Venue ${id}`,
      coordinates: Coordinates.create({ latitude: lat, longitude: lng }),
      type: VenueType.CAFE,
      outdoor_seating: true
    })
  }

  describe('execute', () => {
    it('should fetch venues by bounding box and analyze sunlight', async () => {
      const venueRepo = createMockVenueRepository()
      const buildingRepo = createMockBuildingRepository()
      const sunCalculator = createMockSunCalculator()
      const shadowAnalyzer = createMockShadowAnalyzer()

      const venue1 = createTestVenue('1', 40.42, -3.70)
      const venue2 = createTestVenue('2', 40.41, -3.71)

      const statusMap = new Map<string, SunlightStatus>()
      statusMap.set('1', SunlightStatus.sunny())
      statusMap.set('2', SunlightStatus.sunny())

      venueRepo.findByBoundingBox.mockResolvedValue([venue1, venue2])
      buildingRepo.findByBoundingBox.mockResolvedValue([])
      sunCalculator.getPosition.mockReturnValue(SunPosition.create({ altitude: 1.0, azimuth: 3.14, timestamp: new Date() }))
      sunCalculator.isDaytime.mockReturnValue(true)
      shadowAnalyzer.analyzeVenues.mockReturnValue(statusMap)

      const useCase = new GetSunnyVenuesUseCase(
        venueRepo,
        buildingRepo,
        sunCalculator,
        shadowAnalyzer
      )

      const query: GetSunnyVenuesQuery = {
        bbox: { north: 40.43, south: 40.40, east: -3.69, west: -3.72 }
      }

      const result = await useCase.execute(query)

      expect(result.venues.length).toBe(2)
      expect(result.sunPosition.isAboveHorizon).toBe(true)
      expect(venueRepo.findByBoundingBox).toHaveBeenCalledWith(query.bbox)
      expect(shadowAnalyzer.analyzeVenues).toHaveBeenCalled()
    })

    it('should fetch venues by center and radius', async () => {
      const venueRepo = createMockVenueRepository()
      const buildingRepo = createMockBuildingRepository()
      const sunCalculator = createMockSunCalculator()
      const shadowAnalyzer = createMockShadowAnalyzer()

      const venue1 = createTestVenue('1', 40.42, -3.70)

      const statusMap = new Map<string, SunlightStatus>()
      statusMap.set('1', SunlightStatus.sunny())

      venueRepo.findNearby.mockResolvedValue([venue1])
      buildingRepo.findNearby.mockResolvedValue([])
      sunCalculator.getPosition.mockReturnValue(SunPosition.create({ altitude: 1.0, azimuth: 3.14, timestamp: new Date() }))
      sunCalculator.isDaytime.mockReturnValue(true)
      shadowAnalyzer.analyzeVenues.mockReturnValue(statusMap)

      const useCase = new GetSunnyVenuesUseCase(
        venueRepo,
        buildingRepo,
        sunCalculator,
        shadowAnalyzer
      )

      const query: GetSunnyVenuesQuery = {
        center: { latitude: 40.42, longitude: -3.70 },
        radiusMeters: 500
      }

      const result = await useCase.execute(query)

      expect(result.venues.length).toBe(1)
      expect(venueRepo.findNearby).toHaveBeenCalled()
      expect(buildingRepo.findNearby).toHaveBeenCalled()
    })

    it('should throw error if no location criteria provided', async () => {
      const venueRepo = createMockVenueRepository()
      const buildingRepo = createMockBuildingRepository()
      const sunCalculator = createMockSunCalculator()
      const shadowAnalyzer = createMockShadowAnalyzer()

      const useCase = new GetSunnyVenuesUseCase(
        venueRepo,
        buildingRepo,
        sunCalculator,
        shadowAnalyzer
      )

      const query: GetSunnyVenuesQuery = {}

      await expect(useCase.execute(query)).rejects.toThrow('Either bbox or center+radiusMeters must be provided')
    })

    it('should count sunny and shaded venues correctly', async () => {
      const venueRepo = createMockVenueRepository()
      const buildingRepo = createMockBuildingRepository()
      const sunCalculator = createMockSunCalculator()
      const shadowAnalyzer = createMockShadowAnalyzer()

      const venue1 = createTestVenue('1', 40.42, -3.70)
      const venue2 = createTestVenue('2', 40.41, -3.71)
      const venue3 = createTestVenue('3', 40.40, -3.72)

      // First two are sunny, third is shaded
      const statusMap = new Map<string, SunlightStatus>()
      statusMap.set('1', SunlightStatus.sunny())
      statusMap.set('2', SunlightStatus.sunny())
      statusMap.set('3', SunlightStatus.shaded())

      venueRepo.findByBoundingBox.mockResolvedValue([venue1, venue2, venue3])
      buildingRepo.findByBoundingBox.mockResolvedValue([])
      sunCalculator.getPosition.mockReturnValue(SunPosition.create({ altitude: 1.0, azimuth: 3.14, timestamp: new Date() }))
      sunCalculator.isDaytime.mockReturnValue(true)
      shadowAnalyzer.analyzeVenues.mockReturnValue(statusMap)

      const useCase = new GetSunnyVenuesUseCase(
        venueRepo,
        buildingRepo,
        sunCalculator,
        shadowAnalyzer
      )

      const query: GetSunnyVenuesQuery = {
        bbox: { north: 40.43, south: 40.39, east: -3.69, west: -3.73 }
      }

      const result = await useCase.execute(query)

      expect(result.sunnyCount).toBe(2)
      expect(result.shadedCount).toBe(1)
    })
  })
})
