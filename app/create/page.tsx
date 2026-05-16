'use client'

import { useState, useRef } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { createProject } from '@/lib/projectService'
import { BUSINESS_GROUP_CODES, isValidBusinessGroupCode } from '@/types/businessGroup'
import Step1EssentialInfo from '@/components/form/Step1EssentialInfo'
import Step2AdditionalDetails from '@/components/form/Step2AdditionalDetails'
import Step3BudgetInfo from '@/components/form/Step3BudgetInfo'
import Step4LegalAndReference from '@/components/form/Step4LegalAndReference'
import Step5Risk from '@/components/form/Step5Risk'
import Step5Review from '@/components/form/Step5Review'
import { useInfo } from '@/app/hooks/useInfo'
import { serializeCategoryDriversForApi } from '@/lib/normalizeRiskCategoryDrivers'
import { expandRisksForApi } from '@/lib/riskPhasesForm'
import dayjs from 'dayjs'

export default function CreateProjectPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { isLoading: isInfoLoading } = useInfo()
  const [currentStep, setCurrentStep] = useState(1)
  const [step1ValidationAttempted, setStep1ValidationAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const submitButtonClicked = useRef(false)

  const { register, handleSubmit, control, formState: { errors }, trigger, setValue, getValues } = useForm<ProjectFormData>({
    defaultValues: {
      title: '',
      description: '',
      status: '',
      period: {
        startDate: '',
        endDate: ''
      },
      identificationPeriod: {
        startDate: '',
        endDate: ''
      },
      preparationPeriod: {
        startDate: '',
        endDate: ''
      },
      implementationPeriod: {
        startDate: '',
        endDate: ''
      },
      completionPeriod: {
        startDate: '',
        endDate: ''
      },
      maintenancePeriod: {
        startDate: '',
        endDate: ''
      },
      decommissioningPeriod: {
        startDate: '',
        endDate: ''
      },
      type: '',
      purpose: '',
      sector: [],
      locations: [],
      publicAuthority: { name: '', id: '' },
      budget: {
        description: '',
        amount: { amount: 0, currency: 'THB' }
      },
      parties: [],
      documents: [],
      risks: [],
    }
  })

  const handleNext = async () => {
    // Reset submit status when navigating between steps
    setSubmitStatus('idle')
    
    if (currentStep === 1) {
      setStep1ValidationAttempted(true)
      // Validate Step 1 fields
      const isValid = await trigger([
        'title',
        'sector',
        'type',
        'parties',
        'additionalClassifications'
      ])
      
      if (isValid) {
        setCurrentStep(2)
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (currentStep === 2) {
      // Step 2 validation removed - allow users to proceed without strict validation
      // Console log all current project values
      const currentValues = getValues()
      console.log('Step 2 - Current Project Values:', currentValues)
      setCurrentStep(3)
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentStep === 3) {
      // Validate Step 3 fields
      const isValid = await trigger([
        'budget.amount.amount'
      ])
      
      if (isValid) {
        setCurrentStep(4)
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (currentStep === 4) {
      // Validate Step 4 fields
      const isValid = await trigger([
        'documents'
      ])
      
      if (isValid) {
        setCurrentStep(5)
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (currentStep === 5) {
      // Validate Step 5 (Risk) - risks are optional; only validate if any were added
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
    // Reset submit status when navigating between steps
    setSubmitStatus('idle')
    
    if (currentStep === 6) {
      setCurrentStep(5)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentStep === 5) {
      setCurrentStep(4)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentStep === 4) {
      setCurrentStep(3)
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentStep === 3) {
      setCurrentStep(2)
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (currentStep === 2) {
      setCurrentStep(1)
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }


  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    // Only allow submission on step 6 and if submit button was explicitly clicked
    if (currentStep !== 6 || !submitButtonClicked.current) {
      submitButtonClicked.current = false
      return
    }
    
    // Reset the flag
    submitButtonClicked.current = false
    
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Calculate durationInDays from startDate and endDate
      if (data.period?.startDate && data.period?.endDate) {
        // Parse dates (now in ISO 8601 format)
        const startDate = dayjs(data.period.startDate).toDate()
        const endDate = dayjs(data.period.endDate).toDate()
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const timeDiff = endDate.getTime() - startDate.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
          data.period.durationInDays = daysDiff > 0 ? daysDiff : 0
        }
      }
      
      // Sector: string[] of business group codes (normalize legacy object entries if any)
      const sector = Array.isArray(data.sector)
        ? data.sector
            .filter(Boolean)
            .map((s) => {
              if (typeof s === 'string') return s.trim()
              if (typeof s === 'object' && s !== null && 'id' in s) {
                return String((s as { id?: string }).id || '').trim()
              }
              return ''
            })
            .filter((s) => s && isValidBusinessGroupCode(s))
        : []

      // Extract contractType from additionalClassifications
      // Find classification with scheme "รูปแบบการจัดสรรกรรมสิทธิ์"
      const contractTypeClassification = Array.isArray(data.additionalClassifications)
        ? data.additionalClassifications.filter(c => {
            const scheme = typeof c === 'object' && c !== null ? (c.scheme || "") : ""
            return scheme === 'รูปแบบการจัดสรรกรรมสิทธิ์'
          })
        : []

      // Get all other classifications (excluding contractType)
      const otherClassifications = Array.isArray(data.additionalClassifications)
        ? data.additionalClassifications.filter(c => {
            const scheme = typeof c === 'object' && c !== null ? (c.scheme || "") : ""
            return scheme !== 'รูปแบบการจัดสรรกรรมสิทธิ์'
          }).map(c => ({
            scheme: typeof c === 'object' && c !== null ? (c.scheme || "") : "",
            id: typeof c === 'object' && c !== null ? (c.id || "") : "",
            description: typeof c === 'object' && c !== null ? (c.description || "") : ""
          }))
        : []

      // Ensure contractType classifications are properly formatted
      const formattedContractTypeClassifications = contractTypeClassification.map(c => ({
        scheme: 'รูปแบบการจัดสรรกรรมสิทธิ์',
        id: '',
        description: typeof c === 'object' && c !== null ? (c.description || "") : ""
      }))

      const additionalClassifications = [...otherClassifications, ...formattedContractTypeClassifications]

      // Parties: each item is หน่วยงานเจ้าของโครงการ with ministries and เอกชนคู่สัญญา in additionalIdentifiers
      const parties = Array.isArray(data.parties) ? data.parties : []

      // Dates are already in ISO 8601 format from the form steps
      // No conversion needed - they're stored directly as ISO 8601

      const risks = (data.risks ?? []).flatMap((entry, entryIdx) => {
        const riskId = entry.risk_id ?? `RISK-${String(entryIdx + 1).padStart(3, '0')}`
        return expandRisksForApi([{ ...entry, risk_id: riskId }]).map((risk) => ({
          risk_id: String(risk.risk_id),
          title: risk.title,
          phase: risk.phase,
          description: (risk.description ?? []).map((s) => s.trim()).filter(Boolean),
          category_drivers: serializeCategoryDriversForApi(risk.category_drivers),
          mitigation_handling: (risk.mitigation_handling ?? []).map((s) => s.trim()).filter(Boolean),
          impact_statement: (risk.impact_statement ?? []).map((s) => s.trim()).filter(Boolean),
        }))
      })

      // Build the project data according to schema
      const projectData: any = {
        ...data,
        sector: sector, // Array of string codes
        additionalClassifications: additionalClassifications, // Includes contractType from form
        parties: parties, // Includes ministry in publicAuthority.additionalIdentifiers
        risks,
      }
      
      // Create project via backend API
      const createdProject = await createProject(projectData)
      
      if (createdProject) {
        console.log('Project created successfully:', createdProject)
        setSubmitStatus('success')
        
        // Redirect to project view after successful creation
        setTimeout(() => {
          router.push(`/view/${createdProject.id || createdProject._id}`)
        }, 2000)
      } else {
        console.error('Failed to create project')
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isInfoLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-0 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-32">
      <div className={``}>
        <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('pages.create.title')}</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          {t('pages.create.subtitle')}
        </p>
        {/* Step Indicator */}
        <div className="mt-6">
          <div className="flex items-start justify-between w-full">
            {[1, 2, 3, 4, 5, 6].map((step, index) => (
              <div key={step} className="flex items-start flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className="py-2 flex justify-center flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${currentStep >= step ? 'bg-theme-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {step}
                    </div>
                  </div>
                  <span className={`mt-1 text-xs text-center px-1 ${currentStep >= step ? 'text-theme-primary font-medium' : 'text-gray-500'}`}>
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
          // Only submit if we're on step 6 and not already submitting
          if (currentStep === 6 && !isSubmitting) {
            handleSubmit(onSubmit)(e)
          }
        }} 
        className="space-y-8"
        noValidate
      >
        {currentStep === 1 ? (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('pages.create.step1') || 'Essential Information'}</h2>
            <Step1EssentialInfo register={register} control={control} errors={errors} setValue={setValue} getValues={getValues} trigger={trigger} showAuthorityValidationErrors={step1ValidationAttempted} />
          </div>
        ) : currentStep === 2 ? (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">ระยะเวลาโครงการ</h2>
            <Step2AdditionalDetails register={register} control={control} errors={errors} setValue={setValue} getValues={getValues} trigger={trigger} />
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
            <Step5Review control={control} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-secondary w-full sm:w-auto"
              >
                {t('pages.create.back') || 'Back'}
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => router.push('/projects')}
              className="btn-secondary w-full sm:w-auto"
            >
              {t('common.cancel')}
            </button>
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary w-full sm:w-auto"
              >
                {t('pages.create.next') || 'Next'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || submitStatus === 'success'}
                onClick={(e) => {
                  // Mark that the submit button was explicitly clicked
                  submitButtonClicked.current = true
                  // Explicitly prevent any default behavior and ensure we're submitting
                  e.preventDefault()
                  e.stopPropagation()
                  if (currentStep === 6 && !isSubmitting && submitStatus !== 'success') {
                    handleSubmit(onSubmit)(e)
                  } else {
                    submitButtonClicked.current = false
                  }
                }}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isSubmitting ? t('common.creating') : t('pages.create.submit') || t('common.create')}
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
                <p className="text-sm font-medium text-green-800">
                  {t('pages.create.success')}
                </p>
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
                <p className="text-sm font-medium text-red-800">
                  {t('pages.create.error')}
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
      </div>
    </div>
  )
}
