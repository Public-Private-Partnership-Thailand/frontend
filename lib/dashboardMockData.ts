/** Row from `GET /api/v1/summary` → `countProjectGroupByPublicAuthority[]` (home horizontal bar). */
export type CountProjectGroupByPublicAuthorityRow = {
  publicAuthorityName: string
  projectCount: number
}

export interface SectorAuthorityHeatmapCell {
  sector: string
  authority: string
  value: number
}

export interface SectorBubblePoint {
  sector: string
  projectCount: number
  totalValue: number
  authorityCount: number
}

export interface SectorCardWithRisks {
  sector: string
  projectCount: number
  totalValue: number
  riskCategoryIds: string[]
}

export interface RiskCategoryProjectCount {
  categoryId: string
  count: number
}

export interface RiskByPhaseStackedItem {
  phase: string
  preConstruction?: number
  construction?: number
  operation?: number
  [key: string]: number | string | undefined
}

/** Sector x Risk factor heatmap: value = count or intensity. */
export interface SectorRiskFactorCell {
  sector: string
  factorId: string
  value: number
}

/** Matrix table: risk category x phase. Cell value = count (for bubble size). Resolve categoryId to name via api/v1/info riskCategory. */
export interface RiskCategoryMatrixRow {
  categoryId: string
  preConstruction: number
  construction: number
  operation: number
}

/** All 12 business group sectors (match api/v1/summary businessGroupStats order). */
export const ALL_SECTORS = [
  'transport.road',
  'transport.rail',
  'transport.air',
  'transport.water',
  'waterAndWaste',
  'energy',
  'communications',
  'health',
  'education',
  'socialHousing',
  'cultureSportsAndRecreation',
  'others',
] as const

/** One row from `GET /api/v1/summary` → `sectorMinistryHeatmap[]`. */
export type SectorMinistryHeatmapSummaryRow = {
  sector: string
  ministryList: Array<{ id: number; value: number }>
}

export function buildSectorMinistryHeatmapFromSummaryApi(
  apiRows: SectorMinistryHeatmapSummaryRow[] | undefined | null,
  sectorOrder: readonly string[],
  ministriesSorted: Array<{ id: number; value: string }>
): number[][] {
  const bySector = new Map<string, Map<number, number>>()
  for (const row of apiRows ?? []) {
    const m = new Map<number, number>()
    for (const c of row.ministryList ?? []) {
      const v = typeof c.value === 'number' && Number.isFinite(c.value) ? c.value : 0
      m.set(c.id, v)
    }
    bySector.set(row.sector, m)
  }
  return sectorOrder.map((sector) =>
    ministriesSorted.map((min) => bySector.get(sector)?.get(min.id) ?? 0)
  )
}

/** Demo matrix until summary returns `sectorMinistryHeatmap`. */
export function buildSectorMinistryHeatmapMatrix(numSectors: number, numMinistries: number): number[][] {
  const MOCK_CORNER: number[][] = [
    [1, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2],
  ]
  return Array.from({ length: numSectors }, (_, i) =>
    Array.from({ length: numMinistries }, (_, j) => {
      if (i < MOCK_CORNER.length && j < MOCK_CORNER[i].length) return MOCK_CORNER[i][j]
      return 0
    })
  )
}

/** Sector cards with project count, value, and related risk category IDs (mock). All sectors included; others have 0. Use riskCategory from api/v1/info to resolve names. */
export function getMockSectorCardsWithRisks(): SectorCardWithRisks[] {
  const withData: Record<string, { projectCount: number; totalValue: number; riskCategoryIds: string[] }> = {
    'transport.road': { projectCount: 2, totalValue: 26950000000, riskCategoryIds: ['C09', 'C05'] },
    'transport.rail': { projectCount: 2, totalValue: 138794450000, riskCategoryIds: ['C09', 'C07'] },
    'transport.water': { projectCount: 2, totalValue: 1000000, riskCategoryIds: ['C10'] },
  }
  return ALL_SECTORS.map((sector) => {
    const data = withData[sector]
    if (data) {
      return { sector, ...data }
    }
    return { sector, projectCount: 0, totalValue: 0, riskCategoryIds: [] }
  })
}
/**
 * ภาพรวมความเสี่ยงทั่วไป — ข้อความต่อการ์ด (mock).
 * จำนวนแหล่งอ้างอิงมาจาก `GET /api/v1/info` → `riskSource.global` / `riskSource.thailand` (ความยาวอาร์เรย์).
 */
export interface GeneralRiskOverviewRegionMock {
  key: 'foreign' | 'thailand'
  headline: string
  summary: string
}

export function getMockGeneralRiskOverview(): {
  foreign: GeneralRiskOverviewRegionMock
  thailand: GeneralRiskOverviewRegionMock
} {
  return {
    foreign: {
      key: 'foreign',
      headline: 'ต่างประเทศ',
      summary:
        'อ้างอิงแนวปฏิบัติและกรอบมาตรฐานนานาชาติเป็นหลัก',
    },
    thailand: {
      key: 'thailand',
      headline: 'ประเทศไทย',
      summary:
        'อ้างอิงประกาศ ระเบียบ และแนวปฏิบัติในประเทศไทย',
    },
  }
}
