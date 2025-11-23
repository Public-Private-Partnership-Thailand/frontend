'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { ProjectFormData, ProjectData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { createProject } from '@/lib/projectService'
import BasicInfoSection from '@/components/form/BasicInfoSection'
import BudgetSection from '@/components/form/BudgetSection'
import PeriodSection from '@/components/form/PeriodSection'
import PartiesSection from '@/components/form/PartiesSection'
import AdditionalInfoSection from '@/components/form/AdditionalInfoSection'

export default function CreateProjectPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      title: '',
      description: '',
      status: '',
      period: {
        startDate: '',
        endDate: ''
      },
      type: '',
      purpose: '',
      businessGroup: '',
      ministry: '',
      sector: [],
      locations: [],
      publicAuthority: { name: '', id: '' },
      budget: {
        description: '',
        amount: { amount: 0, currency: '' }
      },
      parties: []
    }
  })

  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Generate a unique ID for the new project
      const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Prepare project data with required fields
      const projectData: ProjectData = {
        id: projectId,
        updated: new Date().toISOString(),
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'active',
        type: data.type || '',
        purpose: data.purpose || '',
        language: 'th',
        period: data.period || {
          startDate: '',
          endDate: ''
        },
        sector: data.sector || [],
        locations: data.locations || [],
        budget: data.budget || {
          description: '',
          amount: {
            amount: 0,
            currency: 'THB'
          }
        },
        parties: data.parties || [],
        publicAuthority: data.publicAuthority || {
          name: '',
          id: ''
        },
        identifiers: data.identifiers || [],
        additionalClassifications: data.additionalClassifications || [],
        identificationPeriod: data.identificationPeriod,
        preparationPeriod: data.preparationPeriod,
        implementationPeriod: data.implementationPeriod,
        completionPeriod: data.completionPeriod,
        maintenancePeriod: data.maintenancePeriod,
        decommissioningPeriod: data.decommissioningPeriod,
        relatedProjects: data.relatedProjects,
        assetLifetime: data.assetLifetime,
        documents: data.documents,
        forecasts: data.forecasts,
        metrics: data.metrics,
        costMeasurements: data.costMeasurements,
        contractingProcesses: data.contractingProcesses,
        milestones: data.milestones,
        transactions: data.transactions,
        completion: data.completion,
        lobbyingMeetings: data.lobbyingMeetings,
        social: data.social,
        environment: data.environment,
        policyAlignment: data.policyAlignment,
        benefits: data.benefits,
        businessGroup: data.businessGroup,
        ministry: data.ministry,
      }
      
      console.log('Creating project with data:', projectData)
      
      // Create project via backend API
      const createdProject = await createProject(projectData)
      
      if (createdProject) {
        console.log('Project created successfully:', createdProject)
        setSubmitStatus('success')
        
        // Redirect to project view after successful creation
        setTimeout(() => {
          router.push(`/view/${createdProject.id}`)
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

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('pages.create.title')}</h1>
        <p className="mt-2 text-gray-600">
          {t('pages.create.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <BasicInfoSection register={register} errors={errors} />
        <BudgetSection register={register} control={control} errors={errors} />
        <PeriodSection register={register} errors={errors} />
        <PartiesSection register={register} control={control} errors={errors} />
        <AdditionalInfoSection register={register} control={control} errors={errors} />

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('common.creating') : t('common.create')}
          </button>
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
  )
}
