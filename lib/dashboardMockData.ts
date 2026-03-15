/**
 * Mock data for home dashboard components not yet provided by api/v1/summary.
 * Replace with real API data when available.
 */

export interface PublicAuthorityProjectCount {
  name: string
  count: number
}

/** Heatmap: rows = sectors, cols = public authorities (หน่วยงานรัฐเจ้าของโครงการ). Value = project count. */
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
  /** Risk category IDs from api/v1/info riskCategory (e.g. C01, C05). Resolve to name when rendering. */
  riskCategoryIds: string[]
}

export interface RiskCategoryProjectCount {
  /** Risk category ID from api/v1/info riskCategory (e.g. C01, C09). */
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

/** จำนวนหน่วยงานรัฐเจ้าของโครงการ - project count per public authority (mock). */
export function getMockPublicAuthorityProjectCounts(): PublicAuthorityProjectCount[] {
  return [
    { name: 'การทางพิเศษแห่งประเทศไทย (กทพ.)', count: 1 },
    { name: 'กรุงเทพมหานคร (กทม.)', count: 1 },
    { name: 'กรมทางหลวง', count: 1 },
    { name: 'การรถไฟฟ้าขนส่งมวลชนแห่งประเทศไทย (รฟม.)', count: 1 },
    { name: 'การท่าเรือแห่งประเทศไทย (กทท.)', count: 1 },
    { name: 'กรมเจ้าท่า', count: 1 },
  ]
}

/** Sector x หน่วยงานรัฐ heatmap (mock). Rows = all sectors, Cols = authorities. */
export function getMockSectorAuthorityHeatmap(): { rows: string[]; cols: string[]; data: number[][] } {
  const rows = [...ALL_SECTORS]
  const cols = ['กทพ.', 'กทม.', 'กรมทางหลวง', 'รฟม.', 'กทท.']
  const numCols = cols.length
  // First 3 sectors have mock counts; rest are 0
  const dataWithValues: number[][] = [
    [1, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],   // transport.air
    [0, 0, 0, 0, 2],   // transport.water
  ]
  const emptyRow = Array(numCols).fill(0)
  const data: number[][] = rows.map((_, i) => (i < dataWithValues.length ? dataWithValues[i] : emptyRow))
  return { rows, cols, data }
}

/** Bubble chart: x = จำนวนโครงการ, y = มูลค่าโครงการ, size = จำนวนหน่วยงาน (mock). */
export function getMockSectorBubbleData(): SectorBubblePoint[] {
  return [
    { sector: 'transport.road', projectCount: 2, totalValue: 26950000000, authorityCount: 2 },
    { sector: 'transport.rail', projectCount: 2, totalValue: 138794450000, authorityCount: 2 },
    { sector: 'transport.water', projectCount: 2, totalValue: 1000000, authorityCount: 1 },
  ]
}

/** All 12 business group sectors (match api/v1/summary businessGroupStats order). */
const ALL_SECTORS = [
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

/** ภาพรวมประเภทความเสี่ยง: risk category ID vs project count (mock). Resolve categoryId to name via api/v1/info riskCategory. */
export function getMockRiskCategoryProjectCounts(): RiskCategoryProjectCount[] {
  return [
    { categoryId: 'C09', count: 5 },  // Financial markets
    { categoryId: 'C05', count: 4 },  // Construction
    { categoryId: 'C07', count: 4 },  // Operating
    { categoryId: 'C10', count: 3 },  // Strategic / Partnering
    { categoryId: 'C03', count: 2 }, // Environmental
  ]
}

/** ความเสี่ยงตามระยะโครงการ: phase x amount, stacked by risk category (mock). Use categoryId; resolve to name when rendering. */
export function getMockRiskByPhaseStacked(): {
  phases: string[]
  labels: string[]
  datasets: { categoryId: string; data: number[]; backgroundColor: string }[]
} {
  const phases = ['Pre-construction', 'Construction', 'Operation']
  return {
    phases,
    labels: phases,
    datasets: [
      { categoryId: 'C09', data: [12, 10, 14], backgroundColor: '#1e3a8a' },  // Financial markets
      { categoryId: 'C05', data: [8, 15, 6], backgroundColor: '#f97316' },   // Construction
      { categoryId: 'C07', data: [6, 9, 13], backgroundColor: '#84cc16' },   // Operating
      { categoryId: 'C10', data: [5, 7, 4], backgroundColor: '#06b6d4' },   // Strategic / Partnering
      { categoryId: 'C03', data: [2, 3, 2], backgroundColor: '#64748b' },      // Environmental
    ],
  }
}

/** Sector x Risk factor heatmap (mock). All 12 sectors; first 3 have data, rest are 0. */
export function getMockSectorRiskFactorHeatmap(): { rows: string[]; cols: string[]; data: number[][] } {
  const rows = [...ALL_SECTORS]
  const cols = ['F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08']
  const numCols = cols.length
  const dataWithValues: number[][] = [
    [5, 8, 3, 12, 2, 6, 0, 4],   // transport.road
    [4, 6, 10, 7, 5, 3, 2, 8],   // transport.rail
    [2, 3, 1, 4, 1, 2, 1, 2],   // transport.water
  ]
  const emptyRow = Array(numCols).fill(0)
  const data = rows.map((_, i) => (i < dataWithValues.length ? dataWithValues[i] : emptyRow))
  return { rows, cols, data }
}

/** Risk category matrix: categoryId x phase counts (mock). Resolve categoryId to name via api/v1/info riskCategory. */
export function getMockRiskCategoryMatrix(): RiskCategoryMatrixRow[] {
  return [
    { categoryId: 'C09', preConstruction: 12, construction: 10, operation: 14 },  // Financial markets
    { categoryId: 'C05', preConstruction: 8, construction: 15, operation: 6 },   // Construction
    { categoryId: 'C07', preConstruction: 6, construction: 9, operation: 13 },   // Operating
    { categoryId: 'C10', preConstruction: 5, construction: 7, operation: 4 },    // Strategic / Partnering
    { categoryId: 'C03', preConstruction: 2, construction: 3, operation: 2 },     // Environmental
  ]
}
