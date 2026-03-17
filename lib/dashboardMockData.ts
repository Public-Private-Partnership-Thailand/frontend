/**
 * Mock data for home dashboard components not yet provided by api/v1/summary.
 * Replace with real API data when available.
 */

import { ALL_RISK_FACTOR_IDS } from '@/lib/riskFactorsMock'

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
  const cols = ['การทางพิเศษแห่งประเทศไทย (กทพ.)', 'กรุงเทพมหานคร (กทม.)', 'กรมทางหลวง', 'การรถไฟฟ้าขนส่งมวลชนแห่งประเทศไทย (รฟม.)', 'การท่าเรือแห่งประเทศไทย (กทท.)']
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

/** Sector x Risk factor heatmap (mock). All 12 sectors × all 141 risk factors (F01–F141). Sparse mock values. */
export function getMockSectorRiskFactorHeatmap(): { rows: string[]; cols: string[]; data: number[][] } {
  const rows = [...ALL_SECTORS]
  const cols = [...ALL_RISK_FACTOR_IDS]
  const numCols = cols.length
  // Deterministic sparse mock: some sectors have counts for a subset of factors (first ~20 get more data, rest scattered)
  const data: number[][] = rows.map((_, i) => {
    return cols.map((_, j) => {
      const seed = (i * 31 + j * 7) % 97
      if (seed < 15) return (seed % 5) + 1
      if (seed < 25 && j < 40) return (seed % 3) + 1
      return 0
    })
  })
  return { rows, cols, data }
}

/** Risk category matrix: category name x phase counts (mock). categoryId holds display name. */
export function getMockRiskCategoryMatrix(): RiskCategoryMatrixRow[] {
  const data: Record<string, { 'pre-construction': number; construction: number; operation: number }> = {
    'Land availability, access & site': { 'pre-construction': 11, construction: 12, operation: 5 },
    'Social Risk': { 'pre-construction': 3, construction: 4, operation: 3 },
    'Environmental Risk': { 'pre-construction': 4, construction: 5, operation: 6 },
    'Design Risk': { 'pre-construction': 2, construction: 3, operation: 1 },
    'Construction Risk': { 'pre-construction': 1, construction: 18, operation: 0 },
    'Variations Risk': { 'pre-construction': 0, construction: 1, operation: 1 },
    'Operating Risk': { 'pre-construction': 0, construction: 0, operation: 19 },
    'Demand Risk': { 'pre-construction': 5, construction: 0, operation: 5 },
    'Financial Markets Risk': { 'pre-construction': 7, construction: 6, operation: 10 },
    'Strategic/ Partnering Risk': { 'pre-construction': 3, construction: 5, operation: 6 },
    'Disruptive Technology Risk': { 'pre-construction': 0, construction: 0, operation: 1 },
    'Force Majeure Risk': { 'pre-construction': 0, construction: 2, operation: 2 },
    'Political Risk': { 'pre-construction': 6, construction: 5, operation: 5 },
    'Law Risk': { 'pre-construction': 4, construction: 4, operation: 4 },
    'Early Termination Risk': { 'pre-construction': 1, construction: 6, operation: 6 },
    'Condition At Handback Risk': { 'pre-construction': 0, construction: 0, operation: 2 },
    'Project selection': { 'pre-construction': 4, construction: 0, operation: 0 },
    'Relationship': { 'pre-construction': 7, construction: 6, operation: 6 },
    'Project finance': { 'pre-construction': 8, construction: 1, operation: 2 },
    'Procurement risks': { 'pre-construction': 6, construction: 0, operation: 0 },
  }
  return Object.entries(data).map(([name, phases]) => ({
    categoryId: name,
    preConstruction: phases['pre-construction'],
    construction: phases.construction,
    operation: phases.operation,
  }))
}
