import { SunlightStatus } from '@/shared/enums'
import type { SunlightStatusInfo } from '@/shared/types'

// useSunlightStatus composable
// Provides utility functions for creating and checking sunlight status values.
export function useSunlightStatus() {
  // Create a sunlight status object. The confidence value is clamped to the 0–1 range.
  function create(
    status: SunlightStatus,
    confidence: number,
    reason?: string
  ): SunlightStatusInfo {
    const clampedConfidence = Math.max(0, Math.min(1, confidence))
    return { status, confidence: clampedConfidence, reason }
  }

  // Create a sunny status object.
  function createSunny(
    confidence: number = 1,
    reason?: string
  ): SunlightStatusInfo {
    return create(SunlightStatus.SUNNY, confidence, reason)
  }

  // Create a shaded status object.
  function createShaded(
    confidence: number = 1,
    reason?: string
  ): SunlightStatusInfo {
    return create(SunlightStatus.SHADED, confidence, reason)
  }

  // Create a partially sunny status object.
  function createPartiallySunny(
    confidence: number = 0.5,
    reason?: string
  ): SunlightStatusInfo {
    return create(SunlightStatus.PARTIALLY_SUNNY, confidence, reason)
  }

  // Create a night status object (sun is below the horizon).
  function createNight(): SunlightStatusInfo {
    return create(SunlightStatus.NIGHT, 1, 'Sun is below the horizon')
  }

  // Create an unknown status object.
  function createUnknown(reason?: string): SunlightStatusInfo {
    return create(
      SunlightStatus.UNKNOWN,
      0,
      reason || 'Unable to determine sunlight status'
    )
  }

  // Return true if the status is sunny or partially sunny.
  function isSunny(status: SunlightStatusInfo): boolean {
    return (
      status.status === SunlightStatus.SUNNY ||
      status.status === SunlightStatus.PARTIALLY_SUNNY
    )
  }

  // Return true if the status is shaded.
  function isShaded(status: SunlightStatusInfo): boolean {
    return status.status === SunlightStatus.SHADED
  }

  // Return true if the status is night.
  function isNight(status: SunlightStatusInfo): boolean {
    return status.status === SunlightStatus.NIGHT
  }

  return {
    create,
    createSunny,
    createShaded,
    createPartiallySunny,
    createNight,
    createUnknown,
    isSunny,
    isShaded,
    isNight
  }
}
