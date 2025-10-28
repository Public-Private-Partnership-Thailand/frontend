import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'

interface PeriodSectionProps {
  register: UseFormRegister<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}

export default function PeriodSection({ register, errors }: PeriodSectionProps) {
  const { t } = useLanguage()
  
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('form.period.title')}</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>{t('pages.view.mainPeriod')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">{t('form.period.startDate')} *</label>
              <input
                {...register('period.startDate', { required: t('common.required') })}
                type="date"
                className="form-input"
              />
              {errors.period?.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.period.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">{t('form.period.endDate')} *</label>
              <input
                {...register('period.endDate', { required: t('common.required') })}
                type="date"
                className="form-input"
              />
              {errors.period?.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.period.endDate.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('form.period.implementationPeriod')}</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">{t('form.period.startDate')}</label>
                <input
                  {...register('implementationPeriod.startDate')}
                  type="date"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">{t('form.period.endDate')}</label>
                <input
                  {...register('implementationPeriod.endDate')}
                  type="date"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('form.period.completionPeriod')}</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">{t('form.period.startDate')}</label>
                <input
                  {...register('completionPeriod.startDate')}
                  type="date"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">{t('form.period.endDate')}</label>
                <input
                  {...register('completionPeriod.endDate')}
                  type="date"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('form.period.maintenancePeriod')}</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">{t('form.period.startDate')}</label>
                <input
                  {...register('maintenancePeriod.startDate')}
                  type="date"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">{t('form.period.endDate')}</label>
                <input
                  {...register('maintenancePeriod.endDate')}
                  type="date"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('form.period.decommissioningPeriod')}</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">{t('form.period.startDate')}</label>
                <input
                  {...register('decommissioningPeriod.startDate')}
                  type="date"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">{t('form.period.endDate')}</label>
                <input
                  {...register('decommissioningPeriod.endDate')}
                  type="date"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
