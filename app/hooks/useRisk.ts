import { useQuery } from '@tanstack/react-query'
import { appConfig } from '@/app/configs/appConfig'
import type { HeatmapRiskItem } from '@/lib/mockHeatmapData'
import type { SectorMinistryHeatmapSummaryRow } from '@/lib/dashboardMockData'
import { normalizeHeatmapRisk, type HeatmapRiskApiItem } from '@/lib/normalizeHeatmapRisk'
import { buildSummaryQueryParams, type SummaryFilters } from '@/app/hooks/useSummary'

/** Row from `GET /api/v1/risk` → `countProjectGroupByRiskCategory` */
export type CountProjectGroupByRiskCategoryRow = {
  riskCategoryId: number
  projectCount: number
}

const RISK_PHASE_KEYS = ['pre-construction', 'construction', 'operation'] as const
export type RiskPhaseApiKey = (typeof RISK_PHASE_KEYS)[number]

/** One phase block from `GET /api/v1/risk` → `countProjectGroupByPhaseAndRiskCategory` */
export type CountProjectGroupByPhaseAndRiskCategoryRow = {
  phase: RiskPhaseApiKey
  riskCategoryList: CountProjectGroupByRiskCategoryRow[]
}

function normalizeRiskPhaseKey(raw: string): RiskPhaseApiKey | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, '-')
  if (s === 'pre-construction' || s === 'preconstruction') return 'pre-construction'
  if (s === 'construction') return 'construction'
  if (s === 'operation') return 'operation'
  return null
}

/** Payload from `GET /api/v1/risk` (heatmap-focused subset of summary). */
export type RiskApiData = {
  heatmapRisk?: HeatmapRiskItem[]
  heatmapRiskPhase?: Record<string, Record<string, unknown>>
  sectorMinistryHeatmap?: SectorMinistryHeatmapSummaryRow[]
  countProjectGroupByRiskCategory?: CountProjectGroupByRiskCategoryRow[]
  /** Fixed order: pre-construction, construction, operation */
  countProjectGroupByPhaseAndRiskCategory?: CountProjectGroupByPhaseAndRiskCategoryRow[]
}

export const useRisk = (
  filters?: SummaryFilters,
  infoData?: {
    ministry?: Array<{ id: number; value: string }>
    sector?: Array<{ id: number; value: string }>
    contractType?: Array<{ id: number; value: string }>
  }
) => {
  return useQuery<RiskApiData>({
    queryKey: ['get', 'risk', filters, infoData],
    queryFn: async () => {
      const params = filters ? buildSummaryQueryParams(filters, infoData) : new URLSearchParams()
      const queryString = params.toString()
      const url = queryString
        ? `${appConfig.apiUrl}/api/v1/risk?${queryString}`
        : `${appConfig.apiUrl}/api/v1/risk`

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const raw = (await response.json()) as Record<string, unknown>
      const data: RiskApiData = {}

      if (Array.isArray(raw.heatmapRisk)) {
        data.heatmapRisk = normalizeHeatmapRisk(raw.heatmapRisk as HeatmapRiskApiItem[]) ?? undefined
      }
      if (raw.heatmapRiskPhase && typeof raw.heatmapRiskPhase === 'object') {
        data.heatmapRiskPhase = raw.heatmapRiskPhase as Record<string, Record<string, unknown>>
      }
      if (Array.isArray(raw.sectorMinistryHeatmap)) {
        data.sectorMinistryHeatmap = raw.sectorMinistryHeatmap as SectorMinistryHeatmapSummaryRow[]
      }
      if (Array.isArray(raw.countProjectGroupByRiskCategory)) {
        const rows = raw.countProjectGroupByRiskCategory.filter(
          (x): x is CountProjectGroupByRiskCategoryRow =>
            x != null &&
            typeof x === 'object' &&
            typeof (x as CountProjectGroupByRiskCategoryRow).riskCategoryId === 'number' &&
            typeof (x as CountProjectGroupByRiskCategoryRow).projectCount === 'number'
        )
        if (rows.length) {
          data.countProjectGroupByRiskCategory = [...rows].sort(
            (a, b) => a.riskCategoryId - b.riskCategoryId
          )
        }
      }

      if (Array.isArray(raw.countProjectGroupByPhaseAndRiskCategory)) {
        const byPhase = new Map<RiskPhaseApiKey, CountProjectGroupByRiskCategoryRow[]>()
        for (const item of raw.countProjectGroupByPhaseAndRiskCategory) {
          if (item == null || typeof item !== 'object') continue
          const phaseRaw = (item as { phase?: unknown }).phase
          if (typeof phaseRaw !== 'string') continue
          const phase = normalizeRiskPhaseKey(phaseRaw)
          if (!phase) continue
          const listRaw = (item as { riskCategoryList?: unknown }).riskCategoryList
          if (!Array.isArray(listRaw)) continue
          const list = listRaw.filter(
            (x): x is CountProjectGroupByRiskCategoryRow =>
              x != null &&
              typeof x === 'object' &&
              typeof (x as CountProjectGroupByRiskCategoryRow).riskCategoryId === 'number' &&
              typeof (x as CountProjectGroupByRiskCategoryRow).projectCount === 'number'
          )
          byPhase.set(
            phase,
            [...list].sort((a, b) => a.riskCategoryId - b.riskCategoryId)
          )
        }
        data.countProjectGroupByPhaseAndRiskCategory = RISK_PHASE_KEYS.map((phase) => ({
          phase,
          riskCategoryList: byPhase.get(phase) ?? [],
        }))
      }

      return data
    },
    enabled: true,
    retry: 1,
    staleTime: 1 * 60 * 1000,
  })
}
