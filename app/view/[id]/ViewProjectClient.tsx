'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProjectData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/lib/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import { fetchProjectById } from '@/lib/projectService'
import { BUSINESS_GROUP_CODE_TO_DISPLAY_NAME } from '@/types/businessGroup'
import { formatDateForDisplay } from '@/lib/utils/dateUtils'
import { useInfo } from '@/app/hooks/useInfo'
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
  const [expandedRiskIndices, setExpandedRiskIndices] = useState<Set<number>>(new Set())

  const { data: infoData } = useInfo()
  const riskCategories = infoData?.riskCategory ?? []
  const riskFactors = infoData?.riskFactor ?? []

  useEffect(() => {
    fetchProject()
  }, [projectId])

  // Handle keyboard navigation - must be before early returns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return
      
      // Get project images from documents where documentType === 'image'
      const images = project?.documents
        ? project.documents
            .filter((doc: any) => doc.documentType === 'image' && doc.url)
            .map((doc: any) => doc.url)
        : []
      
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

  // Timeline phases in order; current phase is where today falls within [start, end]
  const PHASES = [
    { key: 'identification', label: 'เริ่มต้นโครงการ', getStart: (p: ProjectData) => p.identificationPeriod?.startDate, getEnd: (p: ProjectData) => p.identificationPeriod?.endDate },
    { key: 'preparation', label: 'เตรียมการ', getStart: (p: ProjectData) => p.preparationPeriod?.startDate, getEnd: (p: ProjectData) => p.preparationPeriod?.endDate },
    { key: 'implementation', label: 'ก่อสร้าง', getStart: (p: ProjectData) => p.implementationPeriod?.startDate, getEnd: (p: ProjectData) => p.implementationPeriod?.endDate },
    { key: 'completion', label: 'ส่งมอบ', getStart: (p: ProjectData) => p.completionPeriod?.startDate, getEnd: (p: ProjectData) => p.completionPeriod?.endDate },
    { key: 'maintenance', label: 'บำรุงรักษา', getStart: (p: ProjectData) => p.maintenancePeriod?.startDate, getEnd: (p: ProjectData) => p.maintenancePeriod?.endDate },
    { key: 'decommissioning', label: 'สิ้นสุดโครงการ', getStart: (p: ProjectData) => p.decommissioningPeriod?.startDate, getEnd: (p: ProjectData) => p.decommissioningPeriod?.endDate },
  ] as const

  // Helper: true when period has startDate and today is within [start, end]
  const isTodayInPeriod = (startStr: string | undefined, endStr: string | undefined): boolean => {
    if (!startStr) return false
    const start = new Date(startStr)
    start.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (today < start) return false
    if (!endStr) return true
    const end = new Date(endStr)
    end.setHours(0, 0, 0, 0)
    return today <= end
  }

  const getCurrentPhaseIndex = (proj: ProjectData | null): number => {
    if (!proj) return 5
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Phase 6: period now > endDate, or decommissioningPeriod has startDate and today in range
    const periodEndStr = proj.period?.endDate
    if (periodEndStr) {
      const periodEnd = new Date(periodEndStr)
      periodEnd.setHours(0, 0, 0, 0)
      if (periodEnd < today) return 6
    }
    if (isTodayInPeriod(proj.decommissioningPeriod?.startDate, proj.decommissioningPeriod?.endDate)) return 6
    // Phase 5: maintenancePeriod has startDate and today in range
    if (isTodayInPeriod(proj.maintenancePeriod?.startDate, proj.maintenancePeriod?.endDate)) return 5
    // Phase 4: completionPeriod has startDate and today in range
    if (isTodayInPeriod(proj.completionPeriod?.startDate, proj.completionPeriod?.endDate)) return 4
    // Phase 3: implementationPeriod has startDate and today in range
    if (isTodayInPeriod(proj.implementationPeriod?.startDate, proj.implementationPeriod?.endDate)) return 3
    // Phase 2: preparationPeriod has startDate and today in range
    if (isTodayInPeriod(proj.preparationPeriod?.startDate, proj.preparationPeriod?.endDate)) return 2
    // Phase 1: identificationPeriod has startDate and today in range
    if (isTodayInPeriod(proj.identificationPeriod?.startDate, proj.identificationPeriod?.endDate)) return 1
    // Default when no period contains today
    return 5
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
  // กระทรวงเจ้าสังกัด: all legalName from parties[].additionalIdentifiers[]
  const ministryLegalNames = project.parties?.flatMap(party => party.additionalIdentifiers ?? []).map(ai => ai.legalName).filter((name): name is string => Boolean(name)) ?? []
  // เอกชนคู่สัญญา: from parties[index].identifier.legalName (comma-separated per party)
  const privateContractors = (project.parties ?? [])
    .flatMap(party => {
      const legalName = party.identifier?.legalName ?? ''
      return legalName ? legalName.split(',').map(s => s.trim()).filter(Boolean) : []
    })
    .join(', ') || 'N/A'

  // Get businessGroup display name from sector array
  const getBusinessGroupInfo = (): { name: string } => {
    if (!project.sector || !Array.isArray(project.sector)) return { name: 'N/A' }
    for (const sectorItem of project.sector) {
      const sectorCode = typeof sectorItem === 'string' ? sectorItem : (sectorItem?.id || '')
      if (sectorCode && BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[sectorCode as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME]) {
        const businessGroupCode = sectorCode as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME
        return { name: BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[businessGroupCode] }
      }
    }
    return { name: 'N/A' }
  }

  const businessGroupInfo = getBusinessGroupInfo()
  const businessGroupName = businessGroupInfo.name

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

  // Image URLs from documents where documentType === 'image'
  const getProjectImages = (): string[] => {
    if (!project?.documents) return []
    return project.documents
      .filter((doc: any) => doc.documentType === 'image' && doc.url)
      .map((doc: any) => doc.url)
  }

  const projectImages = getProjectImages()
  const hasMultipleImages = projectImages.length > 1

  // Only show "reference" documents in the "แหล่งข้อมูล" section.
  const referenceDocuments = (project.documents ?? []).filter(
    (doc: any) => doc.documentType === 'reference' && doc.url
  )

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

          {/* Timeline Phase (like create page step indicator) */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Timeline Phase</h3>
            <div className="flex items-start justify-between w-full overflow-x-auto pb-2">
              {PHASES.map((phase, index) => {
                const step = index + 1
                const currentPhase = getCurrentPhaseIndex(project)
                const isActive = currentPhase >= step
                const isCurrent = currentPhase === step
                return (
                  <div key={phase.key} className="flex items-start flex-1 min-w-0">
                    <div className="flex flex-col items-center flex-none w-24 min-w-0">
                      <div className="py-2 flex justify-center flex-shrink-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                            isCurrent ? 'bg-theme-primary text-white ring-2 ring-theme-primary ring-offset-2' : isActive ? 'bg-theme-primary text-white' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {step}
                        </div>
                      </div>
                      <span
                        className={`mt-1.5 text-xs text-center px-0.5 w-full break-words ${isCurrent ? 'text-theme-primary font-semibold' : isActive ? 'text-theme-primary font-medium' : 'text-gray-500'}`}
                        title={phase.label}
                      >
                        {phase.label}
                      </span>
                    </div>
                    {index < PHASES.length - 1 && (
                      <div className="flex-1 flex items-center min-w-[8px] mx-0.5 h-11">
                        <div className={`w-full h-0.5 ${currentPhase > step ? 'bg-theme-primary' : 'bg-gray-300'}`} />
                      </div>
                    )}
                  </div>
                )
              })}
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
                    {ministryLegalNames.length > 0 ? ministryLegalNames.join(', ') : 'N/A'}
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
                      {project.budget?.amount?.amountFormatted ?? formatCurrency(project.budget?.amount?.amount ?? 0)}
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

          {/* Risks */}
          {(() => {
            const risks = project.risks ?? []
            if (risks.length === 0) {
              return (
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 w-full">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">ความเสี่ยง (Risks)</h2>
                    <span className="text-sm text-gray-400">0 รายการ</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">ไม่มีข้อมูลความเสี่ยงสำหรับโครงการนี้</p>
                    <p className="text-xs text-gray-400 mt-1">No risks have been recorded for this project</p>
                  </div>
                </div>
              )
            }

            const PHASE_META: Record<string, { label: string; cls: string }> = {
              'pre-construction': { label: 'ก่อนก่อสร้าง', cls: 'bg-violet-100 text-violet-700' },
              construction:       { label: 'ก่อสร้าง',       cls: 'bg-blue-100 text-blue-700' },
              operation:          { label: 'ดำเนินการ',        cls: 'bg-emerald-100 text-emerald-700' },
            }
            const MITIGATION_META: Record<string, { label: string; icon: string; cls: string }> = {
              planned:          { label: 'วางแผน',          icon: '○', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
              in_progress:      { label: 'กำลังดำเนินการ',   icon: '◑', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
              done_or_selected: { label: 'ดำเนินการแล้ว',    icon: '●', cls: 'bg-green-50 text-green-700 border-green-200' },
              rejected:         { label: 'ไม่ดำเนินการ',     icon: '✕', cls: 'bg-red-50 text-red-700 border-red-200' },
            }

            const toggleRiskExpand = (index: number) => {
              setExpandedRiskIndices(prev => {
                const next = new Set(prev)
                if (next.has(index)) next.delete(index)
                else next.add(index)
                return next
              })
            }

            return (
              <div className="bg-white shadow rounded-lg p-4 sm:p-6 w-full">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-gray-900">ความเสี่ยง (Risks)</h2>
                  <span className="text-sm text-gray-500">{risks.length} รายการ</span>
                </div>

                <div className="space-y-6">
                  {risks.map((risk, riskIndex) => {
                    const phaseMeta = PHASE_META[risk.phase] ?? { label: risk.phase, cls: 'bg-gray-100 text-gray-600' }
                    const isExpanded = expandedRiskIndices.has(riskIndex)
                    const hasDetails = Boolean(
                      (risk.description?.length) ||
                      (risk.category_drivers?.length) ||
                      (risk.mitigation_handling?.length) ||
                      (risk.impact_statement?.length)
                    )

                    return (
                      <div key={risk.risk_id ?? riskIndex} className="rounded-xl border border-gray-200 overflow-hidden">

                        {/* ── Header: number, title, phase (always visible); click to expand ── */}
                        <button
                          type="button"
                          onClick={() => hasDetails && toggleRiskExpand(riskIndex)}
                          className={`w-full text-left bg-gray-50 px-4 py-3 border-b border-gray-200 ${hasDetails ? 'cursor-pointer hover:bg-gray-100 transition-colors' : 'cursor-default'}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-theme-primary/10 text-theme-primary text-xs font-bold flex items-center justify-center">
                              {riskIndex + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5">
                                {risk.title}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${phaseMeta.cls}`}>
                                {phaseMeta.label}
                              </span>
                            </div>
                            {hasDetails && (
                              <span className="flex-shrink-0 mt-0.5 text-gray-400 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : undefined }}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                        <div className="divide-y divide-gray-100">

                          {/* ── Description ── */}
                          {risk.description && risk.description.length > 0 && (
                            <div className="px-4 py-4">
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">รายละเอียด</p>
                              <ol className="space-y-2">
                                {risk.description.map((line, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                                    <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold flex items-center justify-center">
                                      {i + 1}
                                    </span>
                                    <span>{line}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* ── Category Drivers ── */}
                          {risk.category_drivers && risk.category_drivers.length > 0 && (
                            <div className="px-4 py-4">
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Risk Category Drivers</p>
                              <div className="space-y-3">
                                {risk.category_drivers.map((driver, dIdx) => {
                                  const catInfo = riskCategories.find(c => c.id === driver.risk_category_id)
                                  return (
                                    <div key={dIdx} className="rounded-lg border border-indigo-100 bg-indigo-50/40 overflow-hidden">
                                      {/* Category header */}
                                      <div className="px-3 py-2.5 border-b border-indigo-100 bg-indigo-50">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-theme-primary text-white tracking-wide">
                                            {driver.risk_category_code}
                                          </span>
                                          <span className="text-sm font-semibold text-gray-800">{driver.category_name}</span>
                                        </div>
                                        {catInfo?.description_th && (
                                          <p className="text-xs text-indigo-700/80 leading-relaxed pl-0.5">
                                            {catInfo.description_th}
                                          </p>
                                        )}
                                      </div>

                                      {/* Risk Factors */}
                                      {driver.driven_by_risk_factors && driver.driven_by_risk_factors.length > 0 && (
                                        <div className="px-3 py-2.5">
                                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Risk Factors</p>
                                          <div className="space-y-2">
                                            {driver.driven_by_risk_factors.map((factor, fIdx) => {
                                              const factorInfo = riskFactors.find(f => f.id === factor.risk_factor_id)
                                              return (
                                                <div key={fIdx} className="flex gap-2.5">
                                                  <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[11px] font-bold flex items-center justify-center">
                                                    {fIdx + 1}
                                                  </span>
                                                  <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 leading-snug">{factor.factor_name}</p>
                                                    {factorInfo?.description_th && (
                                                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{factorInfo.description_th}</p>
                                                    )}
                                                  </div>
                                                </div>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* ── Mitigation / Handling ── */}
                          {risk.mitigation_handling && risk.mitigation_handling.length > 0 && (
                            <div className="px-4 py-4">
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">มาตรการรับมือ</p>
                              <div className="space-y-2">
                                {risk.mitigation_handling.map((m, mIdx) => {
                                  const meta = MITIGATION_META[m.status] ?? { label: m.status, icon: '·', cls: 'bg-gray-50 text-gray-600 border-gray-200' }
                                  return (
                                    <div key={mIdx} className="flex items-start gap-2.5">
                                      <span className={`flex-shrink-0 mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${meta.cls}`}>
                                        <span>{meta.icon}</span>
                                        {meta.label}
                                      </span>
                                      <span className="text-sm text-gray-700 leading-relaxed">{m.action}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* ── Impact Statement ── */}
                          {risk.impact_statement && risk.impact_statement.length > 0 && (
                            <div className="px-4 py-4 bg-amber-50/30">
                              <p className="text-[11px] font-semibold text-amber-600/70 uppercase tracking-widest mb-2">ผลกระทบ (Impact)</p>
                              <ul className="space-y-1.5">
                                {risk.impact_statement.map((line, i) => (
                                  <li key={i} className="flex gap-2.5 text-sm text-gray-700 leading-relaxed">
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                    <span>{line}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

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
          {referenceDocuments.length > 0 && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pages.view.dataSource')}</h2>
            <div className="space-y-2">
              {referenceDocuments.map((doc, index) => (
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
