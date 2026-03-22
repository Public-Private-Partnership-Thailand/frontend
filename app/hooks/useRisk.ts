import { useQuery } from '@tanstack/react-query'
import { appConfig } from '@/app/configs/appConfig'
import type { HeatmapRiskItem } from '@/lib/mockHeatmapData'
import type { SectorMinistryHeatmapSummaryRow } from '@/lib/dashboardMockData'
import { normalizeHeatmapRisk, type HeatmapRiskApiItem } from '@/lib/normalizeHeatmapRisk'
import { buildSummaryQueryParams, type SummaryFilters } from '@/app/hooks/useSummary'

/** Payload from `GET /api/v1/risk` (heatmap-focused subset of summary). */
export type RiskApiData = {
  heatmapRisk?: HeatmapRiskItem[]
  heatmapRiskPhase?: Record<string, Record<string, unknown>>
  sectorMinistryHeatmap?: SectorMinistryHeatmapSummaryRow[]
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

      return data
    },
    enabled: true,
    retry: 1,
    staleTime: 1 * 60 * 1000,
  })
}
