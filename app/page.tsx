'use client'

import { useState, useEffect } from 'react'
import { ProjectData } from '@/types/project'
import ProjectCard from '@/components/ProjectCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import ThailandMap from '@/components/ThailandMap'
import { useLanguage } from '@/lib/LanguageContext'
import { fetchProjectsFromAPI } from '@/lib/projectService'
import Link from 'next/link'

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError('ไม่สามารถโหลดข้อมูลโครงการได้')
    } finally {
      setLoading(false)
    }
  }

  // Get top 10 projects by budget
  const topProjects = projects
    .sort((a, b) => b.budget.amount.amount - a.budget.amount.amount)
    .slice(0, 10)

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Hero Banner */}
      <div className="bg-white border-l-4 border-chula-pink shadow-lg mb-8">
        <div className="px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-chula-pink to-chula-pink-dark rounded-lg flex items-center justify-center mr-4 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                      {t('home.banner')}
                    </h1>
                    <div className="w-16 h-1 bg-chula-pink mt-2"></div>
                  </div>
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  {t('home.bannerSubtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/projects"
                    className="inline-flex items-center justify-center px-6 py-3 bg-chula-pink text-white font-medium rounded-md hover:bg-chula-pink-dark transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('nav.allProjects')}
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-chula-pink text-chula-pink font-medium rounded-md hover:bg-chula-pink-lighter transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {t('nav.projectsDashboard')}
                  </Link>
                </div>
              </div>
              
              {/* Right Content - Stats or Visual */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('home.projectStats')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-chula-pink">{projects.length}</div>
                    <div className="text-sm text-gray-600">{t('home.totalProjects')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {projects.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-600">{t('home.activeProjects')}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 text-center">
                    {t('home.lastUpdated')}: {new Date().toLocaleDateString(t('common.locale') || 'en-US')}
                  </div>
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
          ) : topProjects.length === 0 ? (
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
                    {topProjects.map((project) => (
                      <tr 
                        key={project.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => window.location.href = `/view/${project.id}`}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {project.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project.sector.join(', ')}
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
      {projects.length > 10 && (
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
            {projects.slice(10, 19).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
