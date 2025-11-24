'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProjectData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'
import { fetchProjectsFromAPI } from '@/lib/projectService'
import LoadingSpinner from '@/components/LoadingSpinner'
import Link from 'next/link'
import Papa from 'papaparse'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    sector: '',
    search: '',
    ministry: '',
    businessGroup: '',
    contractType: ''
  })
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()

  const itemsPerPage = 20

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

  // Filter and search projects
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

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProjects = filteredProjects.slice(startIndex, endIndex)

  // Get unique values for filter options
  const sectors = useMemo(() => {
    const sectorSet = new Set<string>()
    projects.forEach(project => {
      if (project?.sector) {
        project.sector.forEach(sector => {
          if (sector) sectorSet.add(sector)
        })
      }
    })
    return Array.from(sectorSet).sort()
  }, [projects])

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
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setFilters({
      sector: '',
      search: '',
      ministry: '',
      businessGroup: '',
      contractType: ''
    })
    setCurrentPage(1)
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
    return <LoadingSpinner />
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('projects.title')}</h1>
            <p className="mt-2 text-gray-600">
              {t('projects.subtitle')}
            </p>
          </div>
          {isAuthenticated && (
            <Link
              href="/create"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {t('projects.createProject')}
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search projects..."
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
              <option value="">All Business Groups</option>
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
              <option value="">All Ministries</option>
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
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
          <div className="space-x-2">
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              {t('projects.clearFilters')}
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {t('projects.exportCSV')}
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects.projectName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects.ministry')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects.publicAuthority')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects.privateContractor')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
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
                    <Link
                      href={`/view/${project.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      {t('common.view')}
                    </Link>
                    {isAuthenticated && (
                      <Link
                        href={`/edit/${project.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        {t('common.edit')}
                      </Link>
                    )}
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
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
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
    </div>
  )
}
