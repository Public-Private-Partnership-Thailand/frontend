'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProjectData } from '@/types/project'
import ProjectCard from '@/components/ProjectCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import ThailandMap from '@/components/ThailandMap'
import { useLanguage } from '@/lib/LanguageContext'
import { fetchProjectsFromAPI } from '@/lib/projectService'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    sector: '',
    search: '',
    ministry: '',
    businessGroup: '',
    contractType: ''
  })
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
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

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (!project) return false
      
      const matchesSector = !filters.sector || (project.sector && project.sector.some(s => s.toLowerCase().includes(filters.sector.toLowerCase())))
      const matchesBusinessGroup = !filters.businessGroup || (project.businessGroup && project.businessGroup.toLowerCase().includes(filters.businessGroup.toLowerCase()))
      const ministryClassification = project.additionalClassifications?.find(c => c.scheme === 'TH-MINISTRY')
      const matchesMinistry = !filters.ministry || (ministryClassification?.description && ministryClassification.description.toLowerCase().includes(filters.ministry.toLowerCase()))
      const matchesContractType = !filters.contractType || (project.contractType && project.contractType.toLowerCase().includes(filters.contractType.toLowerCase()))
      const matchesSearch = !filters.search || 
        project.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.publicAuthority?.name?.toLowerCase().includes(filters.search.toLowerCase())

      return matchesSector && matchesBusinessGroup && matchesMinistry && matchesContractType && matchesSearch
    })
  }, [projects, filters])

  // Get unique values for filter options
  const ministries = useMemo(() => {
    const ministrySet = new Set<string>()
    projects.forEach(project => {
      const ministryClassification = project?.additionalClassifications?.find(c => c.scheme === 'TH-MINISTRY')
      if (ministryClassification?.description) {
        ministrySet.add(ministryClassification.description)
      }
    })
    return Array.from(ministrySet).sort()
  }, [projects])

  const contractTypes = useMemo(() => {
    const contractTypeSet = new Set<string>()
    projects.forEach(project => {
      if (project?.contractType) {
        contractTypeSet.add(project.contractType)
      }
    })
    return Array.from(contractTypeSet).sort()
  }, [projects])

  // Get unique values for business group filter options
  const businessGroups = useMemo(() => {
    const groupSet = new Set<string>()
    projects.forEach(project => {
      if (project?.businessGroup) {
        groupSet.add(project.businessGroup)
      }
    })
    return Array.from(groupSet).sort()
  }, [projects])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      sector: '',
      search: '',
      ministry: '',
      businessGroup: '',
      contractType: ''
    })
  }

  // Get latest 5 projects by start date (fallback to updated) from filtered projects
  const latestProjects = filteredProjects
    .slice()
    .sort((a, b) => {
      const aDate = new Date(a.period?.startDate || a.updated || '1970-01-01').getTime()
      const bDate = new Date(b.period?.startDate || b.updated || '1970-01-01').getTime()
      return bDate - aDate
    })
    .slice(0, 5)

  // Calculate ministry counts for pie chart
  const ministryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    projects.forEach(project => {
      const ministryClassification = project?.additionalClassifications?.find(c => c.scheme === 'TH-MINISTRY')
      if (ministryClassification?.description) {
        counts[ministryClassification.description] = (counts[ministryClassification.description] || 0) + 1
      }
    })
    return counts
  }, [projects])

  // Prepare pie chart data for ministry distribution
  const ministryChartData = useMemo(() => {
    const labels = Object.keys(ministryCounts)
    const data = Object.values(ministryCounts)
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
      '#14B8A6', '#FBBF24'
    ]
    
    return {
      labels,
      datasets: [{
        label: t('home.projectsByMinistry'),
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
      }]
    }
  }, [ministryCounts, t])

  // Calculate budget distribution by ranges
  const budgetRanges = useMemo(() => {
    const ranges = {
      under100M: 0,
      range100Mto500M: 0,
      range500Mto1B: 0,
      range1Bto5B: 0,
      over5B: 0
    }

    projects.forEach(project => {
      const budget = project?.budget?.amount?.amount || 0
      if (budget > 0) {
        if (budget < 100000000) {
          ranges.under100M++
        } else if (budget >= 100000000 && budget < 500000000) {
          ranges.range100Mto500M++
        } else if (budget >= 500000000 && budget < 1000000000) {
          ranges.range500Mto1B++
        } else if (budget >= 1000000000 && budget < 5000000000) {
          ranges.range1Bto5B++
        } else {
          ranges.over5B++
        }
      }
    })

    return ranges
  }, [projects])

  // Prepare bar chart data for budget distribution
  const budgetChartData = useMemo(() => {
    const labels = [
      t('home.budgetUnder100M'),
      t('home.budget100Mto500M'),
      t('home.budget500Mto1B'),
      t('home.budget1Bto5B'),
      t('home.budgetOver5B')
    ]
    const data = [
      budgetRanges.under100M,
      budgetRanges.range100Mto500M,
      budgetRanges.range500Mto1B,
      budgetRanges.range1Bto5B,
      budgetRanges.over5B
    ]
    
    return {
      labels,
      datasets: [{
        label: t('home.numberOfProjects'),
        data,
        backgroundColor: '#EC4899',
        borderColor: '#BE185D',
        borderWidth: 2,
        borderRadius: 8,
      }]
    }
  }, [budgetRanges, t])

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Projects: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        }
      }
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('home.search')}
            </label>
            <input
              type="text"
              placeholder={t('home.searchProjects')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Business Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dashboard.businessGroup')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.businessGroup}
              onChange={(e) => handleFilterChange('businessGroup', e.target.value)}
            >
              <option value="">{t('home.allBusinessGroups')}</option>
              {businessGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Ministry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dashboard.ministry')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.ministry}
              onChange={(e) => handleFilterChange('ministry', e.target.value)}
            >
              <option value="">{t('home.allMinistries')}</option>
              {ministries.map(ministry => (
                <option key={ministry} value={ministry}>{ministry}</option>
              ))}
            </select>
          </div>

          {/* Contract Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('home.contractType')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.contractType}
              onChange={(e) => handleFilterChange('contractType', e.target.value)}
            >
              <option value="">{t('home.allContractTypes')}</option>
              {contractTypes.map(contractType => (
                <option key={contractType} value={contractType}>{contractType}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {t('home.showingProjects')
              .replace('{filtered}', filteredProjects.length.toString())
              .replace('{total}', projects.length.toString())}
          </div>
          <div className="space-x-2">
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              {t('projects.clearFilters')}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="mb-8">
        <div>
          <div className="mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Dashboard - Projects by Ministry Pie Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('home.projectsByMinistry')}
                  </h2>
                </div>
                <div className="h-80">
                  {Object.keys(ministryCounts).length > 0 ? (
                    <Doughnut data={ministryChartData} options={pieChartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      {t('home.noDataAvailable')}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Dashboard - Budget Distribution Bar Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('home.budgetDistribution')}
                  </h2>
                </div>
                <div className="h-80">
                  {projects.length > 0 ? (
                    <Bar data={budgetChartData} options={barChartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      {t('home.noDataAvailable')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Thailand Map */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('home.exploreMap')}
          </h2>
          <ThailandMap />
        </div>

        {/* Top 10 Projects */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('home.topProjects')}
          </h2>
          {error ? (
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
          ) : latestProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('home.noProjects')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('home.noProjectsDesc')}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('projects.projectName')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {latestProjects
                      .filter((p) => !!p?.id)
                      .map((project) => (
                        <tr
                          key={project.id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          onClick={() => project.id && router.push(`/view/${project.id}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              <Link href={`/view/${project.id}`} className="hover:text-chula-pink">
                                {project.title || 'N/A'}
                              </Link>
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.publicAuthority?.name && (
                                <div className="mb-1">
                                  <span className="font-medium">{t('home.projectOwner')}:</span> {project.publicAuthority.name}
                                </div>
                              )}
                              {project.parties && project.parties.length > 0 && (
                                <div>
                                  <span className="font-medium">{t('home.privateContractor')}:</span>{' '}
                                  {project.parties
                                    .filter(party => party.roles && party.roles.includes('contractor'))
                                    .map(party => party.name)
                                    .join(', ') || 'N/A'}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Projects Grid */}
      {filteredProjects.length > 10 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('home.title')}
            </h2>
            <Link
              href="/projects"
              className="text-chula-pink hover:text-chula-pink-dark font-medium transition-colors duration-200"
            >
              {t('nav.allProjects')} →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects && filteredProjects.length > 0 && filteredProjects.slice(10, 19).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
