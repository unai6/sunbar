import type { SunlightStatus } from '../enums/sunlight-status-type'

/**
 * SunlightStatusInfo
 * Contains sunlight status information with confidence level
 */
export type SunlightStatusInfo = {
  status: SunlightStatus
  confidence: number // 0-1, how confident we are in the assessment
  reason?: string
}
