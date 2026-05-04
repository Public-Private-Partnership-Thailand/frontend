import { useQuery } from '@tanstack/react-query'
import { parseThaiDateRangeToISO } from '@/lib/utils/dateUtils'
import type { ProjectData } from '@/types/project'
import { appConfig } from '@/app/configs/appConfig'
import type { HeatmapRiskItem } from '@/lib/mockHeatmapData'
import type {
  CountProjectGroupByPublicAuthorityRow,
  SectorBubblePoint,
  SectorMinistryHeatmapSummaryRow,
} from '@/lib/dashboardMockData'
import { normalizeHeatmapRisk } from '@/lib/normalizeHeatmapRisk'

export interface SummaryData {
  summary: {
    totalProjects: number
    uniqueContractors: number
    /** จำนวนหน่วยงานรัฐเจ้าของโครงการ (distinct owning authorities) */
    uniquePublicAuthority?: number
    totalInvestment: number
    maxBudget: number
    inprogressProjects?: number
  }
  ministryStats: Array<{
    ministry: string
    projectCount: number
    totalInvestment: number
    rank: number
  }>
  otherMinistries: {
    projectCount: number
    totalInvestment: number
  }
  ministryInvestments: Array<{
    ministry: string
    totalInvestment: number
    projectCount: number
    rank: number
  }>
  otherMinistriesInvestment: {
    totalInvestment: number
    projectCount: number
  }
  projectScales: {
    small: { count: number; investment: number }
    medium: { count: number; investment: number }
    big: { count: number; investment: number }
  }
  investmentByYear: Array<{
    year: number
    investment: number
    projectCount: number
  }>
  businessGroupStats: Array<{
    groupName: string
    displayName: string
    total: { count: number; investment: number }
    small: { count: number; investment: number }
    medium: { count: number; investment: number }
    big: { count: number; investment: number }
  }>
  sectorCounts: Record<string, number>
  projectScope: {
    domestic: { count: number; investment: number }
    international: { count: number; investment: number }
  }
  latestProjects: ProjectData[]
  /** Risk heat map: one map per risk category; x = phases, y = risk factors; value 0–5 for gradient. */
  heatmapRisk?: HeatmapRiskItem[]
  /**
   * Matrix / phase detail: categoryId -> factorId -> legacy string[] phases, or
   * { phase: string[], source: { global: number[], thailand: number[] } }.
   */
  heatmapRiskPhase?: Record<string, Record<string, unknown>>
  /** กลุ่มกิจการ × กระทรวง: per-sector counts per ministry id (home heat map). */
  sectorMinistryHeatmap?: SectorMinistryHeatmapSummaryRow[]
  /** จำนวนโครงการแยกตามหน่วยงานรัฐเจ้าของโครงการ (home horizontal bar). */
  countProjectGroupByPublicAuthority?: CountProjectGroupByPublicAuthorityRow[]
  /** Bubble chart: x = project count, y = value (baht), r ∝ authority count. */
  sectorProjectValueBubble?: SectorBubblePoint[]
  /** Home overview: project counts by contract type for pie chart. */
  pieContractTypeCount?: PieContractTypeCountRow[]
  /**
   * Map pins for the home Thailand map — lat/lng per project (filtered consistently with other summary fields when query params are used).
   */
  locations?: SummaryProjectLocation[]
}

export interface PieContractTypeCountRow {
  id: number
  name: string
  fullName: string
  count: number
}

/**
 * One project marker for the home page Thailand map (สถานที่ตั้งโครงการในประเทศไทย).
 * Returned on GET /api/v1/summary as top-level field `locations` (array).
 * Coordinates must be WGS-84 (EPSG:4326) in decimal degrees.
 */
export interface SummaryProjectLocation {
  /** Same id as project detail `/view/[id]` and list APIs */
  id: string
  /** Marker popup title */
  title: string
  /** Latitude */
  lat: number
  /** Longitude */
  lng: number
  /** Optional: business group / sector label for popup */
  sector?: string | null
  /** Optional: status label or code */
  status?: string | null
  /** Optional: total project value in millions THB (popup); omit or null if unknown */
  budgetMillionBaht?: number | null
}

export interface SummaryFilters {
  sector?: string
  search?: string
  ministry?: string[]
  businessGroup?: string[]
  contractType?: string[]
  dateRange?: string
  startYear?: string
  endYear?: string
}

/**
 * Maps a business group name (from businessGroupStats.groupName) to an icon filename.
 * Used when /api/v1/summary no longer returns an icon field.
 */
export function getIconNameByGroupName(groupName: string): string {
  const normalized = (groupName || '').trim().toLowerCase()
  const iconByGroupName: Record<string, string> = {
    'transport.road': '01_transport.road.png',
    'transport_road': '01_transport.road.png',
    'transport.rail': '02_transport.rail.png',
    'transport_rail': '02_transport.rail.png',
    'transport.urban': '02_transport.rail.png',
    'transport.air': '03_transport.air.png',
    'transport_air': '03_transport.air.png',
    'transport.water': '04_transport.water.png',
    'transport_water': '04_transport.water.png',
    'waterandwaste': '05_waterAndWaste.png',
    'waterAndWaste': '05_waterAndWaste.png',
    'energy': '06_energy.png',
    'communications': '07_communications.png',
    'health': '08_health.png',
    'education': '09_education.png',
    'socialhousing': '10_socialHousing.png',
    'cultureSportsAndRecreation': '11_cultureSportsAndRecreation.png',
    'culture sports and recreation': '11_cultureSportsAndRecreation.png',
    'economy': '12_others.png',
    'governance': '12_others.png',
    'others': '12_others.png',
    'อื่น ๆ': '12_others.png'
  }
  if (iconByGroupName[groupName] !== undefined) return iconByGroupName[groupName]
  if (iconByGroupName[normalized] !== undefined) return iconByGroupName[normalized]
  // Match by prefix (e.g. "transport" -> road icon as default)
  if (normalized.startsWith('transport')) return '01_transport.road.png'
  return '12_others.png'
}

/** Shared by useSummary and useRisk for identical query-string filter encoding. */
export const buildSummaryQueryParams = (
  filters: SummaryFilters,
  infoData?: {
    ministry?: Array<{ id: number; value: string }>
    sector?: Array<{ id: number; value: string }>
    contractType?: Array<{ id: number; value: string }>
  }
): URLSearchParams => {
  const params = new URLSearchParams()

  if (filters.search) {
    params.append('search', filters.search)
  }

  // Helper function to convert ministry value to ID
  const getMinistryId = (value: string): number | null => {
    if (!infoData?.ministry) return null
    if (value === 'อื่น ๆ') return -1
    const ministry = infoData.ministry.find(m => m.value === value)
    return ministry ? ministry.id : null
  }

  // Helper function to convert contract type value to ID
  const getContractTypeId = (value: string): number | null => {
    if (!infoData?.contractType) return null
    if (value === 'อื่น ๆ') return -1
    const contractType = infoData.contractType.find(o => o.value === value)
    return contractType ? contractType.id : null
  }

  // Helper function to convert business group/sector value to ID
  const getBusinessGroupId = (value: string): number | null => {
    if (!infoData?.sector) return null
    if (value === 'อื่น ๆ') return -1
    const sector = infoData.sector.find(s => s.value === value)
    return sector ? sector.id : null
  }

  // Convert ministry values to IDs and join with commas
  if (filters.ministry && filters.ministry.length > 0) {
    const ministryIds = filters.ministry
      .map(ministryValue => getMinistryId(ministryValue))
      .filter((id): id is number => id !== null)
      .filter(id => {
        if (id === -1) {
          return filters.ministry?.includes('อื่น ๆ') || false
        }
        return true
      })
    if (ministryIds.length > 0) {
      params.append('ministry', ministryIds.join(','))
    }
  }

  // Convert business group values to sector IDs and join with commas
  if (filters.businessGroup && filters.businessGroup.length > 0) {
    const groupIds = filters.businessGroup
      .map(groupValue => getBusinessGroupId(groupValue))
      .filter((id): id is number => id !== null)
      .filter(id => {
        if (id === -1) {
          return filters.businessGroup?.includes('อื่น ๆ') || false
        }
        return true
      })
    if (groupIds.length > 0) {
      params.append('businessGroup', groupIds.map(id => String(id)).join(','))
    }
  }

  // Convert contract type values to IDs and join with commas
  if (filters.contractType && filters.contractType.length > 0) {
    const typeIds = filters.contractType
      .map(typeValue => getContractTypeId(typeValue))
      .filter((id): id is number => id !== null)
      .filter(id => {
        if (id === -1) {
          return filters.contractType?.includes('อื่น ๆ') || false
        }
        return true
      })
    if (typeIds.length > 0) {
      params.append('contractType', typeIds.join(','))
    }
  }

  // Year range: startYear/endYear -> startDate, endDate
  if (filters.startYear && filters.endYear && filters.startYear.trim() && filters.endYear.trim()) {
    const startY = parseInt(filters.startYear, 10)
    const endY = parseInt(filters.endYear, 10)
    if (!isNaN(startY) && !isNaN(endY) && endY >= startY) {
      params.append('startDate', `${filters.startYear}-01-01`)
      params.append('endDate', `${filters.endYear}-12-31`)
    }
  }
  // Fallback: date range from Thai format (legacy)
  else if (filters.dateRange && filters.dateRange.trim()) {
    const dateRangeISO = parseThaiDateRangeToISO(filters.dateRange)
    if (dateRangeISO) {
      params.append('startDate', dateRangeISO.startDate)
      params.append('endDate', dateRangeISO.endDate)
    }
  }

  if (filters.sector) {
    params.append('sector', filters.sector)
  }

  return params
}

export const useSummary = (filters?: SummaryFilters, infoData?: {
  ministry?: Array<{ id: number; value: string }>
  sector?: Array<{ id: number; value: string }>
  contractType?: Array<{ id: number; value: string }>
}) => {
  return useQuery<SummaryData>({
    queryKey: ['get', 'summary', filters, infoData],
    queryFn: async () => {
      const params = filters ? buildSummaryQueryParams(filters, infoData) : new URLSearchParams()
      const queryString = params.toString()
      const url = queryString 
        ? `${appConfig.apiUrl}/api/v1/summary?${queryString}`
        : `${appConfig.apiUrl}/api/v1/summary`
      // const url = queryString 
      //   ? `${appConfig.apiUrl}/api/v1/summary?${queryString}`
      //   : `http://localhost:8080/api/v1/summary`

      console.log('Fetching summary with filters:', filters)
      console.log('Converted to IDs - URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const raw = await response.json()
      const data: SummaryData = raw

      // GET /api/v1/summary: latestProjects may use snake_case `public_authority`, `private_parties` (เอกชนคู่สัญญา)
      if (Array.isArray((data as any).latestProjects)) {
        data.latestProjects = ((data as any).latestProjects as unknown[]).map((item: any): ProjectData => {
          const next = { ...item } as ProjectData

          const fromPub =
            typeof item?.public_authority === 'string' ? item.public_authority.trim() : ''
          const existingPubName = item?.publicAuthority?.name?.trim?.() ?? ''
          const pubName = fromPub || existingPubName
          if (pubName) {
            next.publicAuthority = {
              id: item?.publicAuthority?.id ?? '',
              name: pubName,
            }
          }

          const rawPriv = item?.private_parties
          let contractorNames: string[] = []
          if (Array.isArray(rawPriv)) {
            contractorNames = rawPriv
              .map((x: unknown) => (typeof x === 'string' ? x.trim() : String(x).trim()))
              .filter(Boolean)
          } else if (typeof rawPriv === 'string' && rawPriv.trim()) {
            contractorNames = [rawPriv.trim()]
          }
          if (contractorNames.length > 0) {
            next.parties = contractorNames.map((name) => ({
              name,
              id: '',
              roles: ['contractor'],
            }))
          } else if (!next.parties?.length) {
            next.parties = (item?.parties as ProjectData['parties']) ?? []
          }

          return next
        })
      }

      // Normalize heatmapRisk IDs: numeric -> string codes ("C01", "F01")
      if ((raw as any)?.heatmapRisk) {
        data.heatmapRisk = normalizeHeatmapRisk((raw as any).heatmapRisk) || undefined
      }
      if ((raw as any)?.heatmapRiskPhase) {
        data.heatmapRiskPhase = (raw as any).heatmapRiskPhase
      }
      if (Array.isArray((raw as any)?.sectorMinistryHeatmap)) {
        data.sectorMinistryHeatmap = (raw as any).sectorMinistryHeatmap
      }
      if (Array.isArray((raw as any)?.countProjectGroupByPublicAuthority)) {
        data.countProjectGroupByPublicAuthority = (raw as any).countProjectGroupByPublicAuthority
      }
      if (Array.isArray((raw as any)?.sectorProjectValueBubble)) {
        data.sectorProjectValueBubble = (raw as any).sectorProjectValueBubble
      }
      if (Array.isArray((raw as any)?.pieContractTypeCount)) {
        data.pieContractTypeCount = (raw as any).pieContractTypeCount
      }

      return data
    },
    enabled: true,
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute (shorter since it depends on filters)
  })
}
