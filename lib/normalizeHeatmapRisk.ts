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

const FACTOR_ID_PAD = 3

/** Canonical heatmap / lookup key: F + zero-padded numeric id (e.g. F001). Normalizes "F1"/"F01" from API. */
export function toRiskFactorCode(id: number | string): string {
  if (typeof id === 'string') {
    const trimmed = id.trim()
    const m = /^F(\d+)$/i.exec(trimmed)
    if (m) {
      const n = parseInt(m[1], 10)
      if (!Number.isNaN(n)) return `F${String(n).padStart(FACTOR_ID_PAD, '0')}`
    }
    const n = parseInt(trimmed, 10)
    if (!Number.isNaN(n)) return `F${String(n).padStart(FACTOR_ID_PAD, '0')}`
    return trimmed
  }
  return `F${String(id).padStart(FACTOR_ID_PAD, '0')}`
}

/** Backend uses numeric risk category / factor ids; normalize to C01 / F001-style codes. */
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
