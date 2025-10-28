import { UseFormRegister, Control, FieldErrors, useFieldArray } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'

interface PartiesSectionProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}

export default function PartiesSection({ register, control, errors }: PartiesSectionProps) {
  const { t } = useLanguage()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parties' as any
  })

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{t('form.parties.title')}</h2>
        <button
          type="button"
          onClick={() => append({
            name: '',
            id: '',
            roles: ['']
          })}
          className="btn-secondary text-sm"
        >
          {t('form.parties.addParty')}
        </button>
      </div>
      
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">Party {index + 1}</h3>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
{t('form.parties.removeParty')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label">{t('form.parties.partyName')} *</label>
                <input
                  {...register(`parties.${index}.name`, { required: t('common.required') })}
                  className="form-input"
                  placeholder={t('form.parties.enterPartyName')}
                />
                {errors.parties?.[index]?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.parties[index]?.name?.message}</p>
                )}
              </div>
              
              <div>
                <label className="form-label">{t('form.parties.partyId')} *</label>
                <input
                  {...register(`parties.${index}.id`, { required: t('common.required') })}
                  className="form-input"
                  placeholder={t('form.parties.enterPartyId')}
                />
                {errors.parties?.[index]?.id && (
                  <p className="mt-1 text-sm text-red-600">{errors.parties[index]?.id?.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="form-label">Roles *</label>
              <input
                {...register(`parties.${index}.roles.0`, { required: t('common.required') })}
                className="form-input"
                placeholder="Enter party role"
              />
              {errors.parties?.[index]?.roles && (
                <p className="mt-1 text-sm text-red-600">{errors.parties[index]?.roles?.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
