import { describe, expect, it } from 'vitest'
import { useSunPosition } from '~/composables/useSunPosition'

const {
  create,
  getAltitudeDegrees,
  getAzimuthDegrees,
  isAboveHorizon
} = useSunPosition()

describe('useSunPosition Composable', () => {
  describe('create', () => {
    it('should create sun position', () => {
      const position = create(1.5, 0.5, new Date())
      expect(position.azimuth).toBe(1.5)
      expect(position.altitude).toBe(0.5)
    })
  })

  describe('isAboveHorizon', () => {
    it('should return true when altitude is positive', () => {
      const position = create(0, 0.5, new Date())
      expect(isAboveHorizon(position)).toBe(true)
    })

    it('should return false when altitude is negative', () => {
      const position = create(0, -0.5, new Date())
      expect(isAboveHorizon(position)).toBe(false)
    })

    it('should return false when altitude is exactly 0', () => {
      const position = create(0, 0, new Date())
      expect(isAboveHorizon(position)).toBe(false)
    })
  })

  describe('getAzimuthDegrees', () => {
    it('should convert azimuth to degrees', () => {
      const position = create(Math.PI, 0.5, new Date())
      const degrees = getAzimuthDegrees(position)
      // Math.PI radians (south in SunCalc) converts to 0 degrees (north after adjustment)
      expect(degrees).toBeCloseTo(0, 1)
    })
  })

  describe('getAltitudeDegrees', () => {
    it('should convert altitude to degrees', () => {
      const position = create(0, Math.PI / 4, new Date())
      expect(getAltitudeDegrees(position)).toBeCloseTo(45, 1)
    })

    it('should handle negative altitude', () => {
      const position = create(0, -Math.PI / 6, new Date())
      expect(getAltitudeDegrees(position)).toBeCloseTo(-30, 1)
    })
  })

})
