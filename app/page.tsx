'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {getBusinessGroupInfo, getBusinessGroupDisplayName } from '@/types/businessGroup'
import HomePageSkeleton from '@/components/HomePageSkeleton'
import ThailandMap from '@/components/ThailandMap'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  getColor,
  chartBarDataset,
  CHART,
  chartHeatmapCellColor,
  chartPieBackgroundColors,
  chartPieHoverBackgroundColors,
} from '@/lib/utils/colors'
import clsx from 'clsx'
import Lucide from '@/components/Base/Lucide'
import Tippy from '@/components/Base/Tippy'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { useInfo, type InfoData } from '@/app/hooks/useInfo'
import { useSummary, type SummaryData, type SummaryFilters, getIconNameByGroupName } from '@/app/hooks/useSummary'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  Filler,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Bubble, Pie } from 'react-chartjs-2'
import {
  ALL_SECTORS,
  buildSectorMinistryHeatmapFromSummaryApi,
  buildSectorMinistryHeatmapMatrix,
  getProjectDisplayNamesForSectorCard,
  type SectorBubblePoint,
  type SectorCardWithRisks,
} from '@/lib/dashboardMockData'
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  Filler,
  ChartDataLabels
)

// Multi-select dropdown component
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
        <label className="block text-xs font-medium text-gray-700">
          {label}
        </label>
        {hasSelections && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            className="text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors"
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
          <span className="truncate text-xs">
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
              <span className="text-xs font-medium text-gray-900">เลือกทั้งหมด</span>
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
                  <span className="text-xs text-gray-700">{displayName}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Types are now imported from hooks

type HomeTab = 'overview' | 'sector'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<HomeTab>('overview')
  const [filterValidationError, setFilterValidationError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    sector: '',
    search: '',
    ministry: [] as string[],
    businessGroup: [] as string[],
    contractType: [] as string[],
    startYear: '',
    endYear: ''
  })
  const [tempFilters, setTempFilters] = useState({
    sector: '',
    search: '',
    ministry: [] as string[],
    businessGroup: [] as string[],
    contractType: [] as string[],
    startYear: '',
    endYear: ''
  })
  const { t } = useLanguage()
  const router = useRouter()

  // Set Thai locale for dayjs
  useEffect(() => {
    dayjs.locale('th')
  }, [])

  // Use React Query hooks
  const { data: infoData, isLoading: infoLoading, error: infoError } = useInfo()
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useSummary(
    filters, 
    infoData ? {
      ministry: infoData.ministry,
      sector: infoData.sector,
      contractType: infoData.contractType
    } : undefined
  )

  // Combined loading state
  const loading = infoLoading || summaryLoading
  const error = summaryError ? 'ไม่สามารถโหลดข้อมูลสรุปได้' : (infoError ? 'ไม่สามารถโหลดข้อมูลได้' : null)

  // Fallback to empty data structure on error to prevent crashes
  const safeInfoData = infoData || { sector: [], ministry: [], contractType: [], projectType: [], concessionForm: [], riskCategory: [], riskFactor: [] }

  // Filter conversion logic is now handled in useSummary hook

  // Business group mapping: English key -> sector ID(s)
  const businessGroupMapping: Record<string, string[]> = {
    'transport.road': ['transport.road'],
    'transport.rail': ['transport.rail', 'transport.urban'],
    'transport.air': ['transport.air'],
    'transport.water': ['transport.water'],
    'waterAndWaste': ['waterAndWaste'],
    'energy': ['energy'],
    'communications': ['communications'],
    'health': ['health'],
    'education': ['education'],
    'socialHousing': ['socialHousing'],
    'cultureSportsAndRecreation': ['cultureSportsAndRecreation'],
    'others': ['economy', 'governance']
  }

  // Map API icon names to actual file names
  const mapIconName = (iconName: string): string => {
    const iconMap: Record<string, string> = {
      'transport_road.png': '01_transport.road.png',
      'transport_rail.png': '02_transport.rail.png',
      'transport_air.png': '03_transport.air.png',
      'transport_water.png': '04_transport.water.png',
      'waterAndWaste.png': '05_waterAndWaste.png',
      'energy.png': '06_energy.png',
      'communications.png': '07_communications.png',
      'health.png': '08_health.png',
      'education.png': '09_education.png',
      'socialHousing.png': '10_socialHousing.png',
      'cultureSportsAndRecreation.png': '11_cultureSportsAndRecreation.png',
      'others.png': '12_others.png'
    }
    // If already in correct format, return as-is
    if (iconName.startsWith('01_') || iconName.startsWith('02_') || iconName.startsWith('03_') || 
        iconName.startsWith('04_') || iconName.startsWith('05_') || iconName.startsWith('06_') ||
        iconName.startsWith('07_') || iconName.startsWith('08_') || iconName.startsWith('09_') ||
        iconName.startsWith('10_') || iconName.startsWith('11_') || iconName.startsWith('12_')) {
      return iconName
    }
    // Otherwise, map it
    return iconMap[iconName] || iconName
  }

  // Get ministries from API data, fallback to empty array
  const ministries = useMemo(() => {
    if (!safeInfoData?.ministry) return []
    return safeInfoData.ministry.map(m => m.value)
  }, [safeInfoData])

  // Get contract types from API data, fallback to empty array
  const contractTypes = useMemo(() => {
    if (!safeInfoData?.contractType) return []
    return safeInfoData.contractType.map(o => o.value)
  }, [safeInfoData])

  // Get business groups (sectors) from API data, fallback to empty array
  const businessGroups = useMemo(() => {
    if (!infoData?.sector) return []
    return infoData.sector.map(s => s.value)
  }, [infoData])

  // Note: Filtering is now handled by the backend via api/summary
  // No need for client-side filtering since we're using summary data
  
  // Initialize tempFilters with all options selected by default (for UI display only)
  // But keep filters empty until user clicks "Apply Search" to avoid double API calls
  useEffect(() => {
    if (safeInfoData && ministries.length > 0 && businessGroups.length > 0 && contractTypes.length > 0) {
      // Set tempFilters with all options (same as projects page)
      setTempFilters(prev => ({
        ...prev,
        ministry: [...ministries],
        businessGroup: [...businessGroups],
        contractType: [...contractTypes]
      }))
      // Do NOT set filters here - filters remain empty until user clicks "Apply Search"
      // This prevents double API calls (one without params, one with params)
    }
  }, [safeInfoData, ministries, businessGroups, contractTypes])

  // Year range for filter: 1950 to current year + 50
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const start = 1950
    const end = currentYear + 50
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [])

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
    const startY = tempFilters.startYear ? parseInt(tempFilters.startYear, 10) : NaN
    const endY = tempFilters.endYear ? parseInt(tempFilters.endYear, 10) : NaN
    if (tempFilters.startYear && tempFilters.endYear && (!Number.isInteger(startY) || !Number.isInteger(endY) || endY < startY)) {
      setFilterValidationError(t('home.yearRangeInvalid') || 'ปีสิ้นสุดต้องไม่น้อยกว่าปีเริ่มต้น')
      return
    }
    setFilterValidationError(null)
    setFilters(tempFilters)
    // The useSummary hook will automatically refetch when filters change (React Query handles this)
  }

  const clearFilters = () => {
    const emptyFilters = {
      sector: '',
      search: '',
      ministry: [] as string[],
      businessGroup: [] as string[],
      contractType: [] as string[],
      startYear: '',
      endYear: ''
    }
    setFilters(emptyFilters)
    setTempFilters(emptyFilters)
    setFilterValidationError(null)
    // The useSummary hook will automatically refetch when filters change
  }

  // Check if any filters are active
  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.ministry.length > 0 ||
      filters.businessGroup.length > 0 ||
      filters.contractType.length > 0 ||
      filters.startYear ||
      filters.endYear
    )
  }

  // Get latest 4 projects (use summary data)
  const latestProjects = useMemo(() => {
    if (summaryData?.latestProjects && summaryData.latestProjects.length > 0) {
      return summaryData.latestProjects.slice(0, 4)
    }
    return []
  }, [summaryData])

  // Calculate ministry counts for pie chart (use summary data)
  const ministryCounts = useMemo(() => {
    if (summaryData?.ministryStats) {
      const counts: Record<string, number> = {}
      summaryData.ministryStats.forEach(stat => {
        counts[stat.ministry] = stat.projectCount
      })
      if (summaryData.otherMinistries.projectCount > 0) {
        counts['กระทรวงอื่น ๆ'] = summaryData.otherMinistries.projectCount
      }
      return counts
    }
    return {}
  }, [summaryData])

  // Ministry project counts (top N + other) for bar chart
  const ministryChartData = useMemo(() => {
    const TOP_N = 3 // Show top 3 ministries
    
    // Sort ministries by count (descending) and filter out zeros
    const sortedEntries = Object.entries(ministryCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
    
    let labels: string[] = []
    let data: number[] = []
    
    if (sortedEntries.length <= TOP_N) {
      // If we have fewer or equal to TOP_N ministries, show all
      labels = sortedEntries.map(([name]) => name)
      data = sortedEntries.map(([, count]) => count)
    } else {
      // Show top N and group the rest as "Other Ministries"
      const topEntries = sortedEntries.slice(0, TOP_N)
      const otherEntries = sortedEntries.slice(TOP_N)
      
      const otherSum = otherEntries.reduce((sum, [, count]) => sum + count, 0)
      
      labels = [...topEntries.map(([name]) => name)]
      data = [...topEntries.map(([, count]) => count)]
      
      // Only add "Other" category if it has value > 0
      if (otherSum > 0) {
        labels.push('กระทรวงอื่น ๆ')
        data.push(otherSum)
      }
    }
    
    return {
      labels,
      datasets: [{
        label: t('home.projectsByMinistry'),
        data,
        borderColor: '#ffffff',
        borderWidth: 2,
      }]
    }
  }, [ministryCounts, t])

  // จำนวนหน่วยงานรัฐเจ้าของโครงการ — from summary.uniquePublicAuthority
  const uniquePublicAuthorityCount = useMemo(() => {
    const v = summaryData?.summary?.uniquePublicAuthority
    if (v == null) return 0
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : 0
  }, [summaryData])

  // จำนวนบริษัทเอกชนคู่สัญญา — from summary.uniqueContractors
  const uniqueContractorsCount = useMemo(() => {
    const v = summaryData?.summary?.uniqueContractors
    if (v == null) return 0
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : 0
  }, [summaryData])

  // Calculate total investment by ministry (use summary data)
  const ministryInvestments = useMemo(() => {
    if (summaryData?.ministryInvestments) {
      const investments: Record<string, number> = {}
      summaryData.ministryInvestments.forEach(stat => {
        investments[stat.ministry] = stat.totalInvestment
      })
      if (summaryData.otherMinistriesInvestment.projectCount > 0) {
        investments['กระทรวงอื่น ๆ'] = summaryData.otherMinistriesInvestment.totalInvestment
      }
      return investments
    }
    return {}
  }, [summaryData])

  // Prepare pie chart data for ministry investment
  const ministryInvestmentChartData = useMemo(() => {
    const TOP_N = 3 // Show top 3 ministries
    
    // Sort ministries by investment (descending) and filter out zeros
    const sortedEntries = Object.entries(ministryInvestments)
      .filter(([, investment]) => investment > 0)
      .sort((a, b) => b[1] - a[1])
    
    let labels: string[] = []
    let data: number[] = []
    
    if (sortedEntries.length <= TOP_N) {
      // If we have fewer or equal to TOP_N ministries, show all
      labels = sortedEntries.map(([name]) => name)
      data = sortedEntries.map(([, investment]) => investment / 1000000) // Convert to ล้านบาท (millions)
    } else {
      // Show top N and group the rest as "Other Ministries"
      const topEntries = sortedEntries.slice(0, TOP_N)
      const otherEntries = sortedEntries.slice(TOP_N)
      
      const otherSum = otherEntries.reduce((sum, [, investment]) => sum + investment, 0)
      
      labels = [...topEntries.map(([name]) => name)]
      data = [...topEntries.map(([, investment]) => investment / 1000000)]
      
      // Only add "Other" category if it has value > 0
      if (otherSum > 0) {
        labels.push('กระทรวงอื่น ๆ')
        data.push(otherSum / 1000000)
      }
    }
    
    return {
      labels,
      datasets: [{
        label: t('dashboard.totalInvestment'),
        data,
        borderColor: '#ffffff',
        borderWidth: 2,
      }]
    }
  }, [ministryInvestments, t])

  const ministryProjectsBarData = useMemo(
    () => ({
      labels: ministryChartData.labels,
      datasets: [
        {
          label: ministryChartData.datasets[0].label,
          data: ministryChartData.datasets[0].data,
          ...chartBarDataset('primary'),
        },
      ],
    }),
    [ministryChartData]
  )

  const ministryProjectsBarOptions = useMemo(
    () => ({
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const label = ctx.label ?? ''
              return [`${label}`, `${t('home.numberOfProjects')}: ${ctx.parsed.x}`]
            },
          },
        },
        datalabels: { display: false },
      },
      scales: {
        x: {
          min: 0,
          ticks: {
            font: { size: 11 },
            stepSize: 1,
            callback: function (this: any, value: string | number) {
              const n = typeof value === 'number' ? value : Number(value)
              return Number.isInteger(n) ? n : ''
            },
          },
          grid: { color: getColor('slate.300', 0.3) },
        },
        y: { ticks: { font: { size: 11 }, maxRotation: 0 }, grid: { display: false } },
      },
    }),
    [t]
  )

  // Chart options for Investment by Ministry
  const investmentPieChartOptions = useMemo(() => {
    // Calculate "Other Ministries" count if needed
    const calculateOtherCount = () => {
      const TOP_N = 3
      const sortedEntries = Object.entries(ministryInvestments)
        .filter(([, investment]) => investment > 0)
        .sort((a, b) => b[1] - a[1])
      
      if (sortedEntries.length <= TOP_N) return 0
      
      const otherMinistries = sortedEntries.slice(TOP_N).map(([name]) => name)
      return otherMinistries.reduce((sum, name) => sum + (ministryCounts[name] || 0), 0)
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || ''
              const value = context.parsed || 0 // This is in ล้านบาท (millions)
              let count = 0
              if (label === 'กระทรวงอื่น ๆ') {
                count = calculateOtherCount()
              } else {
                count = ministryCounts[label] || 0
              }
              return [
                `${label}`,
                `${t('dashboard.totalInvestment')}: ${value.toLocaleString('th-TH')} ${t('dashboard.millionBaht')}`,
                `${t('home.numberOfProjects')}: ${count}`
              ]
            }
          }
        },
        datalabels: {
          color: '#1f2937',
          font: {
            family: 'IBM Plex Sans Thai',
            weight: 'bold' as const,
            size: 16,
          },
          formatter: (value: number, context: any) => {
            const label = context.chart.data.labels[context.dataIndex]
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = total > 0 ? parseFloat(((value / total) * 100).toFixed(1)) : 0
            
            // If percentage <= 6%, show only percentage
            if (percentage <= 6) {
              return `${percentage.toFixed(0)}%`
            }
            
            // Otherwise show full label
            let count = 0
            if (label === 'กระทรวงอื่น ๆ') {
              count = calculateOtherCount()
            } else {
              count = ministryCounts[label] || 0
            }
            const valueMillions = value // already in ล้านบาท (millions)
            return `${label} (${percentage.toFixed(0)}%)\n${valueMillions.toLocaleString('th-TH')} ล้านบาท\n${count} โครงการ`
          },
          textAlign: 'center' as const,
          textStrokeColor: '#ffffff',
          textStrokeWidth: 2,
        }
      }
    }
  }, [ministryCounts, ministryInvestments, t])

  // Calculate business group statistics by scale (use summary data)
  const businessGroupStats = useMemo(() => {
    if (summaryData?.businessGroupStats) {
      const stats: Record<string, { 
        total: { count: number; investment: number },
        small: { count: number; investment: number },
        medium: { count: number; investment: number },
        big: { count: number; investment: number }
      }> = {}
      
      summaryData.businessGroupStats.forEach(group => {
        stats[group.groupName] = {
          total: group.total,
          small: group.small,
          medium: group.medium,
          big: group.big
        }
      })
      
      // Initialize missing groups with zeros
      Object.keys(businessGroupMapping).forEach(groupName => {
        if (!stats[groupName]) {
          stats[groupName] = {
            total: { count: 0, investment: 0 },
            small: { count: 0, investment: 0 },
            medium: { count: 0, investment: 0 },
            big: { count: 0, investment: 0 }
          }
        }
      })
      
      return stats
    }
    // Return empty stats if no summary data
    const stats: Record<string, { 
      total: { count: number; investment: number },
      small: { count: number; investment: number },
      medium: { count: number; investment: number },
      big: { count: number; investment: number }
    }> = {}
    Object.keys(businessGroupMapping).forEach(groupName => {
      stats[groupName] = {
        total: { count: 0, investment: 0 },
        small: { count: 0, investment: 0 },
        medium: { count: 0, investment: 0 },
        big: { count: 0, investment: 0 }
      }
    })
    return stats
  }, [summaryData])

  // Calculate project scale distribution (use summary data)
  const projectScales = useMemo(() => {
    if (summaryData?.projectScales) {
      return summaryData.projectScales
    }
    return {
      small: { count: 0, investment: 0 },
      medium: { count: 0, investment: 0 },
      big: { count: 0, investment: 0 }
    }
  }, [summaryData])

  // Calculate total investment by year (use summary data)
  const investmentByYear = useMemo(() => {
    if (summaryData?.investmentByYear) {
      const yearData: Record<number, number> = {}
      summaryData.investmentByYear.forEach(item => {
        yearData[item.year] = item.investment
      })
      return yearData
    }
    return {}
  }, [summaryData])

  // Prepare bar chart data for investment by year
  const investmentByYearChartData = useMemo(() => {
    const sortedYears = Object.keys(investmentByYear)
      .map(y => parseInt(y))
      .sort((a, b) => a - b)
    
    const labels = sortedYears.map(year => year.toString())
    const data = sortedYears.map(year => investmentByYear[year] / 1000000) // Convert to ล้านบาท (millions)
    
    return {
      labels,
      datasets: [
        {
          label: 'มูลค่ารวม (ล้านบาท)',
          data,
          ...chartBarDataset('primary'),
        },
      ],
    }
  }, [investmentByYear])

  // Bar chart options
  const investmentByYearChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const value = context.parsed.y // already in ล้านบาท (millions)
              return `มูลค่ารวม: ${value.toLocaleString('th-TH')} ล้านบาท`
            },
          },
        },
        datalabels: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 11,
            },
            color: getColor('slate.600', 0.8),
          },
          grid: {
            display: false,
          },
          border: {
            display: true,
            color: getColor('slate.300', 0.5),
          },
        },
        y: {
          ticks: {
            font: {
              size: 11,
            },
            color: getColor('slate.600', 0.8),
            callback: function(value: any) {
              return value.toLocaleString('th-TH')
            },
          },
          grid: {
            color: getColor('slate.300', 0.3),
          },
          border: {
            display: true,
            color: getColor('slate.300', 0.5),
          },
        },
      },
    }
  }, [])

  // Prepare pie chart data for project scale
  const projectScaleChartData = useMemo(() => {
    const allLabels = [
      t('home.projectScaleSmall') || 'เล็ก',
      t('home.projectScaleMedium') || 'กลาง',
      t('home.projectScaleBig') || 'ใหญ่'
    ]
    const allData = [
      projectScales.small.count,
      projectScales.medium.count,
      projectScales.big.count
    ]
    
    // Debug: Log the scale counts
    if (typeof window !== 'undefined') {
      console.log('Project Scale Counts:', {
        small: projectScales.small.count,
        medium: projectScales.medium.count,
        big: projectScales.big.count
      })
    }
    
    // Filter out zero values - but ensure we're checking the actual count values
    const filteredData = allLabels
      .map((label, index) => ({ label, value: allData[index], index }))
      .filter(item => {
        const hasValue = item.value > 0
        if (!hasValue && typeof window !== 'undefined') {
          console.log(`Filtered out ${item.label}: value = ${item.value}`)
        }
        return hasValue
      })
    
    if (typeof window !== 'undefined') {
      console.log('Filtered Pie Chart Data:', filteredData)
    }
    
    return {
      labels: filteredData.map(item => item.label),
      datasets: [{
        label: t('home.numberOfProjects') || 'Number of Projects',
        data: filteredData.map(item => item.value),
        borderColor: '#ffffff',
        borderWidth: 2,
      }]
    }
  }, [projectScales, t])

  const projectScaleChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || ''
              const value = context.parsed || 0
              const scaleKey = context.dataIndex === 0 ? 'small' : context.dataIndex === 1 ? 'medium' : 'big'
              const investmentMillions = projectScales[scaleKey].investment / 1000000 // ล้านบาท
              return [
                `${label}`,
                `${t('home.numberOfProjects')}: ${value}`,
                `${t('dashboard.totalInvestment')}: ${investmentMillions.toLocaleString('th-TH')} ${t('dashboard.millionBaht')}`
              ]
            }
          }
        },
        datalabels: {
          color: '#1f2937',
          font: {
            family: 'IBM Plex Sans Thai',
            weight: 'bold' as const,
            size: 16,
          },
          formatter: (value: number, context: any) => {
            const label = context.chart.data.labels[context.dataIndex]
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = total > 0 ? parseFloat(((value / total) * 100).toFixed(1)) : 0
            
            // If percentage <= 6%, show only percentage
            if (percentage <= 6) {
              return `${percentage.toFixed(0)}%`
            }
            
            // Otherwise show full label
            // Map label back to scale key
            const smallLabel = t('home.projectScaleSmall') || 'เล็ก'
            const mediumLabel = t('home.projectScaleMedium') || 'กลาง'
            const bigLabel = t('home.projectScaleBig') || 'ใหญ่'
            
            let scaleKey: 'small' | 'medium' | 'big' = 'small'
            if (label === smallLabel) {
              scaleKey = 'small'
            } else if (label === mediumLabel) {
              scaleKey = 'medium'
            } else if (label === bigLabel) {
              scaleKey = 'big'
            }
            
            const investmentMillions = projectScales[scaleKey].investment / 1000000 // ล้านบาท
            return `${label} (${percentage.toFixed(0)}%)\n${investmentMillions.toLocaleString('th-TH')} ล้านบาท\n${value} โครงการ`
          },
          textAlign: 'center' as const,
          textStrokeColor: '#ffffff',
          textStrokeWidth: 2,
        }
      }
    }
  }, [projectScales, t])

  const PIE_COLOR_KEYS = ['primary', 'pending', 'warning', 'success', 'danger', 'info'] as const

  const contractTypePieRows = useMemo(() => {
    const raw = summaryData?.pieContractTypeCount
    if (!Array.isArray(raw)) return []
    return raw
      .map((r) => {
        const count =
          typeof r.count === 'number' && Number.isFinite(r.count)
            ? r.count
            : Number.isFinite(Number(r.count))
              ? Number(r.count)
              : 0
        return {
          id: r.id,
          name: String(r.name ?? '').trim() || `ประเภท ${r.id}`,
          fullName: String(r.fullName ?? r.name ?? '').trim() || String(r.name ?? `ประเภท ${r.id}`),
          count,
        }
      })
      .filter((r) => r.count > 0)
  }, [summaryData?.pieContractTypeCount])

  const contractTypePieChartData = useMemo(() => {
    const keys = contractTypePieRows.map((_, i) => PIE_COLOR_KEYS[i % PIE_COLOR_KEYS.length])
    return {
      labels: contractTypePieRows.map((r) => r.name),
      datasets: [
        {
          label: 'จำนวนโครงการ',
          data: contractTypePieRows.map((r) => r.count),
          backgroundColor: chartPieBackgroundColors([...keys]),
          hoverBackgroundColor: chartPieHoverBackgroundColors([...keys]),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    }
  }, [contractTypePieRows])

  /** Pie/doughnut often ignores `generateLabels`; render legend in JSX instead. */
  const contractTypePieLegendItems = useMemo(() => {
    const total = contractTypePieRows.reduce((s, r) => s + r.count, 0)
    if (total <= 0 || contractTypePieRows.length === 0) return []
    const keys = contractTypePieRows.map((_, i) => PIE_COLOR_KEYS[i % PIE_COLOR_KEYS.length])
    const colors = chartPieBackgroundColors([...keys])
    return contractTypePieRows.map((row, i) => ({
      id: row.id,
      fullName: row.fullName,
      count: row.count,
      color: colors[i] ?? getColor('slate.400', CHART.pieSlice),
    }))
  }, [contractTypePieRows])

  const contractTypePieChartOptions = useMemo(() => {
    const rows = contractTypePieRows
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 8, bottom: 8, left: 8, right: 8 },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const i = ctx.dataIndex
              const r = rows[i]
              const v = ctx.parsed
              if (!r) return `${v} โครงการ`
              return [`${r.fullName}`, `จำนวน: ${Number(v).toLocaleString('th-TH')} โครงการ`]
            },
          },
        },
        datalabels: {
          clip: false,
          color: '#1f2937',
          font: {
            family: 'IBM Plex Sans Thai',
            weight: 'bold' as const,
            size: 18,
          },
          formatter: (value: number, context: any) => {
            const shortName = context.chart.data.labels[context.dataIndex] as string
            const dataArr = context.dataset.data as number[]
            const total = dataArr.reduce((a, b) => a + b, 0)
            const pct = total > 0 ? (value / total) * 100 : 0
            const pctStr = `${pct.toFixed(1)}%`
            if (pct <= 6) return pctStr
            return `${shortName}\n${pctStr}`
          },
          textAlign: 'center' as const,
          textStrokeColor: '#ffffff',
          textStrokeWidth: 3,
        },
      },
    }
  }, [contractTypePieRows])

  // จำนวนโครงการแยกตามหน่วยงานรัฐเจ้าของโครงการ — api/v1/summary countProjectGroupByPublicAuthority
  const publicAuthorityBarData = useMemo(() => {
    const rows = summaryData?.countProjectGroupByPublicAuthority ?? []
    const normalized = rows
      .map((r) => {
        const name = String(r.publicAuthorityName ?? '').trim()
        const c = r.projectCount
        const count =
          typeof c === 'number' && Number.isFinite(c) ? c : Number.isFinite(Number(c)) ? Number(c) : 0
        return { name, count }
      })
      .filter((x) => x.name.length > 0)
    const sorted = [...normalized].sort((a, b) => b.count - a.count)
    return {
      labels: sorted.map((x) => (x.name.length > 20 ? `${x.name.slice(0, 20)}…` : x.name)),
      fullLabels: sorted.map((x) => x.name),
      datasets: [{ label: 'จำนวนโครงการ', data: sorted.map((x) => x.count), ...chartBarDataset('primary') }],
    }
  }, [summaryData?.countProjectGroupByPublicAuthority])

  const publicAuthorityBarOptions = useMemo(() => ({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const full = publicAuthorityBarData.fullLabels?.[ctx.dataIndex] ?? ctx.label
            return [`${full}`, `จำนวนโครงการ: ${ctx.parsed.x}`]
          },
        },
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        min: 0,
        ticks: {
          font: { size: 11 },
          stepSize: 1,
          callback: function (this: any, value: string | number) {
            const n = typeof value === 'number' ? value : Number(value)
            return Number.isInteger(n) ? n : ''
          },
        },
        grid: { color: getColor('slate.300', 0.3) },
      },
      y: { ticks: { font: { size: 11 }, maxRotation: 0 }, grid: { display: false } },
    },
  }), [publicAuthorityBarData])

  // มูลค่ารวมโครงการแยกตามกระทรวง - horizontal bar (from ministryInvestments)
  const ministryInvestmentHorizontalBarData = useMemo(() => {
    const sorted = [...(summaryData?.ministryInvestments ?? [])]
      .filter((m) => m.totalInvestment > 0)
      .sort((a, b) => b.totalInvestment - a.totalInvestment)
    const labels = sorted.map((m) => m.ministry)
    const data = sorted.map((m) => m.totalInvestment / 1000000)
    return {
      labels,
      datasets: [{ label: 'มูลค่า (ล้านบาท)', data, ...chartBarDataset('primary') }],
    }
  }, [summaryData])

  const ministryInvestmentHorizontalBarOptions = useMemo(() => ({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `มูลค่า: ${Number(ctx.parsed.x).toLocaleString('th-TH')} ล้านบาท`,
        },
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        ticks: { font: { size: 11 }, color: getColor('slate.600', 0.8), callback: (v: any) => (typeof v === 'number' ? v.toLocaleString('th-TH') : v) },
        grid: { color: getColor('slate.300', 0.3) },
        border: { display: true, color: getColor('slate.300', 0.5) },
      },
      y: {
        ticks: { font: { size: 11 }, color: getColor('slate.600', 0.8) },
        grid: { display: false },
        border: { display: true, color: getColor('slate.300', 0.5) },
      },
    },
  }), [])

  // Heat map กลุ่มกิจการ × กระทรวง: Y from api/v1/info ministry; cells from api/v1/summary sectorMinistryHeatmap, else mock.
  const sectorMinistryHeatmapData = useMemo(() => {
    const sectorRows = [...ALL_SECTORS]
    const ministriesSorted = [...(safeInfoData.ministry ?? [])].sort((a, b) => a.id - b.id)
    const nM = ministriesSorted.length
    const nS = sectorRows.length
    const apiRows = summaryData?.sectorMinistryHeatmap
    let data: number[][] = []
    if (nM > 0) {
      if (apiRows && apiRows.length > 0) {
        data = buildSectorMinistryHeatmapFromSummaryApi(apiRows, sectorRows, ministriesSorted)
      } else if (Array.isArray(apiRows) && apiRows.length === 0) {
        data = sectorRows.map(() => Array(nM).fill(0))
      } else {
        data = buildSectorMinistryHeatmapMatrix(nS, nM)
      }
    }
    return { sectorRows, ministriesSorted, data }
  }, [safeInfoData.ministry, summaryData?.sectorMinistryHeatmap])
  const sectorBubbleData = useMemo((): SectorBubblePoint[] => {
    const rows = summaryData?.sectorProjectValueBubble ?? []
    const num = (v: unknown) => {
      if (typeof v === 'number' && Number.isFinite(v)) return v
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }
    return rows
      .map((r) => ({
        sector: String(r.sector ?? '').trim(),
        projectCount: num(r.projectCount),
        totalValue: num(r.totalValue),
        authorityCount: num(r.authorityCount),
      }))
      .filter((d) => d.sector.length > 0)
      .filter((d) => d.projectCount > 0 || d.totalValue > 0 || d.authorityCount > 0)
  }, [summaryData?.sectorProjectValueBubble])
  /** กลุ่มกิจการ cards: counts & value from `GET /api/v1/summary` → `businessGroupStats` */
  const sectorCards = useMemo((): SectorCardWithRisks[] => {
    const toNum = (v: unknown) => {
      if (typeof v === 'number' && Number.isFinite(v)) return v
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }
    const stats = summaryData?.businessGroupStats
    if (!Array.isArray(stats) || stats.length === 0) {
      return ALL_SECTORS.map((sector) => ({
        sector,
        projectCount: 0,
        totalValue: 0,
        riskCategoryIds: [],
      }))
    }
    const byGroup = new Map(stats.map((g) => [g.groupName, g]))
    const ordered: SectorCardWithRisks[] = ALL_SECTORS.map((sector) => {
      const g = byGroup.get(sector)
      return {
        sector,
        projectCount: g ? toNum(g.total?.count) : 0,
        totalValue: g ? toNum(g.total?.investment) : 0,
        riskCategoryIds: [],
      }
    })
    const sectorSet = new Set<string>([...ALL_SECTORS])
    const extras: SectorCardWithRisks[] = stats
      .filter((g) => g.groupName && !sectorSet.has(g.groupName))
      .map((g) => ({
        sector: g.groupName,
        projectCount: toNum(g.total?.count),
        totalValue: toNum(g.total?.investment),
        riskCategoryIds: [],
      }))
    return [...ordered, ...extras]
  }, [summaryData?.businessGroupStats])
  const sectorBubbleChartData = useMemo(() => {
    const maxR = Math.max(...sectorBubbleData.map((d) => d.authorityCount), 1)
    return {
      datasets: [
        {
          label: 'กลุ่มกิจการ',
          data: sectorBubbleData.map((d) => ({
            x: d.projectCount,
            y: d.totalValue / 1000000,
            r: 8 + (d.authorityCount / maxR) * 20,
            sector: d.sector,
          })),
          backgroundColor: getColor('primary', CHART.bubbleFill),
          borderColor: getColor('primary', CHART.bubbleBorder),
          borderWidth: 1,
        },
      ]
    }
  }, [sectorBubbleData])

  const sectorBubbleOptions = useMemo(() => {
    const maxProjectX = Math.max(...sectorBubbleData.map((d) => d.projectCount), 1)
    const useUnitStep = maxProjectX <= 30
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const pt = ctx.raw
              const d = sectorBubbleData[ctx.dataIndex]
              if (!d) return ''
              return [
                `${getBusinessGroupDisplayName(d.sector)}`,
                `จำนวนโครงการ: ${pt.x}`,
                `มูลค่า: ${Number(pt.y).toLocaleString('th-TH')} ล้านบาท`,
                `จำนวนหน่วยงาน: ${d.authorityCount}`,
              ]
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear' as const,
          title: { display: true, text: 'จำนวนโครงการ' },
          min: 0,
          ...(useUnitStep
            ? {
                max: maxProjectX + 1,
                ticks: {
                  font: { size: 11 },
                  stepSize: 1,
                  callback: (v: string | number) => `${Math.round(Number(v))}`,
                },
              }
            : {
                ticks: {
                  font: { size: 11 },
                  precision: 0,
                  maxTicksLimit: 12,
                  callback: (v: string | number) => `${Math.round(Number(v))}`,
                },
              }),
        },
        y: { title: { display: true, text: 'มูลค่าโครงการ (ล้านบาท)' }, ticks: { font: { size: 11 } } },
      },
    }
  }, [sectorBubbleData])

  if (loading) {
    return <HomePageSkeleton />
  }

  const tabContent = activeTab === 'overview' ? (
    <div className="contents">
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="box p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('home.projectsByMinistry')}</h2>
            </div>
            <div className="h-80">
              {Object.keys(ministryCounts).length > 0 ? (
                <Bar data={ministryProjectsBarData} options={ministryProjectsBarOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">{t('home.noDataAvailable')}</div>
              )}
            </div>
          </div>
          <div className="box p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">มูลค่ารวมโครงการ PPP แยกตามกระทรวง (ล้านบาท)</h2>
            </div>
            <div className="h-80">
              {ministryInvestmentHorizontalBarData.labels.length > 0 ? (
                <Bar data={ministryInvestmentHorizontalBarData} options={ministryInvestmentHorizontalBarOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">{t('home.noDataAvailable')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="box p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">จำนวนโครงของแต่ละหน่วยงานเจ้าของโครงการ (5 อันดับแรก)</h2>
            </div>
            <div className="h-80">
              {(publicAuthorityBarData.fullLabels?.length ?? 0) > 0 ? (
                <Bar data={publicAuthorityBarData} options={publicAuthorityBarOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">{t('home.noDataAvailable')}</div>
              )}
            </div>
          </div>
          <div className="box p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">รูปแบบการจัดสรรกรรมสิทธิ์</h2>
              {/* <p className="mt-1 text-sm text-gray-500">
                ชื่อย่อและเปอร์เซ็นต์บนกราฟ — ด้านล่างแสดงชื่อเต็มและจำนวนโครงการ แถวละหนึ่งรายการ
              </p> */}
            </div>
            <div className="h-[20rem] sm:h-[24rem] w-full min-h-[16rem]">
              {contractTypePieRows.length > 0 ? (
                <Pie data={contractTypePieChartData} options={contractTypePieChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">{t('home.noDataAvailable')}</div>
              )}
            </div>
            {contractTypePieLegendItems.length > 0 ? (
              <div className="mx-auto mt-4 w-[80%] max-w-xl border-t border-gray-100 pt-4">
                <ul
                  className="flex w-full flex-col gap-2.5 text-sm text-gray-800"
                  aria-label="คำอธิบายสีกราฟรูปแบบสัญญา"
                >
                  {contractTypePieLegendItems.map((item) => (
                    <li key={item.id} className="flex w-full min-w-0 items-center gap-3">
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-sm ring-1 ring-gray-200/80"
                        style={{ backgroundColor: item.color }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 leading-snug break-words">{item.fullName}</span>
                      <span className="shrink-0 whitespace-nowrap font-medium tabular-nums text-gray-900">
                        {Number(item.count).toLocaleString('th-TH')} โครงการ
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
        <div className="box p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">มูลค่ารวมโครงการ PPP แยกตามปีงบประมาณ  (ล้านบาท)</h2>
          </div>
          {Object.keys(investmentByYear).length > 0 ? (
            <div className="h-64 sm:h-80">
              <Bar data={investmentByYearChartData} options={investmentByYearChartOptions} />
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">{t('home.noDataAvailable')}</div>
          )}
        </div>
      </div>

      {/* จำนวนโครงการแยกตามกลุ่มกิจการ */}
      {/* <div className="box p-4 sm:p-6 mt-8">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            จำนวนโครงการแยกตามกลุ่มกิจการ
          </h2>
        </div>
        <div className="min-h-80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr overflow-y-auto">
          {(() => {
            const groupsToDisplay = summaryData?.businessGroupStats
              ? summaryData.businessGroupStats.map(group => ({
                  groupName: group.groupName,
                  displayName: getBusinessGroupDisplayName(group.groupName),
                  icon: getIconNameByGroupName(group.groupName),
                  stats: {
                    total: group.total,
                    small: group.small,
                    medium: group.medium,
                    big: group.big
                  }
                }))
              : Object.entries(businessGroupMapping).map(([groupName]) => {
                  const stats = businessGroupStats[groupName] || {
                    total: { count: 0, investment: 0 },
                    small: { count: 0, investment: 0 },
                    medium: { count: 0, investment: 0 },
                    big: { count: 0, investment: 0 }
                  }
                  const info = getBusinessGroupInfo(groupName) || { displayName: groupName, icon: 'default.jpg' }
                  return {
                    groupName,
                    displayName: getBusinessGroupDisplayName(groupName),
                    icon: info.icon,
                    stats
                  }
                })

            return groupsToDisplay.map(({ groupName, displayName, icon, stats }) => {
              const mappedIcon = mapIconName(icon)
              const iconPath = `/assets/icons/${mappedIcon}`
              const scaleColors = {
                small: getColor('primary', CHART.scaleDot),
                medium: getColor('pending', CHART.scaleDot),
                big: getColor('warning', CHART.scaleDot)
              }
              const allScales = [
                { scale: 'small', count: stats.small.count, color: scaleColors.small, label: 'เล็ก' },
                { scale: 'medium', count: stats.medium.count, color: scaleColors.medium, label: 'กลาง' },
                { scale: 'big', count: stats.big.count, color: scaleColors.big, label: 'ใหญ่' }
              ]
              const scalesWithProjects = allScales.filter(item => item.count > 0)
              const emptyScales = allScales.filter(item => item.count === 0)
              const scaleCounts = [...scalesWithProjects, ...emptyScales]

              return (
                <div key={groupName} className="box p-3 sm:p-4 flex gap-2 sm:gap-4 h-full">
                  <div className="flex flex-col items-center justify-start flex-shrink-0 w-16 sm:w-20">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 rounded-md overflow-hidden flex items-center justify-center">
                      <img
                        src={iconPath}
                        alt={displayName}
                        width={56}
                        height={56}
                        className="w-full h-full object-contain"
                        style={{ display: 'block', minWidth: '48px', minHeight: '48px' }}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          if (target.parentElement) {
                            const existingFallback = target.parentElement.querySelector('.icon-fallback')
                            if (!existingFallback) {
                              const fallback = document.createElement('div')
                              fallback.className = 'icon-fallback w-full h-full flex items-center justify-center text-gray-400 text-xs'
                              fallback.textContent = 'Icon'
                              target.parentElement.appendChild(fallback)
                            }
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-700 text-center leading-tight break-words">
                      {displayName}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {stats.total.count} โครงการ
                      </p>
                      <p className="text-xs text-gray-600">
                        ({(stats.total.investment / 1000000).toLocaleString('th-TH')} ล้านบาท)
                      </p>
                    </div>
                    <div className="space-y-2">
                      {scaleCounts.map(({ scale, count, color, label }) => (
                        <div key={scale} className="flex items-center gap-2" style={{ minHeight: '20px' }}>
                          {count > 0 ? (
                            <>
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs text-gray-700">
                                {label}: {count} โครงการ
                              </span>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div> */}

      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-12 xl:col-span-6">
          <div className="items-center block h-10 intro-y sm:flex">
            <h2 className="mr-5 text-lg font-medium truncate">{t('home.exploreMap')}</h2>
          </div>
          <div className="p-5 mt-12 intro-y box sm:mt-5">
            {/* <div>{t('home.exploreMapDesc') || 'Explore Thailand\'s PPP projects on the map.'}</div> */}
            <ThailandMap className="h-[310px] rounded-md bg-slate-200" />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-6">
          <div className="flex items-center h-10 intro-y">
            <h2 className="mr-5 text-lg font-medium truncate">{t('home.latestProjects') || 'Latest Projects'}</h2>
          </div>
          <div className="mt-5">
            {error ? (
              <div className="text-center py-8">
                <div className="mx-auto h-10 w-10 text-red-400"><Lucide icon="AlertCircle" className="w-10 h-10" /></div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">เกิดข้อผิดพลาด</h3>
                <p className="mt-1 text-xs text-gray-500">{error}</p>
              </div>
            ) : latestProjects.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-10 w-10 text-gray-400"><Lucide icon="FileText" className="w-10 h-10" /></div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('home.noProjects')}</h3>
                <p className="mt-1 text-xs text-gray-500">{t('home.noProjectsDesc')}</p>
              </div>
            ) : (
              <>
                {latestProjects.filter((p) => !!p?.id).slice(0, 4).map((project) => (
                  <Link key={project.id} href={`/view/${project.id}`} className="intro-y block">
                    <div className="px-4 py-4 mb-3 box transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 mb-2 truncate" title={project.title || 'N/A'}>{project.title || 'N/A'}</div>
                          <div className="mb-1.5 flex items-center min-w-0">
                            <span className="text-xs font-medium text-gray-600 flex-shrink-0">หน่วยงานเจ้าของโครงการ: </span>
                            <span className="text-xs text-gray-700 truncate ml-1" title={project.publicAuthority?.name || 'N/A'}>{project.publicAuthority?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center min-w-0">
                            <span className="text-xs font-medium text-gray-600 flex-shrink-0">เอกชนคู่สัญญา: </span>
                            <span className="text-xs text-gray-700 truncate ml-1">
                              {project.parties?.filter((p) => p.roles?.includes('contractor')).map((p) => p.name).join(', ') || 'N/A'}
                            </span>
                          </div>
                        </div>
                        {project.updated && (
                          <div className="flex-shrink-0">
                            <div className="px-2 py-1 text-xs font-medium text-white rounded-full bg-primary">{dayjs(project.updated).format('DD/MM/YYYY')}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href="/projects" className="block w-full py-4 text-center border border-dotted rounded-md border-slate-400 text-slate-500">{t('nav.allProjects') || 'View More'}</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="contents">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">จำนวนโครงการ vs มูลค่าโครงการ (ขนาดวงกลม = จำนวนหน่วยงาน)</h2>
        <div className="box p-6">
          <div className="h-96">
            {sectorBubbleData.length > 0 ? (
              <Bubble data={sectorBubbleChartData} options={sectorBubbleOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">{t('home.noDataAvailable')}</div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-8 box p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            กลุ่มกิจการ: จำนวนโครงการและมูลค่ารวม
          </h2>
        </div>
        <div className="min-h-80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr overflow-y-auto">
          {sectorCards.map((card) => {
            const icon = getIconNameByGroupName(card.sector)
            const mappedIcon = mapIconName(icon)
            const iconPath = `/assets/icons/${mappedIcon}`
            const displayName = getBusinessGroupDisplayName(card.sector)
            const hoverProjectNames = getProjectDisplayNamesForSectorCard(card)
            return (
              <div
                key={card.sector}
                className="group relative box flex flex-col h-full min-h-[9rem] overflow-hidden p-3 sm:p-4"
              >
                {/* Fixed two-line slot so long names don’t push the row below vs short names */}
                <div className="shrink-0 mb-3 min-h-[2.40625rem] sm:min-h-[2.75rem]">
                  <p
                    className="text-sm sm:text-base font-semibold text-gray-900 leading-[1.375] line-clamp-2"
                    title={displayName}
                  >
                    {displayName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 items-center flex-1 min-h-0">
                  <div className="flex items-center justify-center min-h-[4.5rem] rounded-md overflow-hidden bg-gray-50/80 p-2">
                    <img
                      src={iconPath}
                      alt=""
                      width={64}
                      height={64}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                      style={{ display: 'block' }}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        if (target.parentElement) {
                          const existingFallback = target.parentElement.querySelector('.icon-fallback')
                          if (!existingFallback) {
                            const fallback = document.createElement('div')
                            fallback.className = 'icon-fallback w-full h-full flex items-center justify-center text-gray-400 text-xs'
                            fallback.textContent = 'Icon'
                            target.parentElement.appendChild(fallback)
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center gap-1.5 pl-0.5">
                    <div className="flex flex-col gap-0 leading-none text-gray-900">
                      <span className="text-lg sm:text-xl font-bold tabular-nums tracking-tight">
                        {card.projectCount.toLocaleString('th-TH')}
                      </span>
                      <span className="text-sm sm:text-base font-bold tracking-tight mt-0.5">
                        โครงการ
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={clsx(
                    'absolute inset-0 z-10 flex flex-col p-3 sm:p-4',
                    'bg-white/[0.97] backdrop-blur-[2px]',
                    'opacity-0 pointer-events-none transition-opacity duration-200',
                    'group-hover:opacity-100 group-hover:pointer-events-auto'
                  )}
                >
                  <p className="shrink-0 text-xs font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">
                    รายชื่อโครงการ
                  </p>
                  {hoverProjectNames.length > 0 ? (
                    <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto text-left text-xs leading-snug text-gray-800">
                      {hoverProjectNames.map((name, idx) => (
                        <li key={idx} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                          {name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">ไม่มีโครงการในกลุ่มนี้</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">กลุ่มกิจการ × กระทรวงเจ้าสังกัด</h2>
        <div className="box p-4 overflow-x-auto">
          {sectorMinistryHeatmapData.ministriesSorted.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">ไม่มีรายการกระทรวงจากระบบ</p>
          ) : (
            <>
              <table className="w-full border-collapse text-sm table-fixed">
                <colgroup>
                  <col style={{ width: '15rem' }} />
                  {sectorMinistryHeatmapData.sectorRows.map((row) => (
                    <col key={row} style={{ width: '4rem' }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-left font-medium text-gray-700">
                      กระทรวงเจ้าสังกัด
                    </th>
                    {sectorMinistryHeatmapData.sectorRows.map((row) => {
                      const icon = getIconNameByGroupName(row)
                      const mappedIcon = mapIconName(icon)
                      const iconPath = `/assets/icons/${mappedIcon}`
                      const displayName = getBusinessGroupDisplayName(row)
                      return (
                        <th
                          key={row}
                          className="border border-gray-300 bg-gray-50 px-2 py-2 text-center font-medium text-gray-700 w-16 align-middle"
                          title={displayName}
                        >
                          <div className="w-8 h-8 mx-auto rounded overflow-hidden flex items-center justify-center bg-gray-50">
                            <img
                              src={iconPath}
                              alt=""
                              width={32}
                              height={32}
                              className="w-full h-full object-contain"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const { sectorRows, ministriesSorted, data: heatmapData } = sectorMinistryHeatmapData
                    const rowSums = ministriesSorted.map((_, j) =>
                      sectorRows.reduce((s, _, i) => s + (heatmapData[i]?.[j] ?? 0), 0)
                    )
                    const sortedMinistryIndices = ministriesSorted
                      .map((_, j) => j)
                      .sort((a, b) => rowSums[b] - rowSums[a])
                    const maxVal = Math.max(...heatmapData.flat(), 1)
                    return sortedMinistryIndices.map((j) => {
                      const ministry = ministriesSorted[j]
                      return (
                        <tr key={ministry.id}>
                          <td
                            className="border border-gray-300 px-2 py-1.5 text-gray-800 bg-white align-middle text-left text-xs break-words"
                            style={{ minWidth: '10rem', maxWidth: '18rem' }}
                          >
                            {ministry.value}
                          </td>
                          {sectorRows.map((_, i) => {
                            const val = heatmapData[i]?.[j] ?? 0
                            const bg = chartHeatmapCellColor(val, maxVal)
                            return (
                              <td
                                key={i}
                                className="border border-gray-300 p-1 text-center align-middle w-16"
                                style={{ backgroundColor: bg }}
                              >
                                <span
                                  className={
                                    val > 0
                                      ? 'inline-flex items-center justify-center w-8 h-6 rounded text-gray-800 font-medium'
                                      : 'text-gray-400'
                                  }
                                >
                                  {val}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
              <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-gray-600">
                <span className="text-gray-600">พบโครงการน้อย</span>
                <span className="inline-flex items-center gap-0.5">
                  {(() => {
                    const maxVal = Math.max(...sectorMinistryHeatmapData.data.flat(), 1)
                    return [0, 0.25, 0.5, 0.75, 1].map((f) => {
                      const v = Math.round(maxVal * f)
                      return (
                        <span
                          key={v}
                          className="w-5 h-4 rounded border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: chartHeatmapCellColor(v, maxVal) }}
                          title={String(v)}
                        />
                      )
                    })
                  })()}
                </span>
                <span className="text-gray-600">พบโครงการมาก</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="px-4 sm:px-0">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Search & Filters */}
        <div className={clsx(
          "flex-shrink-0 overflow-hidden transition-all duration-700 ease-out",
          showFilters 
            ? "w-full lg:w-64 filter-panel-enter" 
            : "w-0 lg:w-0 opacity-0"
        )}>
          {showFilters && (
            <div className="box p-4 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">
                  {t('home.filters')}
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Lucide icon="X" className="w-5 h-5" />
                </button>
              </div>
            
              {/* Business Group Filter */}
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

              {/* Ministry Filter */}
              <MultiSelectDropdown
              label={t('dashboard.ministry')}
              options={ministries}
              selectedValues={tempFilters.ministry}
              onChange={(value) => handleMultiSelectChange('ministry', value)}
              onSelectAll={(selectAll) => handleSelectAll('ministry', selectAll)}
              onClear={() => handleClearFilter('ministry')}
              placeholder={t('home.allMinistries')}
            />

              {/* Contract Type Filter */}
              <MultiSelectDropdown
              label={t('home.contractType')}
              options={contractTypes}
              selectedValues={tempFilters.contractType}
              onChange={(value) => handleMultiSelectChange('contractType', value)}
              onSelectAll={(selectAll) => handleSelectAll('contractType', selectAll)}
              onClear={() => handleClearFilter('contractType')}
              placeholder={t('home.allContractTypes')}
            />

              {/* Year Range Filter - ช่วงปีที่ลงนามในสัญญา */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('home.yearRange')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="sr-only">{t('home.startYear') || 'ปีเริ่มต้น'}</label>
                    <select
                      value={tempFilters.startYear}
                      onChange={(e) => handleFilterChange('startYear', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary"
                    >
                      <option value="">{t('home.allYears') || 'ทั้งหมด'}</option>
                      {availableYears.map((y) => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="sr-only">{t('home.endYear') || 'ปีสิ้นสุด'}</label>
                    <select
                      value={tempFilters.endYear}
                      onChange={(e) => handleFilterChange('endYear', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary"
                    >
                      <option value="">{t('home.allYears') || 'ทั้งหมด'}</option>
                      {availableYears.map((y) => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {filterValidationError && (
                  <div className="mt-1.5 p-1.5 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-600">{filterValidationError}</p>
                  </div>
                )}
              </div>

              {/* Submit and Clear Buttons */}
              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">
                  {t('home.showingProjects')
                    .replace('{filtered}', (summaryData?.summary?.totalProjects || 0).toString())
                    .replace('{total}', (summaryData?.summary?.totalProjects || 0).toString())}
                </div>
                <button
                  onClick={applyFilters}
                  className="w-full px-3 py-1.5 mb-2 text-xs font-medium text-white bg-theme-primary hover:bg-theme-primary-dark rounded-md transition-colors duration-200"
                >
                  {t('home.applyFilters') || 'Apply Filters'}
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  {t('projects.clearFilters')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 transition-all duration-700 ease-out">
          {/* Filter Toggle Button */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200",
                hasActiveFilters()
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <Lucide 
                icon="Filter" 
                className={clsx(
                  "w-4 h-4",
                  hasActiveFilters() ? "text-white" : "text-gray-600"
                )} 
              />
              <span className="text-sm font-medium">
                {t('home.filters')}
              </span>
              {hasActiveFilters() && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                  {(() => {
                    let count = 0
                    if (filters.search) count++
                    count += filters.ministry.length
                    count += filters.businessGroup.length
                    count += filters.contractType.length
                    if (filters.startYear || filters.endYear) count++
                    return count
                  })()}
                </span>
              )}
            </button>
          </div>

          {/* Stats Cards - General Report Style */}
          <div className="mb-8">
            <div className="grid grid-cols-12 gap-6 auto-rows-fr">
              {/* Total Projects Card */}
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div className="relative zoom-in h-full">
                  <div className="p-5 box h-full">
                    <div className="flex">
                      <Lucide
                        icon="FolderOpen"
                        className="w-[28px] h-[28px] text-primary"
                      />
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {(summaryData?.summary?.totalProjects || 0).toLocaleString()}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      {t('home.totalProjects')}
                    </div>
                  </div>
                </div>
              </div>

              {/* จำนวนหน่วยงานเจ้าของโครงการ */}
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div className="relative zoom-in h-full">
                  <div className="p-5 box h-full">
                    <div className="flex">
                      <Lucide
                        icon="Building2"
                        className="w-[28px] h-[28px] text-primary"
                      />
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {uniquePublicAuthorityCount.toLocaleString()}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      จำนวนหน่วยงานเจ้าของโครงการ
                    </div>
                  </div>
                </div>
              </div>

             {/* จำนวนบริษัทเอกชนคู่สัญญา — hidden per request
             <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div className="relative zoom-in h-full">
                  <div className="p-5 box h-full">
                    <div className="flex">
                      <img
                        src="/assets/icons/contractor.svg"
                        alt="Contractor"
                        className="w-[28px] h-[28px] object-contain"
                      />
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {uniqueContractorsCount.toLocaleString()}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      จำนวนบริษัทเอกชนคู่สัญญา
                    </div>
                  </div>
                </div>
              </div>
              */}

              {/* Total Investment Card (มูลค่ารวมโครงการทั้งหมด) — hidden per request
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div className="relative zoom-in h-full">
                  <div className="p-5 box h-full">
                    <div className="flex">
                      <div className="w-[28px] h-[28px] flex items-center justify-center text-primary text-2xl font-bold">
                        ฿
                      </div>
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {(() => {
                        const totalInvestment = summaryData?.summary?.totalInvestment || 0
                        if (totalInvestment >= 1000000000000) {
                          const trillion = totalInvestment / 1000000000000
                          return trillion.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                        if (totalInvestment >= 1000000) {
                          const millions = totalInvestment / 1000000
                          return millions.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                        return totalInvestment.toLocaleString('th-TH')
                      })()}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      {t('dashboard.totalInvestment')}
                    </div>
                  </div>
                </div>
              </div>
              */}

              {/* Highest Project Budget Card (มูลค่าโครงการสูงสุด) — hidden per request
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div className="relative zoom-in h-full">
                  <div className="p-5 box h-full">
                    <div className="flex">
                      <Lucide
                        icon="TrendingUp"
                        className="w-[28px] h-[28px] text-primary"
                      />
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {(() => {
                        const maxBudget = summaryData?.summary?.maxBudget || 0
                        if (maxBudget === 0) return '0.00'
                        if (maxBudget >= 1000000000000) {
                          const trillion = maxBudget / 1000000000000
                          return trillion.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                        if (maxBudget >= 1000000) {
                          const millions = maxBudget / 1000000
                          return millions.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                        return maxBudget.toLocaleString('th-TH')
                      })()}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      {t('home.highestProjectBudget') || 'Highest Project Budget'}
                    </div>
                  </div>
                </div>
              </div>
              */}

              {/* Ongoing Projects Card (โครงการกำลังดำเนินการ) — hidden per request
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div className="relative zoom-in h-full">
                  <div className="p-5 box h-full">
                    <div className="flex">
                      <Lucide
                        icon="Activity"
                        className="w-[28px] h-[28px] text-primary"
                      />
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {(summaryData?.summary?.inprogressProjects ?? 0).toLocaleString()}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      โครงการกำลังดำเนินการ
                    </div>
                  </div>
                </div>
              </div>
              */}

            </div>
          </div>

          {/* Tabs: Overview | Sector */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex gap-1" aria-label="Dashboard tabs">
              {[
                { id: 'overview' as HomeTab, label: 'ภาพรวม' },
                { id: 'sector' as HomeTab, label: 'กลุ่มกิจการและหน่วยงาน' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
                    activeTab === tab.id
                      ? 'border-theme-primary text-theme-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {tabContent}

        </div>
      </div>
    </div>
  )
}
