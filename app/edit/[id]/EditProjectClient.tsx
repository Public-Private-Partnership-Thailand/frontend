'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import { ProjectFormData, ProjectData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import BasicInfoSection from '@/components/form/BasicInfoSection'
import BudgetSection from '@/components/form/BudgetSection'
import PeriodSection from '@/components/form/PeriodSection'
import PartiesSection from '@/components/form/PartiesSection'
import AdditionalInfoSection from '@/components/form/AdditionalInfoSection'
import LoadingSpinner from '@/components/LoadingSpinner'
import { fetchProjectsFromAPI } from '@/lib/projectService'

export default function EditProjectClient() {
  const { t } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [project, setProject] = useState<ProjectData | null>(null)

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ProjectFormData>()

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const projects = await fetchProjectsFromAPI()
      const foundProject = projects.find(p => p.id === projectId)
      
      if (foundProject) {
        setProject(foundProject)
        // Reset form with fetched data
        reset({
          identifiers: foundProject.identifiers,
          publicAuthority: foundProject.publicAuthority,
          title: foundProject.title,
          description: foundProject.description,
          budget: foundProject.budget,
          period: foundProject.period,
          implementationPeriod: foundProject.implementationPeriod,
          completionPeriod: foundProject.completionPeriod,
          maintenancePeriod: foundProject.maintenancePeriod,
          decommissioningPeriod: foundProject.decommissioningPeriod,
          locations: foundProject.locations,
          status: foundProject.status,
          type: foundProject.type,
          sector: foundProject.sector,
          purpose: foundProject.purpose,
          additionalClassifications: foundProject.additionalClassifications,
          parties: foundProject.parties,
          assetLifetime: foundProject.assetLifetime,
          forecasts: foundProject.forecasts,
          metrics: foundProject.metrics,
          milestones: foundProject.milestones,
          completion: foundProject.completion,
          documents: foundProject.documents
        })
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

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // For static app, we'll just show success message
      // In a real static app, you might want to save to localStorage or show a message
      console.log('Updated project data:', data)
      
      setSubmitStatus('success')
      
      // Redirect to project list after successful update
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      console.error('Error updating project:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('pages.edit.notFound')}</h3>
        <p className="mt-1 text-sm text-gray-500">{t('pages.edit.notFoundDesc')}</p>
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
        <h1 className="text-3xl font-bold text-gray-900">{t('pages.edit.title')}</h1>
        <p className="mt-2 text-gray-600">
          {t('pages.edit.subtitle')} - {project.title}
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
            onClick={() => router.push(`/view/${projectId}`)}
            className="btn-secondary"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('common.updating') : t('common.update')}
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
                  {t('pages.edit.success')}
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
                  {t('pages.edit.error')}
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
