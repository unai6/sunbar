import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCoordinates } from '~/composables/useCoordinates'
import { useSunInfo } from '~/composables/useSunInfo'

const { create: createCoordinates } = useCoordinates()

let isDaytime: ReturnType<typeof useSunInfo>['isDaytime']

beforeEach(() => {
  setActivePinia(createPinia())
  isDaytime = useSunInfo().isDaytime
})

describe('useSunInfo', () => {
  describe('isDaytime', () => {
    it('should return true during day', () => {
      const coords = createCoordinates(40.4168, -3.7038) // Madrid
      const noon = new Date('2024-06-21T12:00:00Z')

      expect(isDaytime(coords, noon)).toBe(true)
    })

    it('should return false at night', () => {
      const coords = createCoordinates(40.4168, -3.7038)
      const midnight = new Date('2024-06-21T00:00:00Z')

      expect(isDaytime(coords, midnight)).toBe(false)
    })
  })
})
