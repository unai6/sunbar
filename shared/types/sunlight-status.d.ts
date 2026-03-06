import type { SunlightStatus } from '../enums/sunlight-status-type'

// SunlightStatusInfo — holds a sunlight status value together with a confidence level.
export type SunlightStatusInfo = {
  status: SunlightStatus
  confidence: number // 0-1, how confident we are in the assessment
  reason?: string
}
