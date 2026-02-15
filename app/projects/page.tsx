'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ProjectData } from '@/types/project'
import { BUSINESS_GROUP_INFO, getBusinessGroupInfo } from '@/types/businessGroup'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'
import { fetchProjectsFromAPI } from '@/lib/projectService'
import ProjectsPageSkeleton from '@/components/ProjectsPageSkeleton'
import Link from 'next/link'
import Papa from 'papaparse'
import Lucide from '@/components/Base/Lucide'
import dynamic from 'next/dynamic'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { getColor } from '@/lib/utils/colors'
import { useInfo, type InfoData } from '@/app/hooks/useInfo'
import { formatDateForDisplay } from '@/lib/utils/dateUtils'

// Dynamically import Litepicker to avoid SSR issues
const Litepicker = dynamic(() => import('@/components/Base/Litepicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-400">
      Loading date picker...
    </div>
  )
})

// Multi-select dropdown component (same as home page)
const MultiSelectDropdown = ({ 
  label, 
  options, 
  selectedValues, 
  onChange, 
  onSelectAll,
  onClear,
  placeholder,
  displayNameMap
}: { 
  label: string; 
  options: string[]; 
  selectedValues: string[]; 
  onChange: (value: string) => void; 
  onSelectAll: (selectAll: boolean) => void;
  onClear: () => void;
  placeholder: string;
  displayNameMap?: (key: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const allSelected = selectedValues.length === options.length && options.length > 0
  const someSelected = selectedValues.length > 0 && selectedValues.length < options.length
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  const hasSelections = selectedValues.length > 0

  return (
    <div className="mb-3" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {hasSelections && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
          >
            ล้างการกรอง
          </button>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-left flex items-center justify-between"
        >
          <span className="truncate text-sm">
            {selectedValues.length === 0 
              ? placeholder 
              : `เลือกไว้ ${selectedValues.length} รายการ`}
          </span>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
            {/* Select All option */}
            <label
              className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer border-b border-gray-200"
            >
              <input
                ref={selectAllCheckboxRef}
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="mr-2 h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-900">เลือกทั้งหมด</span>
            </label>
            {options.map(option => {
              // Use display name map if provided, otherwise use option as-is
              const displayName = displayNameMap ? displayNameMap(option) : option
              return (
                <label
                  key={option}
                  className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => onChange(option)}
                    className="mr-2 h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{displayName}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterValidationError, setFilterValidationError] = useState<string | null>(null)
  
  // Use React Query hook for info data
  const { data: infoData } = useInfo()
  const [filters, setFilters] = useState({
    sector: '',
    search: '',
    ministry: [] as string[],
    businessGroup: [] as string[],
    contractType: [] as string[],
    dateRange: ''
  })
  const [tempFilters, setTempFilters] = useState({
    sector: '',
    search: '',
    ministry: [] as string[],
    businessGroup: [] as string[],
    contractType: [] as string[],
    dateRange: ''
  })
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set())
  const [showCompareModal, setShowCompareModal] = useState(false)
  // Delete confirmation: project to delete (null = modal closed)
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<ProjectData | null>(null)
  // In comparison modal: ordered list of project ids to show as columns (user can remove or reorder)
  const [comparisonColumnIds, setComparisonColumnIds] = useState<string[]>([])
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()

  const itemsPerPage = 20

  useEffect(() => {
    fetchProjects()
    dayjs.locale('th')
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProjectsFromAPI()
      console.log('Fetched projects:', data.length, data)
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError('ไม่สามารถโหลดข้อมูลโครงการได้')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  // Get ministries from API data, fallback to empty array
  const ministries = useMemo(() => {
    if (!infoData?.ministry) return []
    return infoData.ministry.map((m: { id: number; value: string }) => m.value)
  }, [infoData])

  // Get contract types from API data, fallback to empty array
  const contractTypes = useMemo(() => {
    if (!infoData?.contractType) return []
    return infoData.contractType.map((o: { id: number; value: string }) => o.value)
  }, [infoData])

  // Get business groups (sectors) from API data, fallback to empty array
  const businessGroups = useMemo(() => {
    if (!infoData?.sector) return []
    return infoData.sector.map((s: { id: string; value: string }) => s.value)
  }, [infoData])

  // Helper function to get Thai display name for business group key
  // Since we're now using sector values from API, just return the key as-is
  const getBusinessGroupDisplayName = (key: string): string => {
    return key
  }

  // Get available years from projects
  const availableYears = useMemo(() => {
    const yearSet = new Set<number>()
    projects.forEach(project => {
      if (project.period?.startDate) {
        const year = new Date(project.period.startDate).getFullYear()
        if (!isNaN(year)) yearSet.add(year)
      }
      if (project.period?.endDate) {
        const year = new Date(project.period.endDate).getFullYear()
        if (!isNaN(year)) yearSet.add(year)
      }
    })
    return Array.from(yearSet).sort((a, b) => a - b)
  }, [projects])

  // Initialize filters with all options selected by default (runs when API data is loaded)
  useEffect(() => {
    if (infoData && ministries.length > 0 && businessGroups.length > 0 && contractTypes.length > 0) {
      setTempFilters(prev => ({
        ...prev,
        ministry: [...ministries],
        businessGroup: [...businessGroups],
        contractType: [...contractTypes]
      }))
      setFilters(prev => ({
        ...prev,
        ministry: [...ministries],
        businessGroup: [...businessGroups],
        contractType: [...contractTypes]
      }))
    }
  }, [infoData, ministries, businessGroups, contractTypes])

  // Filter and search projects (same logic as home page)
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (!project) return false
      
      const matchesSector = !filters.sector || (project.sector && project.sector.some((s: any) => {
        const sectorStr = typeof s === 'string' ? s : (s?.description || s?.id || '')
        return sectorStr.toLowerCase().includes(filters.sector.toLowerCase())
      }))
      
      // Filter by business group (sector) - match by sector value from API
      const matchesBusinessGroup = filters.businessGroup.length === 0 || filters.businessGroup.some(selectedGroup => {
        // Handle "อื่น ๆ" - projects that don't match any defined business group
        if (selectedGroup === 'อื่น ๆ') {
          if (!project.sector || !Array.isArray(project.sector)) return true
          // Check if project matches any sector from API
          const apiSectorValues = infoData?.sector?.map(s => s.value) || []
          const projectSectorValues = project.sector.map((s: any) => {
            if (typeof s === 'string') return s
            return s?.description || s?.id || ''
          })
          // Check if any project sector matches any API sector
          const matchesAnyGroup = projectSectorValues.some(projectSector => 
            apiSectorValues.some(apiSector => 
              projectSector === apiSector || projectSector.includes(apiSector) || apiSector.includes(projectSector)
            )
          )
          return !matchesAnyGroup
        }
        
        if (!project.sector || !Array.isArray(project.sector)) return false
        // Match by sector value (description or id)
        return project.sector.some((s: any) => {
          const sectorValue = typeof s === 'string' ? s : (s?.description || s?.id || '')
          // Direct match or partial match
          return sectorValue === selectedGroup || 
                 sectorValue.includes(selectedGroup) || 
                 selectedGroup.includes(sectorValue)
        })
      })
      
      const ministryClassification = project.additionalClassifications?.find(c => c.scheme === 'TH-MINISTRY')
      const matchesMinistry = filters.ministry.length === 0 || filters.ministry.some(selectedMinistry => {
        // Handle "อื่น ๆ" - projects that don't have a ministry or have a ministry not in the list
        if (selectedMinistry === 'อื่น ๆ') {
          const ministryName = ministryClassification?.description
          if (!ministryName) return true // No ministry classification = "อื่น ๆ"
          // Check if ministry is in the predefined list (excluding "อื่น ๆ")
          const predefinedMinistries = ministries.filter(m => m !== 'อื่น ๆ')
          return !predefinedMinistries.includes(ministryName)
        }
        
        return ministryClassification?.description === selectedMinistry
      })
      
      // Filter by contract type - match by value from API
      const contractTypeIdentifier = project.identifiers?.find(i => i.scheme === 'TH-PPP-TYPE')
      const matchesContractType = filters.contractType.length === 0 || filters.contractType.some(selectedType => {
        // Handle "อื่น ๆ" - projects that don't match any contract type from API
        if (selectedType === 'อื่น ๆ') {
          const contractTypeId = contractTypeIdentifier?.id
          if (!contractTypeId) return true // No contract type = "อื่น ๆ"
          // Check if contract type matches any contract type from API
          const apiOwnershipValues = infoData?.contractType?.map((o: { id: number; value: string }) => o.value) || []
          const matchesAnyType = apiOwnershipValues.some((apiValue: string) => {
            // Check if contractTypeId appears in the API value (handles cases like "BOT (ช่วงแรก)\nBTO (ช่วงหลัง)")
            return apiValue.includes(contractTypeId) || contractTypeId === apiValue
          })
          return !matchesAnyType
        }
        
        // Match by ownership type value from API
        // The selectedType is the value from the API (e.g., "BOT", "BTO", "BOT (ช่วงแรก)\nBTO (ช่วงหลัง)")
        if (!contractTypeIdentifier?.id) return false
        
        // Check if the contract type ID matches the selected ownership type value
        // Handle cases where the API value contains the contract type (e.g., "BOT (ช่วงแรก)\nBTO (ช่วงหลัง)")
        return selectedType.includes(contractTypeIdentifier.id) || contractTypeIdentifier.id === selectedType
      })
      
      const matchesSearch = !filters.search || 
        project.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.publicAuthority?.name?.toLowerCase().includes(filters.search.toLowerCase())

      // Filter by date range (same as home page)
      const matchesDateRange = (() => {
        if (!filters.dateRange) return true
        
        // Parse date range string (format: "D MMM YYYY - D MMM YYYY" or "D MMM YYYY")
        const dateRangeParts = filters.dateRange.split(' - ')
        if (dateRangeParts.length === 0) return true
        
        let filterStartDate: Date | null = null
        let filterEndDate: Date | null = null
        
        if (dateRangeParts.length === 1) {
          // Single date selected
          const parsedDate = dayjs(dateRangeParts[0].trim(), 'D MMM YYYY', 'th')
          if (parsedDate.isValid()) {
            filterStartDate = parsedDate.startOf('year').toDate()
            filterEndDate = parsedDate.endOf('year').toDate()
          }
        } else if (dateRangeParts.length === 2) {
          // Date range selected
          const startParsed = dayjs(dateRangeParts[0].trim(), 'D MMM YYYY', 'th')
          const endParsed = dayjs(dateRangeParts[1].trim(), 'D MMM YYYY', 'th')
          if (startParsed.isValid()) {
            filterStartDate = startParsed.startOf('year').toDate()
          }
          if (endParsed.isValid()) {
            filterEndDate = endParsed.endOf('year').toDate()
          }
        }
        
        if (!filterStartDate && !filterEndDate) return true
        
        const projectStartDate = project.period?.startDate ? new Date(project.period.startDate) : null
        const projectEndDate = project.period?.endDate ? new Date(project.period.endDate) : null
        
        if (!projectStartDate && !projectEndDate) return false
        
        // Check if project period overlaps with filter date range
        if (filterStartDate && filterEndDate) {
          const projectStart = projectStartDate || projectEndDate || new Date(0)
          const projectEnd = projectEndDate || projectStartDate || new Date(9999, 11, 31)
          return projectStart <= filterEndDate && projectEnd >= filterStartDate
        } else if (filterStartDate) {
          const projectEnd = projectEndDate || projectStartDate || new Date(0)
          return projectEnd >= filterStartDate
        } else if (filterEndDate) {
          const projectStart = projectStartDate || projectEndDate || new Date(9999, 11, 31)
          return projectStart <= filterEndDate
        }
        
        return true
      })()

      return matchesSector && matchesBusinessGroup && matchesMinistry && matchesContractType && matchesSearch && matchesDateRange
    })
  }, [projects, filters, ministries, businessGroups, contractTypes, infoData])

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProjects = filteredProjects.slice(startIndex, endIndex)

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...tempFilters, [key]: value }
    setTempFilters(newFilters)
    setFilterValidationError(null)
  }

  const handleMultiSelectChange = (key: 'ministry' | 'businessGroup' | 'contractType', value: string) => {
    setTempFilters(prev => {
      const currentValues = prev[key]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      return { ...prev, [key]: newValues }
    })
  }

  const handleSelectAll = (key: 'ministry' | 'businessGroup' | 'contractType', selectAll: boolean) => {
    setTempFilters(prev => {
      let allOptions: string[] = []
      if (key === 'ministry') {
        allOptions = ministries
      } else if (key === 'businessGroup') {
        allOptions = businessGroups
      } else if (key === 'contractType') {
        allOptions = contractTypes
      }
      return { ...prev, [key]: selectAll ? allOptions : [] }
    })
  }

  const handleClearFilter = (key: 'ministry' | 'businessGroup' | 'contractType') => {
    setTempFilters(prev => ({
      ...prev,
      [key]: []
    }))
  }

  const applyFilters = () => {
    setFilters(tempFilters)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    const emptyFilters = {
      sector: '',
      search: '',
      ministry: [] as string[],
      businessGroup: [] as string[],
      contractType: [] as string[],
      dateRange: ''
    }
    setFilters(emptyFilters)
    setTempFilters(emptyFilters)
    setFilterValidationError(null)
    setCurrentPage(1)
  }

  const toggleProjectSelection = (id: string) => {
    setSelectedProjectIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllOnPage = (checked: boolean) => {
    setSelectedProjectIds(prev => {
      const next = new Set(prev)
      if (checked) currentProjects.forEach(p => next.add(p.id))
      else currentProjects.forEach(p => next.delete(p.id))
      return next
    })
  }

  const isAllOnPageSelected = currentProjects.length > 0 && currentProjects.every(p => selectedProjectIds.has(p.id))
  const selectedProjects = useMemo(() => projects.filter(p => selectedProjectIds.has(p.id)), [projects, selectedProjectIds])
  const maxCompare = 5
  const canCompare = selectedProjectIds.size >= 2 && selectedProjectIds.size <= maxCompare

  // Fields to show in compare modal (label, getter)
  const compareFields: { label: string; getValue: (p: ProjectData) => string }[] = [
    { label: 'ชื่อโครงการ', getValue: p => p.title || 'N/A' },
    { label: 'รายละเอียด', getValue: p => (p.description || 'N/A').slice(0, 80) + ((p.description?.length || 0) > 80 ? '...' : '') },
    { label: 'กระทรวง', getValue: p => p.additionalClassifications?.find(c => c.scheme === 'TH-MINISTRY')?.description || 'N/A' },
    { label: 'หน่วยงานภาครัฐ', getValue: p => p.publicAuthority?.name || 'N/A' },
    { label: 'เอกชนคู่สัญญา', getValue: p => p.parties?.filter(party => party.roles?.includes('contractor')).map(party => party.name).join(', ') || 'N/A' },
    { label: 'กลุ่มธุรกิจ', getValue: p => (p.sector?.map((s: any) => typeof s === 'string' ? s : (s?.description || s?.id || '')).join(', ') || 'N/A').slice(0, 60) },
    { label: 'วันที่เริ่ม', getValue: p => formatDateForDisplay(p.period?.startDate) },
    { label: 'วันที่สิ้นสุด', getValue: p => formatDateForDisplay(p.period?.endDate) },
    { label: 'ระยะเวลา', getValue: p => p.period?.durationInDays ? `${p.period.durationInDays} วัน` : (p.period?.durationInMonths ? `${p.period.durationInMonths} เดือน` : 'N/A') },
    { label: 'งบประมาณ (บาท)', getValue: p => p.budget?.amount?.amount != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(p.budget.amount.amount) : 'N/A' },
    { label: 'ประเภท', getValue: p => p.type || 'N/A' },
    { label: 'วัตถุประสงค์', getValue: p => (p.purpose || 'N/A').slice(0, 60) },
    { label: 'สถานะ', getValue: p => p.status || 'N/A' },
  ]

  // When comparison modal opens, init column order from selected projects
  useEffect(() => {
    if (showCompareModal && selectedProjects.length >= 2) {
      setComparisonColumnIds(selectedProjects.slice(0, maxCompare).map(p => p.id))
    }
  }, [showCompareModal]) // eslint-disable-line react-hooks/exhaustive-deps -- only when modal opens

  const comparisonProjects = useMemo(() => {
    return comparisonColumnIds
      .map(id => selectedProjects.find(p => p.id === id))
      .filter((p): p is ProjectData => p != null)
  }, [comparisonColumnIds, selectedProjects])

  const removeComparisonColumn = (projectId: string) => {
    setComparisonColumnIds(prev => prev.filter(id => id !== projectId))
  }

  const moveComparisonColumn = (index: number, direction: 'left' | 'right') => {
    const next = [...comparisonColumnIds]
    const swap = direction === 'left' ? index - 1 : index + 1
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setComparisonColumnIds(next)
  }

  const exportToCSV = () => {
    const csvData = filteredProjects.map(project => ({
      'Project Name': project.title,
      'Sponsoring Authority': project.publicAuthority?.name || '',
      'Location': project.locations?.map(l => l.description).join(', ') || '',
      'Sector': project.sector?.join(', ') || '',
      'Sub Sector': project.sector?.join(', ') || '', // Using sector as sub-sector for now
      'Total Project Cost': `฿${((project.budget?.amount?.amount || 0) / 1000000).toFixed(0)}M`,
      'Start Date': project.period?.startDate ? new Date(project.period.startDate).toLocaleDateString() : '',
      'End Date': project.period?.endDate ? new Date(project.period.endDate).toLocaleDateString() : '',
      'Duration (Months)': project.period?.durationInMonths || '',
      'Description': project.description || '',
      'Purpose': project.purpose || ''
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `thailand-ppp-projects-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <ProjectsPageSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">เกิดข้อผิดพลาด</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <button
            onClick={fetchProjects}
            className="btn-primary"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('projects.title')}</h1>
          <p className="mt-2 text-gray-600">
            {t('projects.subtitle')}
          </p>
        </div>
      </div>

      {/* Filters - Horizontal Layout */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          {t('home.search')} & {t('home.filters')}
        </h3>
        
        {/* All Filters in One Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mb-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('home.search')}
            </label>
            <input
              type="text"
              placeholder={t('home.searchProjects')}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary"
              value={tempFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Business Group Filter */}
          <div className="lg:col-span-2">
            <MultiSelectDropdown
              label={t('dashboard.businessGroup')}
              options={businessGroups}
              selectedValues={tempFilters.businessGroup}
              onChange={(value) => handleMultiSelectChange('businessGroup', value)}
              onSelectAll={(selectAll) => handleSelectAll('businessGroup', selectAll)}
              onClear={() => handleClearFilter('businessGroup')}
              placeholder={t('home.allBusinessGroups')}
              displayNameMap={getBusinessGroupDisplayName}
            />
          </div>

          {/* Ministry Filter */}
          <div className="lg:col-span-2">
            <MultiSelectDropdown
              label={t('dashboard.ministry')}
              options={ministries}
              selectedValues={tempFilters.ministry}
              onChange={(value) => handleMultiSelectChange('ministry', value)}
              onSelectAll={(selectAll) => handleSelectAll('ministry', selectAll)}
              onClear={() => handleClearFilter('ministry')}
              placeholder={t('home.allMinistries')}
            />
          </div>

          {/* Contract Type Filter */}
          <div className="lg:col-span-3">
            <MultiSelectDropdown
              label={t('home.contractType')}
              options={contractTypes}
              selectedValues={tempFilters.contractType}
              onChange={(value) => handleMultiSelectChange('contractType', value)}
              onSelectAll={(selectAll) => handleSelectAll('contractType', selectAll)}
              onClear={() => handleClearFilter('contractType')}
              placeholder={t('home.allContractTypes')}
            />
          </div>

          {/* Year Range Filter */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('home.yearRange')}
            </label>
            <div className="relative">
              <Lucide
                icon="Calendar"
                className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400"
              />
              <Litepicker
                value={tempFilters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                options={{
                  autoApply: false,
                  singleMode: false,
                  numberOfColumns: 2,
                  numberOfMonths: 2,
                  showWeekNumbers: true,
                  format: 'D MMM YYYY',
                  lang: 'th-TH',
                  dropdowns: {
                    minYear: availableYears.length > 0 ? Math.min(...availableYears) : 1990,
                    maxYear: availableYears.length > 0 ? Math.max(...availableYears) : null,
                    months: true,
                    years: true,
                  },
                }}
                className="pl-10 w-full text-sm !box"
                placeholder="ทั้งหมด"
              />
            </div>
            {filterValidationError && (
              <div className="mt-1.5 p-1.5 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{filterValidationError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit and Clear Buttons */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {t('home.showingProjects')
                .replace('{filtered}', filteredProjects.length.toString())
                .replace('{total}', projects.length.toString())}
            </div>
            <div className="space-x-2">
              <button
                onClick={applyFilters}
                className="px-3 py-1.5 text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-dark rounded-md transition-colors duration-200"
              >
                {t('home.applyFilters') || 'Apply Filters'}
              </button>
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                {t('projects.clearFilters')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {selectedProjectIds.size > 0 && (
              <span className="text-sm text-gray-600">
                เลือกไว้ {selectedProjectIds.size} โครงการ
              </span>
            )}
            {selectedProjectIds.size >= 2 && (
              <button
                onClick={() => setShowCompareModal(true)}
                disabled={!canCompare}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-dark rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lucide icon="GitCompare" className="w-5 h-5" />
                เปรียบเทียบโครงการ ({selectedProjectIds.size})
              </button>
            )}
            {selectedProjectIds.size > maxCompare && (
              <span className="text-sm text-amber-600">เลือกได้สูงสุด {maxCompare} โครงการ</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Link
                href="/create"
                className="bg-theme-primary hover:bg-theme-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {t('projects.createProject')}
              </Link>
            )}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-dark rounded-md transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('projects.exportCSV')}
            </button>
          </div>
        </div>
        {/* Selected for comparison: display chips with optional remove */}
        {selectedProjectIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">โครงการที่เลือกสำหรับเปรียบเทียบ:</span>
            {selectedProjects.map((project) => (
              <span
                key={project.id}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-lg bg-theme-primary/10 text-theme-primary border border-theme-primary/30 text-sm"
              >
                <span className="max-w-[200px] truncate" title={project.title || ''}>
                  {project.title || 'N/A'}
                </span>
                <button
                  type="button"
                  onClick={() => toggleProjectSelection(project.id)}
                  className="p-0.5 rounded hover:bg-theme-primary/20 text-theme-primary hover:text-theme-primary-dark transition-colors"
                  title="ลบออกจากการเปรียบเทียบ"
                  aria-label="ลบออกจากการเปรียบเทียบ"
                >
                  <Lucide icon="X" className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllOnPageSelected}
                      onChange={(e) => selectAllOnPage(e.target.checked)}
                      className="h-4 w-4 text-theme-primary border-gray-300 rounded focus:ring-theme-primary"
                    />
                  </label>
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black opacity-100 uppercase tracking-wider">
                  {t('projects.projectName')}
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black opacity-100 uppercase tracking-wider">
                  {t('projects.ministry')}
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black opacity-100 uppercase tracking-wider">
                  {t('projects.publicAuthority')}
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black opacity-100 uppercase tracking-wider">
                  {t('projects.privateContractor')}
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-black opacity-100 uppercase tracking-wider">
                  {t('projects.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.has(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="h-4 w-4 text-theme-primary border-gray-300 rounded focus:ring-theme-primary"
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {project.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {project.additionalClassifications
                        ?.find(classification => classification.scheme === 'TH-MINISTRY')
                        ?.description || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {project.publicAuthority?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {project.parties
                        ?.filter(party => party.roles && party.roles.includes('contractor'))
                        .map(party => party.name)
                        .join(', ') || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/view/${project.id}`}
                        className="flex items-center mr-1 text-theme-primary hover:text-theme-primary-dark"
                      >
                        <Lucide icon="Eye" className="w-4 h-4 mr-1" />
                        {t('common.view')}
                      </Link>
                      {isAuthenticated && (
                        <>
                          <Link
                            href={`/edit/${project.id}`}
                            className="flex items-center mr-1 text-theme-primary hover:text-theme-primary-dark"
                          >
                            <Lucide icon="CheckSquare" className="w-4 h-4 mr-1" />
                            {t('common.edit')}
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmProject(project)}
                            className="flex items-center text-red-600 hover:text-red-700 hover:underline"
                            title={t('common.delete') || 'ลบ'}
                          >
                            <Lucide icon="Trash2" className="w-4 h-4 mr-1" />
                            {t('common.delete') || 'ลบ'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredProjects.length)}</span> of{' '}
                  <span className="font-medium">{filteredProjects.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (pageNum > totalPages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-theme-primary-light border-theme-primary text-theme-primary-dark'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('projects.noProjects')}</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirmProject(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('common.delete') || 'ลบ'} โครงการ
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                คุณต้องการลบโครงการ &quot;{deleteConfirmProject.title || 'N/A'}&quot; ใช่หรือไม่? การลบจะทำในหน้านี้เท่านั้น (ยังไม่ส่งไปที่เซิร์ฟเวอร์)
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmProject(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {t('common.cancel') || 'ยกเลิก'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = deleteConfirmProject.id
                    setProjects(prev => prev.filter(p => p.id !== id))
                    setSelectedProjectIds(prev => {
                      const next = new Set(prev)
                      next.delete(id)
                      return next
                    })
                    setDeleteConfirmProject(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  {t('common.delete') || 'ลบ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Projects Modal */}
      {showCompareModal && selectedProjects.length >= 2 && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCompareModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-[92vw] max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">เปรียบเทียบโครงการ</h2>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  aria-label="ปิด"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 min-h-0">
                {comparisonProjects.length === 0 ? (
                  <p className="text-gray-500 text-sm">ไม่มีคอลัมน์ที่เลือกไว้ คลิกปิดแล้วเลือกโครงการใหม่</p>
                ) : (
                  <div className="w-full">
                    <table className="w-full table-fixed divide-y divide-gray-200 border border-gray-200" style={{ tableLayout: 'fixed' }}>
                      <colgroup>
                        <col style={{ width: '15%' }} />
                        {comparisonProjects.map((_, i) => (
                          <col key={i} style={{ width: `${comparisonProjects.length > 0 ? 85 / comparisonProjects.length : 0}%` }} />
                        ))}
                      </colgroup>
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                            รายการ
                          </th>
                          {comparisonProjects.map((project, colIndex) => (
                            <th key={project.id} className="px-2 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 align-top min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-theme-primary truncate" title={project.title || ''}>
                                    {project.title || 'N/A'}
                                  </div>
                                  <Link
                                    href={`/view/${project.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-500 hover:text-theme-primary mt-0.5 inline-block"
                                  >
                                    ดูรายละเอียด →
                                  </Link>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => moveComparisonColumn(colIndex, 'left')}
                                    disabled={colIndex === 0}
                                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                                    title="เลื่อนซ้าย"
                                    aria-label="เลื่อนซ้าย"
                                  >
                                    <Lucide icon="ChevronLeft" className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveComparisonColumn(colIndex, 'right')}
                                    disabled={colIndex === comparisonProjects.length - 1}
                                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                                    title="เลื่อนขวา"
                                    aria-label="เลื่อนขวา"
                                  >
                                    <Lucide icon="ChevronRight" className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeComparisonColumn(project.id)}
                                    className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
                                    title="ลบคอลัมน์ออก"
                                    aria-label="ลบคอลัมน์ออก"
                                  >
                                    <Lucide icon="X" className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {compareFields.map((field, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50/50' : ''}>
                            <td className="px-3 py-3 text-sm font-medium text-gray-700 border-r border-gray-200 align-top whitespace-nowrap min-w-0">
                              {field.label}
                            </td>
                            {comparisonProjects.map(project => (
                              <td key={project.id} className="px-2 py-3 text-sm text-gray-900 border-r border-gray-200 align-top break-words min-w-0 overflow-hidden">
                                {field.getValue(project)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
