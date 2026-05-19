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
  sourceGlobal?: number[]
  sourceThailand?: number[]
  thailandOtpProjects?: Array<{ projectId: string; title: string }>
  /** Thailand source id 6 — projects from `riskSectorWithProject` */
  thailandSectorProjects?: Array<{ projectId: string; title: string }>
}

export interface HeatmapPhase {
  phase: string
  riskFactors: HeatmapPhaseRiskFactor[]
}

export interface HeatmapRiskItem {
  riskCategoryId: string
  phaseList: HeatmapPhase[]
}
