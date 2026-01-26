'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProjectData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import { fetchProjectById } from '@/lib/projectService'
import { BUSINESS_GROUP_CODE_TO_DISPLAY_NAME, BUSINESS_GROUP_CODES } from '@/types/businessGroup'
import { formatDateForDisplay } from '@/lib/utils/dateUtils'

export default function ViewProjectClient() {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState<ProjectData | null>(null)
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  // Handle keyboard navigation - must be before early returns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return
      
      // Get project images for length check
      const images = project ? (() => {
        const imageUrls: string[] = []
        if (project.documents) {
          project.documents.forEach(doc => {
            if (doc.url && (doc.format?.toLowerCase().includes('image') || 
                doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
              imageUrls.push(doc.url)
            }
          })
        }
        return imageUrls.length > 0 ? imageUrls : [
          'https://ppp.sepo.go.th/uploads/images/eaec8cd7f22e580e0abf952212b29801.jpg',
          'https://ppp.sepo.go.th/uploads/images/6e61041f1444b08dbb633ccacc323c28.jpg'
        ]
      })() : []
      
      if (e.key === 'Escape') {
        setSelectedImageIndex(null)
      } else if (e.key === 'ArrowRight' && selectedImageIndex < images.length - 1) {
        setSelectedImageIndex(selectedImageIndex + 1)
      } else if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImageIndex, project])

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

  const formatDate = (dateString: string | undefined) => {
    return formatDateForDisplay(dateString)
  }

  const formatDuration = (days: number | undefined, months: number | undefined): string => {
    if (months !== undefined && months > 0) {
      // If months is available, convert to years and months
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      
      if (years > 0 && remainingMonths > 0) {
        return `${years} ปี ${remainingMonths} เดือน`
      } else if (years > 0) {
        return `${years} ปี`
      } else {
        return `${remainingMonths} เดือน`
      }
    }
    
    if (days !== undefined && days > 0) {
      // Convert days to years and months
      // Example: 365 days = 1 year, 60 days = 2 months
      const years = Math.floor(days / 365)
      const remainingDaysAfterYears = days % 365
      const months = Math.floor(remainingDaysAfterYears / 30)
      
      if (years > 0 && months > 0) {
        return `${years} ปี ${months} เดือน`
      } else if (years > 0) {
        return `${years} ปี`
      } else if (months > 0) {
        return `${months} เดือน`
      } else {
        return `${days} วัน`
      }
    }
    
    return 'N/A'
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

  const ministryName = project.additionalClassifications?.find(c => c.scheme === 'TH-MINISTRY')?.description || 'N/A'
  const privateContractors = project.parties?.filter(party => party.roles && party.roles.includes('contractor')).map(party => party.name).join(', ') || 'N/A'

  // Get businessGroup display name and code from sector array
  const getBusinessGroupInfo = (): { name: string; number: number | null } => {
    if (!project.sector || !Array.isArray(project.sector)) return { name: 'N/A', number: null }
    
    // Find the first sector code that matches a business group code
    for (const sectorItem of project.sector) {
      const sectorCode = typeof sectorItem === 'string' ? sectorItem : (sectorItem?.id || '')
      if (sectorCode && BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[sectorCode as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME]) {
        const businessGroupCode = sectorCode as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME
        const displayName = BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[businessGroupCode]
        const number = BUSINESS_GROUP_CODES.indexOf(businessGroupCode) + 1
        return { name: displayName, number }
      }
    }
    return { name: 'N/A', number: null }
  }

  const businessGroupInfo = getBusinessGroupInfo()
  const businessGroupName = businessGroupInfo.number 
    ? `${businessGroupInfo.number}. ${businessGroupInfo.name}`
    : businessGroupInfo.name

  // Get contractType from additionalClassifications
  const getContractType = (): string => {
    if (!project.additionalClassifications || !Array.isArray(project.additionalClassifications)) {
      return 'N/A'
    }
    
    const contractTypeClassification = project.additionalClassifications.find(
      c => c?.scheme === 'รูปแบบการจัดสรรกรรมสิทธิ์'
    )
    return contractTypeClassification?.description || 'N/A'
  }

  const contractTypeName = getContractType()

  // Get concessionForm from additionalClassifications
  const getConcessionForm = (): string => {
    if (!project.additionalClassifications || !Array.isArray(project.additionalClassifications)) {
      return 'N/A'
    }
    
    const concessionFormClassification = project.additionalClassifications.find(
      c => c?.scheme === 'รูปแบบสัมปทานหรือค่าตอบแทน'
    )
    return concessionFormClassification?.description || 'N/A'
  }

  const concessionFormName = getConcessionForm()

  // Get related laws from policyAlignment
  const getRelatedLaws = (): string => {
    if (project.policyAlignment && typeof project.policyAlignment === 'object') {
      return project.policyAlignment.description || 'N/A'
    }
    return 'N/A'
  }

  const relatedLawsName = getRelatedLaws()

  // Get investment scope from additionalClassifications
  const getInvestmentScope = (): string => {
    if (!project.additionalClassifications || !Array.isArray(project.additionalClassifications)) {
      return 'N/A'
    }
    
    const investmentScopeClassification = project.additionalClassifications.find(
      c => c?.scheme === 'ขอบเขตการลุงทุน'
    )
    return investmentScopeClassification?.description || 'N/A'
  }

  const investmentScopeName = getInvestmentScope()

  // Extract image URLs from project data or use example URLs
  const getProjectImages = (): string[] => {
    // Try to get images from documents with image formats
    const imageUrls: string[] = []
    
    if (project.documents) {
      project.documents.forEach(doc => {
        if (doc.url && (doc.format?.toLowerCase().includes('image') || 
            doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
          imageUrls.push(doc.url)
        }
      })
    }
    
    // If no images found, use example URLs as fallback
    if (imageUrls.length === 0) {
      return [
        'https://ppp.sepo.go.th/uploads/images/eaec8cd7f22e580e0abf952212b29801.jpg',
        'https://ppp.sepo.go.th/uploads/images/6e61041f1444b08dbb633ccacc323c28.jpg'
      ]
    }
    
    return imageUrls
  }

  const projectImages = getProjectImages()
  const hasMultipleImages = projectImages.length > 1

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  const handleCloseModal = () => {
    setSelectedImageIndex(null)
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImageIndex !== null && selectedImageIndex < projectImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{project.title}</h1>
            </div>
            <div className="flex space-x-3 flex-shrink-0">
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

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3 items-start min-w-0">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 min-w-0 w-full">
          {/* Main Information Card */}
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 w-full">
            <h2 className="text-lg font-medium text-black mb-4">{t('pages.view.basicInfo')}</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
              {/* Business Group, Ministry, Project Duration in same line */}
              <div>
                <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.businessGroup')}</dt>
                <dd className="mt-1">
                  <span className="inline-block px-3 py-1 rounded-md text-base font-medium bg-blue-100 text-blue-800 break-words">
                    {businessGroupName}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.ministry')}</dt>
                <dd className="mt-1">
                  <span className="inline-block px-3 py-1 rounded-md text-base font-medium bg-blue-100 text-blue-800 break-words">
                    {ministryName}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.projectDuration')}</dt>
                <dd className="mt-1">
                  <span className="inline-block px-3 py-1 rounded-md text-base font-medium bg-blue-100 text-blue-800 break-words">
                    {formatDuration(project.period?.durationInDays, project.period?.durationInMonths)}
                  </span>
                </dd>
              </div>
              {/* Public Authority with blue highlight */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.publicAuthority')}</dt>
                <dd className="mt-1">
                  <span className="inline-block px-3 py-1 rounded-md text-base font-medium bg-blue-100 text-blue-800 break-words">
                    {project.publicAuthority?.name || 'N/A'}
                  </span>
                </dd>
              </div>
              {/* Private Contractor with blue highlight */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.privateContractor')}</dt>
                <dd className="mt-1">
                  <span className="inline-block px-3 py-1 rounded-md text-base font-medium bg-blue-100 text-blue-800 break-words">
                    {privateContractors}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Additional Information Toggle */}
          <div className="bg-white shadow rounded-lg overflow-hidden w-full">
            <button
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-medium text-gray-900">
                {t('pages.view.additionalInfo')}
              </h2>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showAdditionalInfo ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out ${showAdditionalInfo ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 sm:px-6 pb-6 border-t border-gray-200">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 mt-6">
                  {/* Project Details moved here */}
                  <div>
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.lastUpdated')}</dt>
                    <dd className="mt-1 text-base text-gray-900 break-words">{formatDate(project.updated)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.locations')}</dt>
                    <dd className="mt-1 text-base text-gray-900 break-words">
                      {project.locations?.map(loc => loc.description || loc.id).join(', ') || 'N/A'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.projectType')}</dt>
                    <dd className="mt-1 text-base text-gray-900 break-words">{project.type || 'N/A'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.purpose')}</dt>
                    <dd className="mt-1 text-base text-gray-900 break-words whitespace-pre-line">{project.purpose || 'N/A'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.projectDescription')}</dt>
                    <dd className="mt-1 text-base text-gray-900 break-words whitespace-pre-line">{project.description || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.contractSigningDate')}</dt>
                    <dd className="mt-1 text-base text-gray-900">{formatDate(project.period?.startDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.constructionStartDate')}</dt>
                    <dd className="mt-1 text-base text-gray-900">{formatDate(project.implementationPeriod?.startDate || '')}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.concessionStartDate')}</dt>
                    <dd className="mt-1 text-base text-gray-900">{formatDate(project.period?.startDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.concessionEndDate')}</dt>
                    <dd className="mt-1 text-base text-gray-900">{formatDate(project.period?.endDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.serviceStartDate')}</dt>
                    <dd className="mt-1 text-base text-gray-900">{formatDate(project.maintenancePeriod?.startDate || '')}</dd>
                  </div>
                  {project.milestones && project.milestones.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.contractAmendments')}</dt>
                      <dd className="mt-1 text-base text-gray-900">
                        <div className="space-y-2">
                          {project.milestones
                            .filter((milestone: any) => milestone.type === 'contractAmendment' || milestone.code === 'contractAmendment')
                            .map((milestone: any, index: number) => (
                              <div key={index}>
                                {t('pages.view.contractAmendmentDate').replace('{n}', (index + 1).toString())}: {formatDate(milestone.dateMet || milestone.dueDate || '')}
                              </div>
                            ))}
                          {project.milestones.filter((milestone: any) => milestone.type === 'contractAmendment' || milestone.code === 'contractAmendment').length === 0 && 'N/A'}
                        </div>
                      </dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.totalProjectValue')}</dt>
                    <dd className="mt-1 text-base text-gray-900 break-words">
                      {formatCurrency(project.budget?.amount?.amount ?? 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.contractType')}</dt>
                    <dd className="mt-1 text-base text-gray-900 break-words">{contractTypeName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.concessionForm')}</dt>
                    <dd className="mt-1 text-base text-gray-900 break-words">{concessionFormName}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-bold text-black opacity-100">กฎหมายที่เกี่ยวข้อง</dt>
                    <dd className="mt-1 text-base text-gray-900 break-words whitespace-pre-line">{relatedLawsName}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-bold text-black opacity-100">{t('pages.view.investmentScope')} (ภาครัฐและภาคเอกชน)</dt>
                    <dd className="mt-1 text-base text-gray-900 break-words whitespace-pre-line">{investmentScopeName}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:space-y-8 min-w-0 w-full">
          {/* Project Images - Thumbnail View */}
          {projectImages.length > 0 && (
            <div className="w-full">
              <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group" onClick={() => handleImageClick(0)}>
                <img
                  src={projectImages[0]}
                  alt={`Project Image 1`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                {/* Indicator for multiple images */}
                {hasMultipleImages && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {projectImages.length} {t('pages.view.images') || 'images'}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Data Source from Identifiers (sourceURL) */}
          {project.identifiers && project.identifiers.some((ident) => ident?.scheme === 'sourceURL' && ident?.id) && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 w-full">
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
                    className="inline-flex items-start text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="break-all">{ident.id}</span>
                  </a>
                ))}
            </div>
          </div>
          )}

          {/* Data Source */}
          {project.documents && project.documents.length > 0 && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages.view.dataSource')}</h2>
            <div className="space-y-2">
              {project.documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                >
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="break-all">{doc.title || doc.id}</span>
                </a>
              ))}
            </div>
          </div>
          )}

        
        </div>
      </div>
      </div>

      {/* Image Modal/Popup - Outside sidebar for proper positioning */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={handleCloseModal}
        >
          {/* Close button */}
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {selectedImageIndex > 0 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {selectedImageIndex < projectImages.length - 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image counter */}
          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-60 px-4 py-2 rounded-md text-sm">
              {selectedImageIndex + 1} / {projectImages.length}
            </div>
          )}

          {/* Full image */}
          <div className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={projectImages[selectedImageIndex]}
              alt={`Project Image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
