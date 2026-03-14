'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import { ProjectFormData, ProjectData, Classification } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { fetchProjectById, updateProject } from '@/lib/projectService'
import { isValidBusinessGroupCode } from '@/types/businessGroup'
import Step1EssentialInfo from '@/components/form/Step1EssentialInfo'
import Step2AdditionalDetails from '@/components/form/Step2AdditionalDetails'
import Step3BudgetInfo from '@/components/form/Step3BudgetInfo'
import Step4LegalAndReference from '@/components/form/Step4LegalAndReference'
import Step5Risk from '@/components/form/Step5Risk'
import Step5Review from '@/components/form/Step5Review'
import LoadingSpinner from '@/components/LoadingSpinner'
import dayjs from 'dayjs'

const createFormDefaultValues = (): Partial<ProjectFormData> => ({
  title: '',
  description: '',
  status: '',
  period: { startDate: '', endDate: '' },
  identificationPeriod: { startDate: '', endDate: '' },
  preparationPeriod: { startDate: '', endDate: '' },
  implementationPeriod: { startDate: '', endDate: '' },
  completionPeriod: { startDate: '', endDate: '' },
  maintenancePeriod: { startDate: '', endDate: '' },
  decommissioningPeriod: { startDate: '', endDate: '' },
  type: '',
  purpose: '',
  sector: [],
  locations: [],
  publicAuthority: { name: '', id: '' },
  budget: { description: '', amount: { amount: 0, currency: 'THB' } },
  parties: [],
  documents: [],
  risks: [],
})

function projectToFormValues(project: ProjectData): any {
  return {
    title: project.title ?? '',
    description: project.description ?? '',
    status: project.status ?? '',
    period: project.period
      ? { startDate: project.period.startDate ?? '', endDate: project.period.endDate ?? '' }
      : { startDate: '', endDate: '' },
    identificationPeriod: project.identificationPeriod
      ? { startDate: project.identificationPeriod.startDate ?? '', endDate: project.identificationPeriod.endDate ?? '' }
      : { startDate: '', endDate: '' },
    preparationPeriod: project.preparationPeriod
      ? { startDate: project.preparationPeriod.startDate ?? '', endDate: project.preparationPeriod.endDate ?? '' }
      : { startDate: '', endDate: '' },
    implementationPeriod: project.implementationPeriod
      ? { startDate: project.implementationPeriod.startDate ?? '', endDate: project.implementationPeriod.endDate ?? '' }
      : { startDate: '', endDate: '' },
    completionPeriod: project.completionPeriod
      ? { startDate: project.completionPeriod.startDate ?? '', endDate: project.completionPeriod.endDate ?? '' }
      : { startDate: '', endDate: '' },
    maintenancePeriod: project.maintenancePeriod
      ? { startDate: project.maintenancePeriod.startDate ?? '', endDate: project.maintenancePeriod.endDate ?? '' }
      : { startDate: '', endDate: '' },
    decommissioningPeriod: project.decommissioningPeriod
      ? { startDate: project.decommissioningPeriod.startDate ?? '', endDate: project.decommissioningPeriod.endDate ?? '' }
      : { startDate: '', endDate: '' },
    type: project.type ?? '',
    purpose: project.purpose ?? '',
    sector: Array.isArray(project.sector)
      ? project.sector
          .map((c) => (typeof c === 'object' && c !== null ? c.id : String(c)))
          .filter(Boolean)
      : [],
    locations: project.locations ?? [],
    publicAuthority: project.publicAuthority ?? { name: '', id: '' },
    budget: project.budget ?? { description: '', amount: { amount: 0, currency: 'THB' } },
    parties: project.parties ?? [],
    documents: project.documents ?? [],
    additionalClassifications: project.additionalClassifications ?? [],
    risks: project.risks ?? [],
    policyAlignment: project.policyAlignment ?? undefined,
  }
}

export default function EditProjectClient() {
  const { t } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [currentStep, setCurrentStep] = useState(1)
  const [step1ValidationAttempted, setStep1ValidationAttempted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [project, setProject] = useState<ProjectData | null>(null)
  const submitButtonClicked = useRef(false)

  const { register, handleSubmit, control, formState: { errors }, trigger, setValue, getValues, reset } = useForm<ProjectFormData>({
    defaultValues: createFormDefaultValues() as ProjectFormData,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const found = await fetchProjectById(projectId)
        if (found) {
          setProject(found)
          reset(projectToFormValues(found) as ProjectFormData)
        } else {
          router.push('/')
        }
      } catch (err) {
        console.error('Error fetching project:', err)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [projectId, reset, router])

  const handleNext = async () => {
    setSubmitStatus('idle')
    if (currentStep === 1) {
      setStep1ValidationAttempted(true)
      // const isValid = await trigger(['title', 'sector', 'type', 'parties', 'additionalClassifications'])
      const isValid = await trigger(['title', 'parties', 'additionalClassifications'])
      if (isValid) {
        setCurrentStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (currentStep === 2) {
      setCurrentStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentStep === 3) {
      const isValid = await trigger(['budget.amount.amount'])
      if (isValid) {
        setCurrentStep(4)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (currentStep === 4) {
      const isValid = await trigger(['documents'])
      if (isValid) {
        setCurrentStep(5)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (currentStep === 5) {
      const risks = getValues('risks')
      if (risks && risks.length > 0) {
        const isValid = await trigger(['risks'])
        if (isValid) {
          setCurrentStep(6)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        setCurrentStep(6)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handleBack = () => {
    setSubmitStatus('idle')
    if (currentStep === 6) {
      setCurrentStep(5)
    } else if (currentStep === 5) {
      setCurrentStep(4)
    } else if (currentStep === 4) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(1)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    if (currentStep !== 6 || !submitButtonClicked.current) {
      submitButtonClicked.current = false
      return
    }
    submitButtonClicked.current = false
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      if (data.period?.startDate && data.period?.endDate) {
        const startDate = dayjs(data.period.startDate).toDate()
        const endDate = dayjs(data.period.endDate).toDate()
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const timeDiff = endDate.getTime() - startDate.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
          data.period.durationInDays = daysDiff > 0 ? daysDiff : 0
        }
      }

      const sector: Classification[] = Array.isArray(data.sector)
        ? data.sector
            .filter((s) => s)
            .map((s) => {
              const code =
                typeof s === 'string'
                  ? s
                  : s && typeof s === 'object'
                    ? (s as { id?: string }).id
                    : ''
              if (!code || !isValidBusinessGroupCode(code)) return null
              return {
                scheme: '',
                id: code,
                description: '',
              } as Classification
            })
            .filter((c): c is Classification => c !== null)
        : []

      const contractTypeClassification = Array.isArray(data.additionalClassifications)
        ? data.additionalClassifications.filter((c) => (typeof c === 'object' && c !== null ? c.scheme : '') === 'รูปแบบการจัดสรรกรรมสิทธิ์')
        : []
      const otherClassifications = Array.isArray(data.additionalClassifications)
        ? data.additionalClassifications
            .filter((c) => (typeof c === 'object' && c !== null ? c.scheme : '') !== 'รูปแบบการจัดสรรกรรมสิทธิ์')
            .map((c) => ({
              scheme: typeof c === 'object' && c !== null ? c.scheme ?? '' : '',
              id: typeof c === 'object' && c !== null ? c.id ?? '' : '',
              description: typeof c === 'object' && c !== null ? c.description ?? '' : '',
            }))
        : []
      const formattedContractTypeClassifications = contractTypeClassification.map((c) => ({
        scheme: 'รูปแบบการจัดสรรกรรมสิทธิ์',
        id: '',
        description: typeof c === 'object' && c !== null ? c.description ?? '' : '',
      }))
      const additionalClassifications = [...otherClassifications, ...formattedContractTypeClassifications]

      const allParties = Array.isArray(data.parties) ? data.parties : []
      const contractorParties = allParties
        .filter((p) => Array.isArray(p?.roles) && p.roles.includes('contractor') && !p.roles.includes('publicAuthority'))
        .map((p) => ({
          ...p,
          identifier: {
            scheme: '',
            legalName: p?.name ?? '',
            id: p?.id ?? '',
            uri: p?.identifier?.uri,
          },
        }))
      const otherParties = allParties.filter((p) => {
        const roles = Array.isArray(p?.roles) ? p.roles : []
        return !roles.includes('publicAuthority') && !roles.includes('contractor')
      })
      const existingPublicAuthorityParties = allParties.filter((p) => Array.isArray(p?.roles) && p.roles.includes('publicAuthority'))
      const publicAuthorityName = data.publicAuthority?.name ?? ''
      const publicAuthorityId = data.publicAuthority?.id ?? ''
      const publicAuthorityParty =
        existingPublicAuthorityParties.length > 0
          ? existingPublicAuthorityParties[0]
          : publicAuthorityName
            ? {
                name: publicAuthorityName,
                id: publicAuthorityId,
                identifier: undefined,
                additionalIdentifiers: undefined,
                address: undefined,
                contactPoint: undefined,
                roles: ['publicAuthority'] as string[],
                people: undefined,
                classifications: undefined,
                beneficialOwners: undefined,
              }
            : null
      const parties = publicAuthorityParty ? [publicAuthorityParty, ...contractorParties, ...otherParties] : [...contractorParties, ...otherParties]

      const risks = (data.risks ?? []).map((risk, idx) => ({
        risk_id: `RISK-${String(idx + 1).padStart(3, '0')}`,
        title: risk.title,
        phase: risk.phase,
        description: (risk.description ?? []).map((s) => s.trim()).filter(Boolean),
        category_drivers: risk.category_drivers ?? [],
        mitigation_handling: risk.mitigation_handling ?? [],
        impact_statement: (risk.impact_statement ?? []).map((s) => s.trim()).filter(Boolean),
      }))

      const projectData = {
        ...data,
        sector,
        additionalClassifications,
        parties,
        risks,
      }

      const updatedProject = await updateProject(projectId, projectData)
      if (updatedProject) {
        setSubmitStatus('success')
        setTimeout(() => router.push(`/view/${projectId}`), 2000)
      } else {
        setSubmitStatus('error')
      }
    } catch (err) {
      console.error('Error updating project:', err)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (!project) return null

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <div className={``}>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('pages.edit.title')}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">{t('pages.edit.subtitle')}</p>
          <div className="mt-6">
            <div className="flex items-start justify-between w-full">
              {[1, 2, 3, 4, 5, 6].map((step, index) => (
                <div key={step} className="flex items-start flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className="py-2 flex justify-center flex-shrink-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                          currentStep >= step ? 'bg-theme-primary text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step}
                      </div>
                    </div>
                    <span
                      className={`mt-1 text-xs text-center px-1 ${
                        currentStep >= step ? 'text-theme-primary font-medium' : 'text-gray-500'
                      }`}
                    >
                      {step === 1 && (t('pages.create.step1') || 'Essential')}
                      {step === 2 && 'ระยะเวลา'}
                      {step === 3 && 'งบประมาณ'}
                      {step === 4 && 'กฎหมาย'}
                      {step === 5 && 'ความเสี่ยง'}
                      {step === 6 && (t('pages.create.step3') || 'Review')}
                    </span>
                  </div>
                  {index < 5 && (
                    <div className="flex-1 flex items-center min-w-[8px] mx-1 h-10">
                      <div className={`w-full h-0.5 ${currentStep > step ? 'bg-theme-primary' : 'bg-gray-300'}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (currentStep === 6 && !isSubmitting) handleSubmit(onSubmit)(e)
          }}
          className="space-y-8"
          noValidate
        >
          {currentStep === 1 ? (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('pages.create.step1') || 'Essential Information'}</h2>
              <Step1EssentialInfo
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
                trigger={trigger}
                showAuthorityValidationErrors={step1ValidationAttempted}
              />
            </div>
          ) : currentStep === 2 ? (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">ระยะเวลาโครงการ</h2>
              <Step2AdditionalDetails
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
                trigger={trigger}
              />
            </div>
          ) : currentStep === 3 ? (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">ข้อมูลงบประมาณ</h2>
              <Step3BudgetInfo register={register} control={control} errors={errors} setValue={setValue} getValues={getValues} />
            </div>
          ) : currentStep === 4 ? (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">กฎหมายและอ้างอิง</h2>
              <Step4LegalAndReference register={register} control={control} errors={errors} setValue={setValue} getValues={getValues} />
            </div>
          ) : currentStep === 5 ? (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">ความเสี่ยง</h2>
              <Step5Risk register={register} control={control} errors={errors} setValue={setValue} />
            </div>
          ) : (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('pages.create.step3') || 'Review'}</h2>
              <Step5Review control={control} mode="edit" originalProject={project} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <button type="button" onClick={handleBack} className="btn-secondary w-full sm:w-auto">
                  {t('pages.create.back') || 'Back'}
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button type="button" onClick={() => router.push(`/view/${projectId}`)} className="btn-secondary w-full sm:w-auto">
                {t('common.cancel')}
              </button>
              {currentStep < 6 ? (
                <button type="button" onClick={handleNext} className="btn-primary w-full sm:w-auto">
                  {t('pages.create.next') || 'Next'}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                  onClick={(e) => {
                    submitButtonClicked.current = true
                    e.preventDefault()
                    e.stopPropagation()
                    if (currentStep === 6 && !isSubmitting && submitStatus !== 'success') handleSubmit(onSubmit)(e)
                    else submitButtonClicked.current = false
                  }}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isSubmitting ? t('common.updating') : (t('pages.edit.submit') || t('common.update'))}
                </button>
              )}
            </div>
          </div>

          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{t('pages.edit.success')}</p>
                </div>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{t('pages.edit.error')}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
