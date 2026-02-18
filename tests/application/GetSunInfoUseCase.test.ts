import { describe, it, expect, vi } from 'vitest'
import { GetSunInfoUseCase, type GetSunInfoQuery } from '../../application/use-cases/GetSunInfoUseCase'
import { SunPosition } from '../../domain/value-objects/SunPosition'

describe('GetSunInfoUseCase', () => {
  const createMockSunCalculator = () => ({
    getPosition: vi.fn(),
    getSunTimes: vi.fn(),
    isDaytime: vi.fn()
  })

  const madridQuery: GetSunInfoQuery = {
    latitude: 40.4168,
    longitude: -3.7038,
    date: new Date('2024-06-21T12:00:00')
  }

  describe('execute', () => {
    it('should return sun info for given location and time', () => {
      const mockCalculator = createMockSunCalculator()
      const mockPosition = SunPosition.create({ altitude: 1.0, azimuth: 3.14, timestamp: new Date() })
      const mockTimes = {
        sunrise: new Date('2024-06-21T06:00:00'),
        sunset: new Date('2024-06-21T21:00:00'),
        solarNoon: new Date('2024-06-21T13:30:00'),
        goldenHour: new Date('2024-06-21T19:30:00')
      }

      mockCalculator.getPosition.mockReturnValue(mockPosition)
      mockCalculator.getSunTimes.mockReturnValue(mockTimes)
      mockCalculator.isDaytime.mockReturnValue(true)

      const useCase = new GetSunInfoUseCase(mockCalculator)
      const result = useCase.execute(madridQuery)

      // Check the result structure (use case transforms SunPosition to plain object)
      // azimuth 3.14 radians = 180 degrees + 180 = 360, wraps to 0 degrees (near 360)
      expect(result.position.azimuthDegrees).toBeCloseTo(359.91, 1)
      expect(result.position.altitudeDegrees).toBeCloseTo(57.30, 1)
      expect(result.position.isAboveHorizon).toBe(true)
      expect(result.times).toBe(mockTimes)
      expect(result.isDaytime).toBe(true)

      expect(mockCalculator.getPosition).toHaveBeenCalled()
      expect(mockCalculator.getSunTimes).toHaveBeenCalled()
      expect(mockCalculator.isDaytime).toHaveBeenCalled()
    })

    it('should return isDaytime false at night', () => {
      const mockCalculator = createMockSunCalculator()
      const mockPosition = SunPosition.create({ altitude: -0.5, azimuth: 0, timestamp: new Date() })
      const mockTimes = {
        sunrise: new Date('2024-06-21T06:00:00'),
        sunset: new Date('2024-06-21T21:00:00'),
        solarNoon: new Date('2024-06-21T13:30:00'),
        goldenHour: new Date('2024-06-21T19:30:00')
      }

      mockCalculator.getPosition.mockReturnValue(mockPosition)
      mockCalculator.getSunTimes.mockReturnValue(mockTimes)
      mockCalculator.isDaytime.mockReturnValue(false)

      const useCase = new GetSunInfoUseCase(mockCalculator)
      const midnightQuery: GetSunInfoQuery = {
        latitude: 40.4168,
        longitude: -3.7038,
        date: new Date('2024-06-21T02:00:00')
      }
      const result = useCase.execute(midnightQuery)

      expect(result.isDaytime).toBe(false)
    })
  })
})
