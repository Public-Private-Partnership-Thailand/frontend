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
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

        <div>
          <label className="form-label">{t('form.basicInfo.language')}</label>
          <select {...register('language')} className="form-input">
            <option value="th">{t('form.basicInfo.thai')}</option>
            <option value="en">{t('form.basicInfo.english')}</option>
            <option value="zh">{t('form.basicInfo.chinese')}</option>
            <option value="ja">{t('form.basicInfo.japanese')}</option>
          </select>
        </div>

        <div className="sm:col-span-2">
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

        <div>
          <label className="form-label">{t('form.basicInfo.status')}</label>
          <select {...register('status')} className="form-input">
            <option value="">{t('form.basicInfo.selectStatus')}</option>
            <option value="planning">{t('form.basicInfo.planning')}</option>
            <option value="active">{t('form.basicInfo.active')}</option>
            <option value="completed">{t('form.basicInfo.completed')}</option>
            <option value="cancelled">{t('form.basicInfo.cancelled')}</option>
          </select>
        </div>

        <div>
          <label className="form-label">{t('form.basicInfo.type')}</label>
          <input
            {...register('type')}
            className="form-input"
            placeholder={t('form.basicInfo.enterType')}
          />
        </div>

        <div>
          <label className="form-label">{t('form.basicInfo.purpose')}</label>
          <input
            {...register('purpose')}
            className="form-input"
            placeholder={t('form.basicInfo.enterPurpose')}
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('form.basicInfo.publicAuthority')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">{t('form.basicInfo.authorityName')}</label>
            <input
              {...register('publicAuthority.n')}
              className="form-input"
              placeholder={t('form.basicInfo.authorityNamePlaceholder')}
            />
          </div>
          <div>
            <label className="form-label">{t('form.basicInfo.authorityRef')}</label>
            <input
              {...register('publicAuthority.r')}
              className="form-input"
              placeholder={t('form.basicInfo.authorityRefPlaceholder')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
