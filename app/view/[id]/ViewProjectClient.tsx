'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProjectData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import { fetchProjectById } from '@/lib/projectService'

export default function ViewProjectClient() {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState<ProjectData | null>(null)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const foundProject = await fetchProjectById(projectId)
      
      if (foundProject) {
        setProject(foundProject)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }


  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('pages.view.notFound')}</h3>
        <p className="mt-1 text-sm text-gray-500">{t('pages.view.notFoundDesc')}</p>
        <div className="mt-6">
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <p className="mt-2 text-gray-600">{project.description}</p>
          </div>
          <div className="flex space-x-3">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => router.push(`/edit/${project.id}`)}
                  className="btn-secondary"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn-secondary"
                >
                  {t('common.print')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages.view.basicInfo')}</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('pages.view.type')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('dashboard.businessGroup')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.businessGroup || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('dashboard.ministry')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.ministry || project.publicAuthority?.name || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">{t('pages.view.purpose')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.purpose}</dd>
              </div>
            </dl>
          </div>

          {/* Budget Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages.view.budget')}</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('pages.view.totalBudget')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatCurrency(project.budget?.amount?.amount ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('pages.view.currency')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {project.budget?.amount?.currency ?? 'THB'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">{t('pages.view.budgetDescription')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {project.budget?.description ?? ''}
                </dd>
              </div>
            </dl>
          </div>

          {/* Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages.view.timeline')}</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('pages.view.startDate')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(project.period.startDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('pages.view.endDate')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(project.period.endDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('pages.view.duration')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {project.period.durationInMonths 
                    ? `${project.period.durationInMonths} ${t('pages.view.months')}` 
                    : project.period.durationInDays 
                    ? `${Math.round(project.period.durationInDays / 30)} ${t('pages.view.months')}`
                    : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Parties */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages.view.parties')}</h2>
            <div className="space-y-4">
              {project.parties.map((party, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900">{party.name}</h3>
                  {party.identifier?.legalName && (
                    <p className="text-sm text-gray-500 mt-1">{party.identifier.legalName}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {party.roles?.map((role, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {role}
                      </span>
                    ))}
                  </div>
                  {party.additionalIdentifiers && party.additionalIdentifiers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {party.additionalIdentifiers.map((identifier, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {identifier.legalName || identifier.id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Project Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages.view.projectDetails')}</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('pages.view.lastUpdated')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(project.updated)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('pages.view.locations')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {project.locations?.map(loc => loc.description || loc.id).join(', ') || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Data Source from Identifiers (sourceURL) */}
          {project.identifiers && project.identifiers.some((ident) => ident?.scheme === 'sourceURL' && ident?.id) && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages.view.dataSource')}</h2>
            <div className="space-y-2">
              {project.identifiers
                .filter((ident) => ident?.scheme === 'sourceURL' && ident?.id)
                .map((ident, index) => (
                  <a
                    key={index}
                    href={ident.id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline block"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {ident.id}
                  </a>
                ))}
            </div>
          </div>
          )}

          {/* Data Source */}
          {project.documents && project.documents.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages.view.dataSource')}</h2>
            <div className="space-y-2">
              {project.documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline block"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {doc.title || doc.id}
                </a>
              ))}
            </div>
          </div>
          )}

        
        </div>
      </div>
    </div>
  )
}
