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
    name: 'budget.breakdown'
  })

  const { fields: financingFields, append: appendFinancing, remove: removeFinancing } = useFieldArray({
    control,
    name: 'budget.financing' as any
  })

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('form.budget.title')}</h2>
      
      <div className="space-y-6">
        <div>
          <label className="form-label">{t('form.budget.description')}</label>
          <textarea
            {...register('budget.description')}
            rows={3}
            className="form-input"
            placeholder={t('form.budget.describeBudget')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="form-label">{t('form.budget.amountN')}</label>
            <input
              {...register('budget.amount.n', { valueAsNumber: true })}
              type="number"
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="form-label">{t('form.budget.amountR')}</label>
            <input
              {...register('budget.amount.r', { valueAsNumber: true })}
              type="number"
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="form-label">{t('form.budget.amountType')}</label>
            <input
              {...register('budget.amount.t')}
              className="form-input"
              placeholder={t('form.budget.currencyPlaceholder')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">{t('form.budget.requestDate')}</label>
            <input
              {...register('budget.amount.request')}
              type="datetime-local"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">{t('form.budget.approvalDate')}</label>
            <input
              {...register('budget.amount.approval')}
              type="datetime-local"
              className="form-input"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('form.budget.breakdown')}</h3>
            <button
              type="button"
              onClick={() => appendBreakdown({ bt: '', br: [''] })}
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
                    {...register(`budget.breakdown.${index}.bt`)}
                    className="form-input"
                    placeholder={t('form.budget.breakdownTypePlaceholder')}
                  />
                </div>
                
                <div>
                  <label className="form-label">{t('form.budget.breakdownDetails')}</label>
                  <textarea
                    {...register(`budget.breakdown.${index}.br.0`)}
                    rows={2}
                    className="form-input"
                    placeholder={t('form.budget.breakdownDetailsPlaceholder')}
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
              onClick={() => appendFinancing('')}
              className="btn-secondary text-sm"
            >
              {t('form.budget.addFinancing')}
            </button>
          </div>
          
          {financingFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`budget.financing.${index}`)}
                className="form-input flex-1"
                placeholder={t('form.budget.financingPlaceholder')}
              />
              <button
                type="button"
                onClick={() => removeFinancing(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                {t('common.remove')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
