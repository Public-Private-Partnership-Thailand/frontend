import { UseFormRegister, Control, FieldErrors, useFieldArray, UseFormSetValue, useWatch } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { useState, useEffect } from 'react'

const RELATED_LAWS_POLICY = 'กฎหมายที่เกี่ยวข้อง'

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
  const policyAlignment = useWatch({ control, name: 'policyAlignment' })
  const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
    control,
    name: 'documents' as any
  })

  const referenceEntries = documentFields.map((field, index) => ({ field, index })).filter(
    ({ field }: { field: any }) => field.documentType === 'reference'
  )
  const imageEntries = documentFields.map((field, index) => ({ field, index })).filter(
    ({ field }: { field: any }) => field.documentType === 'image'
  )

  // Sync กฎหมายที่เกี่ยวข้อง input from policyAlignment when policies includes "กฎหมายที่เกี่ยวข้อง"
  useEffect(() => {
    if (!policyAlignment || typeof policyAlignment !== 'object') return
    const policies = Array.isArray((policyAlignment as { policies?: string[] }).policies)
      ? (policyAlignment as { policies: string[] }).policies
      : []
    if (policies.includes(RELATED_LAWS_POLICY)) {
      const description = (policyAlignment as { description?: string }).description ?? ''
      setRelatedLaws(description)
    }
  }, [policyAlignment])

  return (
    <div className="space-y-6">
        <div>
          <label className="form-label">กฎหมายที่เกี่ยวข้อง</label>
          <textarea
            value={relatedLaws}
            onChange={(e) => {
              const value = e.target.value
              setRelatedLaws(value)
              setValue('policyAlignment', {
                policies: [RELATED_LAWS_POLICY],
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
        {referenceEntries.length === 0 && (
          <p className="text-sm text-red-600 mb-2">{t('common.required')}</p>
        )}
        {referenceEntries.map(({ field, index }, displayIndex) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">{t('form.documents.referenceLabel').replace('{number}', (displayIndex + 1).toString())}</span>
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
              if (!Array.isArray(value)) return t('common.required')
              const refs = value.filter((d: any) => d.documentType === 'reference')
              if (refs.length === 0) return t('common.required')
              for (const doc of value) {
                if ((doc as any).documentType === 'reference') {
                  if (!doc.title || !doc.title.trim() || !doc.url || !doc.url.trim()) {
                    return t('common.required')
                  }
                }
                if ((doc as any).documentType === 'image') {
                  if (!doc.url || !doc.url.trim()) return t('common.required')
                }
              }
              return true
            }
          })}
        />
        {errors.documents && referenceEntries.length === 0 && (
          <p className="mt-1 text-sm text-red-600">{errors.documents.message || t('common.required')}</p>
        )}
      </div>

      {/* Images (optional) */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('pages.view.images')}</h2>
          <button
            type="button"
            onClick={() => {
              const imageCount = imageEntries.length
              appendDocument({
                id: '',
                documentType: 'image',
                title: `image${imageCount + 1}`,
                description: null,
                url: '',
                datePublished: null,
                format: null,
                author: null
              } as any)
            }}
            className="btn-secondary text-sm whitespace-nowrap"
          >
            {t('form.documents.addImage')}
          </button>
        </div>
        {imageEntries.length === 0 && (
          <p className="text-sm text-gray-500 mb-2">{t('form.documents.imageUrlPlaceholder')}</p>
        )}
        {imageEntries.map(({ field, index }, displayIndex) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">{t('form.documents.imageLabel').replace('{number}', (displayIndex + 1).toString())}</span>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="text-red-600 hover:text-red-800 text-sm px-2"
              >
                {t('common.remove')}
              </button>
            </div>
            <input
              {...register(`documents.${index}.url` as any, { required: imageEntries.length > 0 ? t('common.required') : false })}
              className={`form-input w-full ${errors.documents?.[index]?.url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder={t('form.documents.imageUrlPlaceholder')}
              type="url"
            />
            {errors.documents?.[index]?.url && (
              <p className="mt-1 text-sm text-red-600">{errors.documents[index]?.url?.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
