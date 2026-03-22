import type { HeatmapRiskItem } from '@/lib/mockHeatmapData'

export type HeatmapRiskApiItem = {
  riskCategoryId: number | string
  phaseList: Array<{
    phase: string
    riskFactors: Array<{
      id: number | string
      value: number
    }>
  }>
}

export function toRiskCategoryCode(id: number | string): string {
  if (typeof id === 'string') return id
  return `C${String(id).padStart(2, '0')}`
}

export function toRiskFactorCode(id: number | string): string {
  if (typeof id === 'string' && /^F\d+$/i.test(id)) return id
  const n = typeof id === 'number' ? id : parseInt(String(id), 10)
  if (Number.isNaN(n)) return String(id)
  return `F${String(n).padStart(2, '0')}`
}

/** Backend uses numeric risk category / factor ids; normalize to C01 / F01 codes. */
export function normalizeHeatmapRisk(items: HeatmapRiskApiItem[] | undefined): HeatmapRiskItem[] | undefined {
  if (!items || !Array.isArray(items)) return undefined
  return items.map((item) => ({
    riskCategoryId: toRiskCategoryCode(item.riskCategoryId),
    phaseList: (item.phaseList || []).map((phase) => ({
      phase: phase.phase,
      riskFactors: (phase.riskFactors || []).map((rf) => ({
        id: toRiskFactorCode(rf.id),
        value: rf.value ?? 0,
      })),
    })),
  }))
}
