'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ProjectData } from '@/types/project'
import { BUSINESS_GROUP_INFO, getBusinessGroupInfo } from '@/types/businessGroup'
import ProjectCard from '@/components/ProjectCard'
import HomePageSkeleton from '@/components/HomePageSkeleton'
import ThailandMap from '@/components/ThailandMap'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getColor } from '@/lib/utils/colors'
import clsx from 'clsx'
import Lucide from '@/components/Base/Lucide'
import Tippy from '@/components/Base/Tippy'
import ReportPieChart from '@/components/ReportPieChart'
import dynamic from 'next/dynamic'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { parseThaiDateRangeToISO } from '@/lib/utils/dateUtils'
import { useInfo, type InfoData } from '@/app/hooks/useInfo'
import { useSummary, type SummaryData, type SummaryFilters } from '@/app/hooks/useSummary'

// Dynamically import Litepicker to avoid SSR issues
const Litepicker = dynamic(() => import('@/components/Base/Litepicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-50 text-gray-400">
      Loading date picker...
    </div>
  )
})
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
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

export default function HomePage() {
  const [filterValidationError, setFilterValidationError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
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
      sector: infoData.sector as Array<{ id: string; value: string }>,
      contractType: infoData.contractType
    } : undefined
  )

  // Combined loading state
  const loading = infoLoading || summaryLoading
  const error = summaryError ? 'ไม่สามารถโหลดข้อมูลสรุปได้' : (infoError ? 'ไม่สามารถโหลดข้อมูลได้' : null)

  // Fallback to empty data structure on error to prevent crashes
  const safeInfoData = infoData || { sector: [], ministry: [], contractType: [], projectType: [], concessionForm: [] }

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
  
  // Helper function to get Thai display name for business group key
  // Since we're now using sector values from API, just return the key as-is
  const getBusinessGroupDisplayName = (key: string): string => {
    return key
  }

  // Get available years from summary data
  const availableYears = useMemo(() => {
    if (summaryData?.investmentByYear) {
      return summaryData.investmentByYear.map(item => item.year).sort((a, b) => a - b)
    }
    return []
  }, [summaryData])

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
    // The useSummary hook will automatically refetch when filters change (React Query handles this)
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
    // The useSummary hook will automatically refetch when filters change
  }

  // Check if any filters are active
  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.ministry.length > 0 ||
      filters.businessGroup.length > 0 ||
      filters.contractType.length > 0 ||
      filters.dateRange
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

  // Prepare pie chart data for ministry distribution
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

  // Calculate unique publicAuthority count (จำนวนบริษัทเอกชนคู่สัญญา) (use summary data)
  const uniquePublicAuthorityCount = useMemo(() => {
    return summaryData?.summary?.uniqueContractors || 0
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

  // Chart options for Projects by Ministry
  const pieChartOptions = useMemo(() => {
    // Calculate "Other Ministries" investment if needed
    const calculateOtherInvestment = () => {
      const TOP_N = 3
      const sortedEntries = Object.entries(ministryCounts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
      
      if (sortedEntries.length <= TOP_N) return 0
      
      const otherMinistries = sortedEntries.slice(TOP_N).map(([name]) => name)
      return otherMinistries.reduce((sum, name) => sum + (ministryInvestments[name] || 0), 0)
    }

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
              const label = context.label || ''
              const value = context.parsed || 0
              let investment = 0
              if (label === 'กระทรวงอื่น ๆ') {
                investment = calculateOtherInvestment()
              } else {
                investment = ministryInvestments[label] || 0
              }
              const investmentMillions = investment / 1000000
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
            let investment = 0
            if (label === 'กระทรวงอื่น ๆ') {
              investment = calculateOtherInvestment()
            } else {
              investment = ministryInvestments[label] || 0
            }
            const investmentMillions = investment / 1000000
            return `${label} (${percentage.toFixed(0)}%)\n${investmentMillions.toLocaleString('th-TH')} ล้านบาท\n${value} โครงการ`
          },
          textAlign: 'center' as const,
          textStrokeColor: '#ffffff',
          textStrokeWidth: 2,
        }
      }
    }
  }, [ministryInvestments, ministryCounts, t])

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
          display: false,
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

  // Sector ID to display name mapping
  const sectorIdMapping: Record<string, string> = {
    'transport.road': '(1) ถนน ทางหลวง ทางพิเศษ การขนส่งทางถนน',
    'transport.rail': '(2) รถไฟ รถไฟฟ้า การขนส่งทางราง',
    'transport.urban': '(2) รถไฟ รถไฟฟ้า การขนส่งทางราง',
    'transport.air': '(3) ท่าอากาศยาน การขนส่งทางอากาศ',
    'transport.water': '(4) ท่าเรือ การขนส่งทางน้ำ',
    'waterAndWaste': '(5) การจัดการน้ำ การชลประทาน การประปา การบำบัดน้ำเสีย',
    'energy': '(6) การพลังงาน',
    'communications': '(7) การโทรคมนาคม การสื่อสาร',
    'health': '(8) โรงพยาบาล การสาธารณสุข',
    'education': '(9) โรงเรียน การศึกษา',
    'socialHousing': '(10) ที่อยู่อาศัยหรือสิ่งอำนวยความสะดวกสำหรับผู้มีรายได้น้อย ผู้สูงวัย ผู้ด้อยโอกาส หรือผู้พิการ',
    'cultureSportsAndRecreation': '(11) ศูนย์นิทรรศการและศูนย์การประชุม',
    'economy': '(12) กิจการอื่นตามที่กำหนดในพระราชกฤษฎีกา',
    'governance': '(12) กิจการอื่นตามที่กำหนดในพระราชกฤษฎีกา'
  }

  // Calculate sector counts for the 12 sectors (use summary data)
  const sectorCounts = useMemo(() => {
    if (summaryData?.sectorCounts) {
      // Initialize all sectors with zeros, then merge summary data
      const sectors: Record<string, number> = {
        '(1) ถนน ทางหลวง ทางพิเศษ การขนส่งทางถนน': 0,
        '(2) รถไฟ รถไฟฟ้า การขนส่งทางราง': 0,
        '(3) ท่าอากาศยาน การขนส่งทางอากาศ': 0,
        '(4) ท่าเรือ การขนส่งทางน้ำ': 0,
        '(5) การจัดการน้ำ การชลประทาน การประปา การบำบัดน้ำเสีย': 0,
        '(6) การพลังงาน': 0,
        '(7) การโทรคมนาคม การสื่อสาร': 0,
        '(8) โรงพยาบาล การสาธารณสุข': 0,
        '(9) โรงเรียน การศึกษา': 0,
        '(10) ที่อยู่อาศัยหรือสิ่งอำนวยความสะดวกสำหรับผู้มีรายได้น้อย ผู้สูงวัย ผู้ด้อยโอกาส หรือผู้พิการ': 0,
        '(11) ศูนย์นิทรรศการและศูนย์การประชุม': 0,
        '(12) กิจการอื่นตามที่กำหนดในพระราชกฤษฎีกา': 0
      }
      // Merge summary data
      Object.assign(sectors, summaryData.sectorCounts)
      return sectors
    }
    // Return empty sectors if no summary data
    return {
      '(1) ถนน ทางหลวง ทางพิเศษ การขนส่งทางถนน': 0,
      '(2) รถไฟ รถไฟฟ้า การขนส่งทางราง': 0,
      '(3) ท่าอากาศยาน การขนส่งทางอากาศ': 0,
      '(4) ท่าเรือ การขนส่งทางน้ำ': 0,
      '(5) การจัดการน้ำ การชลประทาน การประปา การประปา การบำบัดน้ำเสีย': 0,
      '(6) การพลังงาน': 0,
      '(7) การโทรคมนาคม การสื่อสาร': 0,
      '(8) โรงพยาบาล การสาธารณสุข': 0,
      '(9) โรงเรียน การศึกษา': 0,
      '(10) ที่อยู่อาศัยหรือสิ่งอำนวยความสะดวกสำหรับผู้มีรายได้น้อย ผู้สูงวัย ผู้ด้อยโอกาส หรือผู้พิการ': 0,
      '(11) ศูนย์นิทรรศการและศูนย์การประชุม': 0,
      '(12) กิจการอื่นตามที่กำหนดในพระราชกฤษฎีกา': 0
    }
  }, [summaryData])


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

  // Calculate domestic vs international distribution (use summary data if available)
  const projectScope = useMemo(() => {
    if (summaryData?.projectScope) {
      return summaryData.projectScope
    }
    return {
      domestic: { count: 0, investment: 0 },
      international: { count: 0, investment: 0 }
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
          backgroundColor: getColor('primary', 0.8),
          borderColor: getColor('primary', 1),
          borderWidth: 1,
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
              return value.toLocaleString('th-TH') + ' ล้านบาท'
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
          display: false,
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

  // Prepare pie chart data for project scope (Domestic vs International)
  const projectScopeChartData = useMemo(() => {
    const allLabels = [
      t('home.domesticProjects') || 'Domestic',
      t('home.internationalProjects') || 'International'
    ]
    const allData = [
      projectScope.domestic.count,
      projectScope.international.count
    ]
    // Filter out zero values
    const filteredData = allLabels
      .map((label, index) => ({ label, value: allData[index] }))
      .filter(item => item.value > 0)
    
    return {
      labels: filteredData.map(item => item.label),
      datasets: [{
        label: t('home.projectsByScope') || 'Projects by Scope',
        data: filteredData.map(item => item.value),
        borderColor: '#ffffff',
        borderWidth: 2,
      }]
    }
  }, [projectScope, t])

  const projectScopeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const scopeKey = context.dataIndex === 0 ? 'domestic' : 'international'
            const investmentMillions = projectScope[scopeKey].investment / 1000000 // ล้านบาท
            return [
              `${label}`,
              `${t('home.numberOfProjects')}: ${value}`,
              `${t('dashboard.totalInvestment')}: ${investmentMillions.toLocaleString('th-TH')} ${t('dashboard.millionBaht')}`
            ]
          }
        }
      },
      datalabels: {
        color: '#ffffff',
        font: {
          family: 'IBM Plex Sans Thai',
          weight: 'bold' as const,
          size: 14,
        },
        formatter: (value: number, context: any) => {
          const label = context.chart.data.labels[context.dataIndex]
          const scopeKey = context.dataIndex === 0 ? 'domestic' : 'international'
          const investmentMillions = projectScope[scopeKey].investment / 1000000 // ล้านบาท
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
          return `${label}\n${value} ${t('home.projects')}\n${investmentMillions.toLocaleString('th-TH')} ล้านบาท\n(${percentage}%)`
        },
        textAlign: 'center' as const,
        textStrokeColor: '#333333',
        textStrokeWidth: 1.5,
      }
    }
  }

  if (loading) {
    return <HomePageSkeleton />
  }

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
                  {t('home.search')} & {t('home.filters')}
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Lucide icon="X" className="w-5 h-5" />
                </button>
              </div>
            
              {/* Search */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
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

              {/* Year Range Filter */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                      // maxDays will be set to null in the initialization to allow unlimited range
                      // Only constraint: end date must be >= start date (handled by Litepicker automatically)
                      dropdowns: {
                        minYear: availableYears.length > 0 ? Math.min(...availableYears) : 1990,
                        maxYear: availableYears.length > 0 ? Math.max(...availableYears) : null,
                        months: true,
                        years: true,
                      },
                    }}
                    className="pl-10 w-full text-xs !box"
                    placeholder="ทั้งหมด"
                  />
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
                    if (filters.dateRange) count++
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

             {/* จำนวนบริษัทเอกชนคู่สัญญา */}
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
                      {uniquePublicAuthorityCount.toLocaleString()}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      จำนวนบริษัทเอกชนคู่สัญญา
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Investment Card */}
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
                      {t('dashboard.totalInvestment')} {(() => {
                        const totalInvestment = summaryData?.summary?.totalInvestment || 0
                        if (totalInvestment >= 1000000000000) return '(ล้านล้านบาท)'
                        if (totalInvestment >= 1000000) return '(ล้านบาท)'
                        return '(บาท)'
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Highest Project Budget Card */}
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
                      {t('home.highestProjectBudget') || 'Highest Project Budget'} {(() => {
                        const maxBudget = summaryData?.summary?.maxBudget || 0
                        if (maxBudget === 0) return ''
                        if (maxBudget >= 1000000000000) return '(ล้านล้านบาท)'
                        if (maxBudget >= 1000000) return '(ล้านบาท)'
                        return '(บาท)'
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ongoing / Completing Projects Card (mock number) */}
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
                      {24}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      โครงการกำลังดำเนินการ
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>


          {/* Dashboard */}
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Dashboard - Projects by Ministry Pie Chart */}
              <div className="box p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('home.projectsByMinistry')}
                  </h2>
                </div>
                <div className="h-80">
                  {Object.keys(ministryCounts).length > 0 ? (
                    <ReportPieChart 
                      data={ministryChartData.datasets[0].data}
                      labels={ministryChartData.labels}
                      height={320}
                      options={pieChartOptions}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      {t('home.noDataAvailable')}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Dashboard - Total Investment by Ministry Donut Chart */}
              <div className="box p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('dashboard.totalInvestmentByMinistry')}
                  </h2>
                </div>
                <div className="h-80">
                  {Object.keys(ministryInvestments).length > 0 ? (
                    <ReportPieChart 
                      type="doughnut"
                      data={ministryInvestmentChartData.datasets[0].data}
                      labels={ministryInvestmentChartData.labels}
                      height={320}
                      options={investmentPieChartOptions}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      {t('home.noDataAvailable')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Scale & Sector Cards Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left - Project Scale Pie Chart */}
              <div className="box p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {t('home.projectScale') || 'Project Scale Distribution'}
                    </h2>
                    <Tippy
                      content={'เล็ก (&lt;1,000 ล้านบาท)<br/>กลาง (1,000-5,000 ล้านบาท)<br/>ใหญ่ (&gt;5,000 ล้านบาท)'}
                      options={{
                        placement: 'top',
                        trigger: 'click',
                        allowHTML: true,
                      }}
                    >
                      <button
                        type="button"
                        className="flex items-center justify-center w-5 h-5 text-slate-500 hover:text-primary transition-colors"
                        aria-label="Show project scale information"
                      >
                        <Lucide icon="Info" className="w-5 h-5" />
                      </button>
                    </Tippy>
                  </div>
                </div>
                <div className="h-80 relative flex items-center justify-center">
                  {summaryData?.projectScales ? (
                    <>
                      {/* Curved text above pie chart */}
                      {/* <div className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-10" style={{ height: '80px', paddingTop: '20px' }}>
                        <svg width="320" height="80" viewBox="0 0 320 80" preserveAspectRatio="xMidYMin meet" className="overflow-visible">
                          <defs>
                            <path
                              id="project-scale-curve-path"
                              d="M 25,30 A 150,150 0 0,1 295,30"
                              fill="none"
                            />
                          </defs>
                          <text
                            fontSize="13"
                            fill="#374151"
                            className="font-medium"
                            style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}
                          >
                            <textPath
                              href="#project-scale-curve-path"
                              startOffset="50%"
                              textAnchor="middle"
                            >
                              {(() => {
                                const totalProjects = projectScales.small.count + projectScales.medium.count + projectScales.big.count
                                const totalInvestment = projectScales.small.investment + projectScales.medium.investment + projectScales.big.investment
                                const totalInvestmentMillions = (totalInvestment / 1000000).toLocaleString('th-TH')
                                return `รวม ${totalProjects} โครงการ ${totalInvestmentMillions} ล้านบาท`
                              })()}
                            </textPath>
                          </text>
                        </svg>
                      </div> */}
                      <div className="relative z-0">
                        <ReportPieChart 
                          data={projectScaleChartData.datasets[0].data}
                          labels={projectScaleChartData.labels}
                          height={320}
                          options={projectScaleChartOptions}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      {t('home.noDataAvailable')}
                    </div>
                  )}
                </div>
              </div>

              {/* Right - Bar chart: มูลค่ารวมของโครงการแต่ละปี */}
              <div className="box p-4 sm:p-6">
                <div className="mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    มูลค่ารวมของโครงการแยกตามปี
                  </h2>
                </div>
                {Object.keys(investmentByYear).length > 0 ? (
                  <div className="h-64 sm:h-80">
                    <Bar
                      data={investmentByYearChartData}
                      options={investmentByYearChartOptions}
                    />
                  </div>
                ) : (
                  <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">
                    {t('home.noDataAvailable')}
                  </div>
                )}
              </div>
            </div>

              {/* Right - 12 Sector Cards */}
              <div className="box p-4 sm:p-6 mt-8">
                <div className="mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    จำนวนโครงการแยกตามกลุ่มกิจการ
                  </h2>
                </div>
                <div className="min-h-80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr overflow-y-auto">
                  {(() => {
                    // Use summary data if available, otherwise fallback to businessGroupMapping
                    const groupsToDisplay = summaryData?.businessGroupStats 
                      ? summaryData.businessGroupStats.map(group => ({
                          groupName: group.groupName,
                          displayName: group.displayName,
                          icon: group.icon,
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
                            displayName: info.displayName,
                            icon: info.icon,
                            stats
                          }
                        })
                    
                    return groupsToDisplay.map(({ groupName, displayName, icon, stats }) => {
                      const mappedIcon = mapIconName(icon)
                      const iconPath = `/assets/icons/${mappedIcon}`
                    
                    // Pie chart colors: primary (blue), pending (orange), warning (yellow)
                    const scaleColors = {
                      small: getColor('primary', 0.9),    // Blue
                      medium: getColor('pending', 0.9),   // Orange
                      big: getColor('warning', 0.9)       // Yellow
                    }

                    // Get scale counts - separate into rows with projects and empty rows
                    const allScales = [
                      { scale: 'small', count: stats.small.count, color: scaleColors.small, label: 'เล็ก' },
                      { scale: 'medium', count: stats.medium.count, color: scaleColors.medium, label: 'กลาง' },
                      { scale: 'big', count: stats.big.count, color: scaleColors.big, label: 'ใหญ่' }
                    ]
                    
                    // Separate scales with projects (show first) and empty scales (show last)
                    const scalesWithProjects = allScales.filter(item => item.count > 0)
                    const emptyScales = allScales.filter(item => item.count === 0)
                    const scaleCounts = [...scalesWithProjects, ...emptyScales]

                    return (
                      <div key={groupName} className="box p-3 sm:p-4 flex gap-2 sm:gap-4 h-full">
                        {/* Left Column */}
                        <div className="flex flex-col items-center justify-start flex-shrink-0 w-16 sm:w-20">
                          {/* Icon */}
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
                                // Fallback if image doesn't exist
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
                          {/* Name/Title */}
                          <p className="text-xs font-medium text-gray-700 text-center leading-tight break-words">
                            {displayName}
                          </p>
                        </div>

                        {/* Right Column */}
                        <div className="flex-1 flex flex-col min-w-0">
                          {/* Row 1: Total */}
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {stats.total.count} โครงการ
                            </p>
                            <p className="text-xs text-gray-600">
                              ({(stats.total.investment / 1000000).toLocaleString('th-TH')} ล้านบาท)
                            </p>
                          </div>

                          {/* Rows 2-4: Scale counts - show rows with projects first, then empty rows */}
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
              </div>

            {/* Domestic vs International Section */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-8">
              <div className="box p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('home.projectScope') || 'Project Scope Distribution'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('home.projectScopeDesc') || 'Domestic vs International Projects'}
                  </p>
                </div>
                <div className="h-80">
                  {summaryData?.projectScope ? (
                    <ReportPieChart 
                      data={projectScopeChartData.datasets[0].data}
                      labels={projectScopeChartData.labels}
                      height={320}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      {t('home.noDataAvailable')}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg p-6">
                <div className="flex flex-col justify-center gap-6 py-8">
                  <div className="flex items-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors shadow">
                    <div className="flex-shrink-0 mr-4">
                      <svg className="w-8 h-8 text-chula-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-700">{t('home.domesticProjects') || 'Domestic Projects'}</h3>
                      <p className="text-2xl font-bold text-chula-pink">{projectScope.domestic.count.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {t('dashboard.totalInvestment')}: {(projectScope.domestic.investment / 1000000).toLocaleString('th-TH')} ล้านบาท
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors shadow">
                    <div className="flex-shrink-0 mr-4">
                      <svg className="w-8 h-8 text-chula-pink-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-700">{t('home.internationalProjects') || 'International Projects'}</h3>
                      <p className="text-2xl font-bold text-chula-pink-darker">{projectScope.international.count.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {t('dashboard.totalInvestment')}: {(projectScope.international.investment / 1000000).toLocaleString('th-TH')} ล้านบาท
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Map and Latest Projects Section - Template Style */}
          <div className="grid grid-cols-12 gap-6 mt-6">
            {/* BEGIN: Thailand Map (Official Store Style) */}
            <div className="col-span-12 xl:col-span-6">
              <div className="items-center block h-10 intro-y sm:flex">
                <h2 className="mr-5 text-lg font-medium truncate">
                  {t('home.exploreMap')}
                </h2>
              </div>
              <div className="p-5 mt-12 intro-y box sm:mt-5">
                <div>
                  {t('home.exploreMapDesc') || 'Explore Thailand\'s PPP projects on the map, click the marker to see project details.'}
                </div>
                <ThailandMap className="h-[310px] mt-5 rounded-md bg-slate-200" />
              </div>
            </div>
            {/* END: Thailand Map */}
            
            {/* BEGIN: Latest Projects (Weekly Best Sellers Style) */}
            <div className="col-span-12 xl:col-span-6">
              <div className="flex items-center h-10 intro-y">
                <h2 className="mr-5 text-lg font-medium truncate">
                  {t('home.latestProjects') || 'Latest Projects'}
                </h2>
              </div>
              <div className="mt-5">
                {error ? (
                  <div className="text-center py-8">
                    <div className="mx-auto h-10 w-10 text-red-400">
                      <Lucide icon="AlertCircle" className="w-10 h-10" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">เกิดข้อผิดพลาด</h3>
                    <p className="mt-1 text-xs text-gray-500">{error}</p>
                  </div>
                ) : latestProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto h-10 w-10 text-gray-400">
                      <Lucide icon="FileText" className="w-10 h-10" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('home.noProjects')}</h3>
                    <p className="mt-1 text-xs text-gray-500">{t('home.noProjectsDesc')}</p>
                  </div>
                ) : (
                  <>
                    {latestProjects
                      .filter((p) => !!p?.id)
                      .slice(0, 4)
                      .map((project) => (
                        <Link 
                          key={project.id} 
                          href={`/view/${project.id}`}
                          className="intro-y block"
                        >
                          <div className="px-4 py-4 mb-3 box transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                {/* Project Name */}
                                <div className="font-medium text-sm text-gray-900 mb-2 truncate" title={project.title || 'N/A'}>
                                  {project.title || 'N/A'}
                                </div>
                                
                                {/* หน่วยงานเจ้าของโครงการ */}
                                <div className="mb-1.5 flex items-center min-w-0">
                                  <span className="text-xs font-medium text-gray-600 flex-shrink-0">หน่วยงานเจ้าของโครงการ: </span>
                                  <span className="text-xs text-gray-700 truncate ml-1" title={project.publicAuthority?.name || 'N/A'}>
                                    {project.publicAuthority?.name || 'N/A'}
                                  </span>
                                </div>
                                
                                {/* เอกชนคู่สัญญา */}
                                <div className="flex items-center min-w-0">
                                  <span className="text-xs font-medium text-gray-600 flex-shrink-0">เอกชนคู่สัญญา: </span>
                                  <span className="text-xs text-gray-700 truncate ml-1" title={(() => {
                                    const contractors = project.parties?.filter(party => party.roles && party.roles.includes('contractor'))
                                    if (contractors && contractors.length > 0) {
                                      return contractors.map(party => party.name).join(', ')
                                    }
                                    return 'N/A'
                                  })()}>
                                    {(() => {
                                      const contractors = project.parties?.filter(party => party.roles && party.roles.includes('contractor'))
                                      if (contractors && contractors.length > 0) {
                                        return contractors.map(party => party.name).join(', ')
                                      }
                                      return 'N/A'
                                    })()}
                                  </span>
                                </div>
                              </div>
                              {project.updated && (
                                <div className="flex-shrink-0">
                                  <div className="px-2 py-1 text-xs font-medium text-white rounded-full cursor-pointer bg-primary">
                                    {dayjs(project.updated).format('DD/MM/YYYY')}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    <Link
                      href="/projects"
                      className="block w-full py-4 text-center border border-dotted rounded-md intro-y border-slate-400 dark:border-darkmode-300 text-slate-500"
                    >
                      {t('nav.allProjects') || 'View More'}
                    </Link>
                  </>
                )}
              </div>
            </div>
            {/* END: Latest Projects */}
          </div>
        </div>
      </div>
    </div>
  )
}
