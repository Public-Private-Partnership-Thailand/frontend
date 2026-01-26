import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'

interface BasicInfoSectionProps {
  register: UseFormRegister<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}

export default function BasicInfoSection({ register, errors }: BasicInfoSectionProps) {
  const { t } = useLanguage()
  
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('form.basicInfo.title')}</h2>
      
      <div className="space-y-6">
        {/* Project Title */}
        <div>
          <label className="form-label">{t('form.basicInfo.projectTitle')} *</label>
          <input
            {...register('title', { required: t('common.required') })}
            className="form-input"
            placeholder={t('form.basicInfo.enterTitle')}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="form-label">{t('form.basicInfo.description')} *</label>
          <textarea
            {...register('description', { required: t('common.required') })}
            rows={4}
            className="form-input"
            placeholder={t('form.basicInfo.enterDescription')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Grid for Status, Type, Purpose */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="form-label">{t('form.basicInfo.status')} *</label>
            <select 
              {...register('status', { required: t('common.required') })} 
              className="form-input"
            >
              <option value="">{t('form.basicInfo.selectStatus')}</option>
              <option value="planning">{t('form.basicInfo.planning')}</option>
              <option value="active">{t('form.basicInfo.active')}</option>
              <option value="completed">{t('form.basicInfo.completed')}</option>
              <option value="cancelled">{t('form.basicInfo.cancelled')}</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">{t('form.basicInfo.type')} *</label>
            <input
              {...register('type', { required: t('common.required') })}
              className="form-input"
              placeholder={t('form.basicInfo.enterType')}
            />
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">{t('form.basicInfo.purpose')} *</label>
            <input
              {...register('purpose', { required: t('common.required') })}
              className="form-input"
              placeholder={t('form.basicInfo.enterPurpose')}
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>
        </div>

        {/* Ministry */}
        <div>
          <label className="form-label">{t('dashboard.ministry')} *</label>
          <select 
            {...register('ministry', { required: t('common.required') })} 
            className="form-input"
          >
            <option value="">{t('common.select')}</option>
            <option value="transport">{t('dashboard.ministry')} - Transport</option>
            <option value="energy">{t('dashboard.ministry')} - Energy</option>
            <option value="interior">{t('dashboard.ministry')} - Interior</option>
            <option value="education">{t('dashboard.ministry')} - Education</option>
            <option value="health">{t('dashboard.ministry')} - Health</option>
            <option value="finance">{t('dashboard.ministry')} - Finance</option>
            <option value="digital">{t('dashboard.ministry')} - Digital</option>
            <option value="other">{t('dashboard.ministry')} - Other</option>
          </select>
          {errors.ministry && (
            <p className="mt-1 text-sm text-red-600">{errors.ministry.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('form.basicInfo.publicAuthority')}</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="form-label">{t('form.basicInfo.authorityName')} *</label>
            <input
              {...register('publicAuthority.name', { required: t('common.required') })}
              className="form-input"
              placeholder={t('form.basicInfo.authorityNamePlaceholder')}
            />
            {errors.publicAuthority?.name && (
              <p className="mt-1 text-sm text-red-600">{errors.publicAuthority.name.message}</p>
            )}
          </div>
          <div>
            <label className="form-label">{t('form.basicInfo.authorityRef')} *</label>
            <input
              {...register('publicAuthority.id', { required: t('common.required') })}
              className="form-input"
              placeholder={t('form.basicInfo.authorityRefPlaceholder')}
            />
            {errors.publicAuthority?.id && (
              <p className="mt-1 text-sm text-red-600">{errors.publicAuthority.id.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
