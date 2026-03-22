/**
 * Mock data for risk heat map (api/v1/summary heatmapRisk).
 * Used when API does not return heatmapRisk. Replace with real API data when available.
 */

export interface RiskCategoryItem {
  id: string
  code: string
  name: string
  description_en?: string
  description_th?: string
}

export interface RiskFactorItem {
  id: string
  name: string
  description_th?: string
}

export interface HeatmapPhaseRiskFactor {
  id: string
  value: number
  /** Risk source IDs from /api/v1/info riskSource.global */
  sourceGlobal?: number[]
  /** Risk source IDs from /api/v1/info riskSource.thailand */
  sourceThailand?: number[]
  /** Per-project refs when `source["thailand-otp"]` is present (Thailand source id 2 — OTP) */
  thailandOtpProjects?: Array<{ projectId: string; title: string }>
}

export interface HeatmapPhase {
  phase: string
  riskFactors: HeatmapPhaseRiskFactor[]
}

export interface HeatmapRiskItem {
  riskCategoryId: string
  phaseList: HeatmapPhase[]
}
