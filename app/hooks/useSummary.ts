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
    icon: string
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
}

// Helper function to convert filter values to IDs (needs infoData for conversion)
const buildSummaryQueryParams = (
  filters: SummaryFilters,
  infoData?: {
    ministry?: Array<{ id: number; value: string }>
    sector?: Array<{ id: string; value: string }>
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
  const getBusinessGroupId = (value: string): string | number | null => {
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
      .filter((id): id is string | number => id !== null)
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

  // Convert date range from Thai format to ISO 8601 format
  if (filters.dateRange && filters.dateRange.trim()) {
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
  sector?: Array<{ id: string; value: string }>
  contractType?: Array<{ id: number; value: string }>
}) => {
  return useQuery<SummaryData>({
    queryKey: ['get', 'summary', filters, infoData],
    queryFn: async () => {
      const params = filters ? buildSummaryQueryParams(filters, infoData) : new URLSearchParams()
      const queryString = params.toString()
      const url = queryString 
        ? `${appConfig.apiUrl}/api/summary?${queryString}`
        : `${appConfig.apiUrl}/api/summary`

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
      console.log('Fetched summary from /api/summary:', data)
      return data
    },
    enabled: true,
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute (shorter since it depends on filters)
  })
}
