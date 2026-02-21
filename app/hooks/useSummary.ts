import { useQuery } from '@tanstack/react-query'
import { parseThaiDateRangeToISO } from '@/lib/utils/dateUtils'
import type { ProjectData } from '@/types/project'
import { appConfig } from '@/app/configs/appConfig'

export interface SummaryData {
  summary: {
    totalProjects: number
    uniqueContractors: number
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

// Helper function to convert filter values to IDs (needs infoData for conversion)
const buildSummaryQueryParams = (
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

      const data: SummaryData = await response.json()
      // console.log('Fetched summary from /api/summary:', data)
      return data
    },
    enabled: true,
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute (shorter since it depends on filters)
  })
}
