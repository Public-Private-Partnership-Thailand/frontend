'use client'

import { useState, useEffect } from 'react'
import { ProjectData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { fetchProjectsFromAPI } from '@/lib/projectService'
import { getChartColorArray } from '@/lib/themeUtils'
import LoadingSpinner from '@/components/LoadingSpinner'
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
  LineElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const { t } = useLanguage()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProjectsFromAPI()
      setProjects(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError(t('dashboard.errorMessage'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('dashboard.error')}</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={fetchProjects}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('dashboard.retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate comprehensive statistics
  const totalProjects = projects.length
  const totalInvestment = projects.reduce((sum, project) => sum + (project.budget?.amount?.amount ?? 0), 0)
  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  
  // Calculate average project duration
  const avgDuration = projects.length > 0 
    ? projects.reduce((sum, project) => sum + (project.period?.durationInMonths || 0), 0) / projects.length
    : 0

  // Projects by sector
  const sectorCounts = projects.reduce((acc, project) => {
    project.sector.forEach((sector) => {
      const sectorKey =
        typeof sector === 'string'
          ? sector
          : (sector as { id?: string; description?: string }).id ||
            (sector as { id?: string; description?: string }).description ||
            'unknown'
      acc[sectorKey] = (acc[sectorKey] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  // Projects by ministry
  const ministryCounts = projects.reduce((acc, project) => {
    const ministry = project.publicAuthority.name
    if (ministry) {
      acc[ministry] = (acc[ministry] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Investment trends by year
  const investmentByYear = projects.reduce((acc, project) => {
    if (project.period?.startDate) {
      const year = new Date(project.period.startDate).getFullYear()
      if (year && year > 1990 && !isNaN(year)) {
        acc[year] = (acc[year] || 0) + (project.budget?.amount?.amount ?? 0)
      }
    }
    return acc
  }, {} as Record<number, number>)

  const sortedYears = Object.keys(investmentByYear).sort()
  const investmentData = sortedYears.map(year => investmentByYear[parseInt(year)])

  // Cost by year (budget used each year across all projects)
  const costByYear = projects.reduce((acc, project) => {
    if (project.period?.startDate) {
      const year = new Date(project.period.startDate).getFullYear()
      const budgetAmount = project.budget?.amount?.amount ?? 0
      if (year && year > 1990 && !isNaN(year) && budgetAmount > 0) {
        acc[year] = (acc[year] || 0) + budgetAmount
      }
    }
    return acc
  }, {} as Record<number, number>)

  const sortedCostYears = Object.keys(costByYear).sort()
  const costData = sortedCostYears.map(year => costByYear[parseInt(year)])

  // Get theme colors for charts
  const chartColors = getChartColorArray()
  const chartBorderColors = chartColors.map(color => {
    // Darken color for border (simple approach - you can enhance this)
    const hex = color.replace('#', '')
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 20)
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 20)
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 20)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  })

  // Chart configurations with enhanced styling
  const sectorChartData = {
    labels: Object.keys(sectorCounts),
    datasets: [
      {
        label: t('dashboard.projectsCount'),
        data: Object.values(sectorCounts),
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const ministryChartData = {
    labels: Object.keys(ministryCounts),
    datasets: [
      {
        label: t('dashboard.projectsCount'),
        data: Object.values(ministryCounts),
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const investmentTrendData = {
    labels: sortedYears,
    datasets: [
      {
        label: t('dashboard.millionBaht'),
        data: investmentData.map(value => value / 1000000),
        borderColor: chartColors[0],
        backgroundColor: chartColors[0] + '1A', // Add opacity
        tension: 0.4,
        fill: true,
        pointBackgroundColor: chartColors[0],
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  const costByYearData = {
    labels: sortedCostYears,
    datasets: [
      {
        label: t('dashboard.millionBaht'),
        data: costData.map(value => value / 1000000),
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} ${t('dashboard.millionBaht')}`
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return `${value} ${t('dashboard.millionBaht')}`
          }
        },
      },
      x: {
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{t('dashboard.title')}</h1>
              <p className="mt-2 text-lg text-gray-600">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {t('dashboard.lastUpdated')}: {lastUpdated.toLocaleString(t('common.locale'))}
              </div>
              <button
                onClick={fetchProjects}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('dashboard.refresh')}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('dashboard.totalProjects')}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {totalProjects.toLocaleString(t('common.locale'))}
                    </dd>
                    <dd className="text-xs text-gray-400">
                      {t('dashboard.projectsCount')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('dashboard.totalInvestment')}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      ฿{(totalInvestment / 1000000000).toFixed(1)}B
                    </dd>
                    <dd className="text-xs text-gray-400">
                      {t('dashboard.thaiBaht')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('dashboard.activeProjects')}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {activeProjects.toLocaleString(t('common.locale'))}
                    </dd>
                    <dd className="text-xs text-gray-400">
                      {((activeProjects / totalProjects) * 100).toFixed(1)}% {t('dashboard.ofTotal')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('dashboard.averageDuration')}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {(avgDuration / 12).toFixed(1)} {t('dashboard.years')}
                    </dd>
                    <dd className="text-xs text-gray-400">
                      {t('dashboard.perProject')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Projects by Sector */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {t('dashboard.projectsBySector')}
              </h3>
              <div className="text-sm text-gray-500">
                {Object.keys(sectorCounts).length} {t('dashboard.projectsCount')}
              </div>
            </div>
            <div className="h-80">
              <Bar data={sectorChartData} options={chartOptions} />
            </div>
          </div>

          {/* Projects by Ministry */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {t('dashboard.projectsByMinistry')}
              </h3>
              <div className="text-sm text-gray-500">
                {Object.keys(ministryCounts).length} {t('dashboard.ministriesCount')}
              </div>
            </div>
            <div className="h-80">
              <Bar data={ministryChartData} options={chartOptions} />
            </div>
          </div>

          {/* Investment Trends */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {t('dashboard.investmentTrends')}
              </h3>
              <div className="text-sm text-gray-500">
                {sortedYears.length} {t('dashboard.yearsCount')}
              </div>
            </div>
            <div className="h-80">
              <Line data={investmentTrendData} options={lineOptions} />
            </div>
          </div>

          {/* Cost by Year */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {t('dashboard.costByYear')}
              </h3>
              <div className="text-sm text-gray-500">
                {sortedCostYears.length} {t('dashboard.yearsCount')}
              </div>
            </div>
            <div className="h-80">
              <Bar data={costByYearData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Projects Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {t('dashboard.recentProjects')}
              </h3>
              <div className="text-sm text-gray-500">
                {t('dashboard.showingProjects').replace('{count}', Math.min(10, projects.length).toString()).replace('{total}', totalProjects.toString())}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('dashboard.projectName')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('dashboard.businessGroup')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('dashboard.ministry')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('dashboard.projectValue')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.slice(0, 10).map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {project.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('dashboard.projectId')}: {project.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {project.sector.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {project.publicAuthority.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {(project.budget?.amount?.amount ?? 0) > 0 
                          ? `฿${((project.budget?.amount?.amount ?? 0) / 1000000).toFixed(0)}M`
                          : 'N/A'
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {projects.length > 10 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-center">
                <a
                  href="/projects"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  {t('dashboard.viewAllProjects')} →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}