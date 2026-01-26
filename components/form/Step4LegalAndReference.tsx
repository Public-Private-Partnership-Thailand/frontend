import { UseFormRegister, Control, FieldErrors, useFieldArray, UseFormSetValue } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { useState, useEffect } from 'react'

interface Step4LegalAndReferenceProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
  setValue: UseFormSetValue<ProjectFormData>
  getValues: () => ProjectFormData
}

export default function Step4LegalAndReference({ register, control, errors, setValue, getValues }: Step4LegalAndReferenceProps) {
  const { t } = useLanguage()
  const [relatedLaws, setRelatedLaws] = useState<string>('')
  const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
    control,
    name: 'documents' as any
  })

  // Initialize related laws from policyAlignment
  useEffect(() => {
    const formValues = getValues()
    if (formValues.policyAlignment && typeof formValues.policyAlignment === 'object') {
      const description = formValues.policyAlignment.description || ""
      setRelatedLaws(description)
    }
  }, [getValues])

  return (
    <div className="space-y-6">
        <div>
          <label className="form-label">กฎหมายที่เกี่ยวข้อง</label>
          <textarea
            value={relatedLaws}
            onChange={(e) => {
              const value = e.target.value
              setRelatedLaws(value)
              // Save to policyAlignment field
              setValue('policyAlignment', {
                policies: ['กฎหมายที่เกี่ยวข้อง'],
                description: value
              } as any, { shouldValidate: false })
            }}
            rows={4}
            className="form-input"
            placeholder="กรุณาระบุกฎหมายที่เกี่ยวข้อง"
          />
        </div>

      {/* Reference (Required) */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('pages.view.dataSource')} *</h2>
          <button
            type="button"
            onClick={() => appendDocument({
              id: '',
              documentType: 'reference',
              title: '',
              url: ''
            })}
            className="btn-secondary text-sm whitespace-nowrap"
          >
            {t('form.documents.addReference')}
          </button>
        </div>
        {documentFields.length === 0 && (
          <p className="text-sm text-red-600 mb-2">{t('common.required')}</p>
        )}
        {documentFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">{t('form.documents.referenceLabel').replace('{number}', (index + 1).toString())}</span>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="text-red-600 hover:text-red-800 text-sm px-2"
              >
                {t('common.remove')}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <input
                {...register(`documents.${index}.title` as any, { required: t('common.required') })}
                className={`form-input ${errors.documents?.[index]?.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder={t('form.documents.referenceTitle')}
              />
              {errors.documents?.[index]?.title && (
                <p className="mt-1 text-sm text-red-600">{errors.documents[index]?.title?.message}</p>
              )}
              <input
                {...register(`documents.${index}.url` as any, { required: t('common.required') })}
                className={`form-input ${errors.documents?.[index]?.url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder={t('form.documents.referenceUrl')}
                type="url"
              />
              {errors.documents?.[index]?.url && (
                <p className="mt-1 text-sm text-red-600">{errors.documents[index]?.url?.message}</p>
              )}
            </div>
          </div>
        ))}
        {/* Hidden input for validation */}
        <input
          type="hidden"
          {...register('documents', {
            required: t('common.required'),
            validate: (value) => {
              if (!Array.isArray(value) || value.length === 0) {
                return t('common.required')
              }
              // Check if all documents have title and url
              for (const doc of value) {
                if (!doc.title || !doc.title.trim() || !doc.url || !doc.url.trim()) {
                  return t('common.required')
                }
              }
              return true
            }
          })}
        />
        {errors.documents && documentFields.length === 0 && (
          <p className="mt-1 text-sm text-red-600">{errors.documents.message || t('common.required')}</p>
        )}
      </div>
    </div>
  )
}
