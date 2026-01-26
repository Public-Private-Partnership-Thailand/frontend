import { UseFormRegister, Control, FieldErrors, useFieldArray } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'

interface BudgetSectionProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}

export default function BudgetSection({ register, control, errors }: BudgetSectionProps) {
  const { t } = useLanguage()
  const { fields: breakdownFields, append: appendBreakdown, remove: removeBreakdown } = useFieldArray({
    control,
    name: 'budget.budgetBreakdowns'
  })

  const { fields: financingFields, append: appendFinancing, remove: removeFinancing } = useFieldArray({
    control,
    name: 'budget.finance'
  })

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('form.budget.title')}</h2>
      
      <div className="space-y-6">
        <div>
          <label className="form-label">{t('form.budget.description')} *</label>
          <textarea
            {...register('budget.description', { required: t('common.required') })}
            rows={3}
            className="form-input"
            placeholder={t('form.budget.describeBudget')}
          />
          {errors.budget?.description && (
            <p className="mt-1 text-sm text-red-600">{errors.budget.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">{t('form.budget.amountN')} *</label>
            <input
              {...register('budget.amount.amount', { required: t('common.required'), valueAsNumber: true })}
              type="number"
              className="form-input"
              placeholder="0"
            />
            {errors.budget?.amount?.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.budget.amount.amount.message}</p>
            )}
          </div>
          <div>
            <label className="form-label">{t('form.budget.currency')} *</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
              THB
            </div>
            <input
              type="hidden"
              {...register('budget.amount.currency', { required: t('common.required') })}
              value="THB"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">{t('form.budget.requestDate')}</label>
            <input
              {...register('budget.requestDate')}
              type="date"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">{t('form.budget.approvalDate')}</label>
            <input
              {...register('budget.approvalDate')}
              type="date"
              className="form-input"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('form.budget.breakdown')}</h3>
            <button
              type="button"
              onClick={() => appendBreakdown({ id: '', description: '', budgetBreakdown: [] })}
              className="btn-secondary text-sm"
            >
              {t('form.budget.addBreakdown')}
            </button>
          </div>
          
          {breakdownFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">{t('form.budget.breakdown')} {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeBreakdown(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  {t('common.remove')}
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="form-label">{t('form.budget.breakdownType')}</label>
                  <input
                    {...register(`budget.budgetBreakdowns.${index}.description`)}
                    className="form-input"
                    placeholder={t('form.budget.breakdownTypePlaceholder')}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('form.budget.financing')}</h3>
            <button
              type="button"
              onClick={() => appendFinancing({ 
                id: '', 
                assetClass: [], 
                type: '', 
                concessional: false,
                value: { amount: 0, currency: '' },
                source: '',
                financingParty: { id: '', name: '' },
                period: { startDate: '', endDate: '' }
              })}
              className="btn-secondary text-sm"
            >
              {t('form.budget.addFinancing')}
            </button>
          </div>
          
          {financingFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Financing {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeFinancing(index)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  {t('common.remove')}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <input
                  {...register(`budget.finance.${index}.source`)}
                  className="form-input"
                  placeholder="Financing source"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
