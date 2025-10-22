import { UseFormRegister, Control, FieldErrors, useFieldArray } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'

interface BudgetSectionProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}

export default function BudgetSection({ register, control, errors }: BudgetSectionProps) {
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Budget Information</h2>
      
      <div className="space-y-6">
        <div>
          <label className="form-label">Budget Description</label>
          <textarea
            {...register('budget.description')}
            rows={3}
            className="form-input"
            placeholder="Describe the budget allocation"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="form-label">Amount (N)</label>
            <input
              {...register('budget.amount.n', { valueAsNumber: true })}
              type="number"
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="form-label">Amount (R)</label>
            <input
              {...register('budget.amount.r', { valueAsNumber: true })}
              type="number"
              className="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="form-label">Amount Type</label>
            <input
              {...register('budget.amount.t')}
              className="form-input"
              placeholder="e.g., USD, THB"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">Request Date</label>
            <input
              {...register('budget.amount.request')}
              type="datetime-local"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Approval Date</label>
            <input
              {...register('budget.amount.approval')}
              type="datetime-local"
              className="form-input"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Budget Breakdown</h3>
            <button
              type="button"
              onClick={() => appendBreakdown({ bt: '', br: [''] })}
              className="btn-secondary text-sm"
            >
              Add Breakdown
            </button>
          </div>
          
          {breakdownFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Breakdown {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeBreakdown(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="form-label">Breakdown Type</label>
                  <input
                    {...register(`budget.breakdown.${index}.bt`)}
                    className="form-input"
                    placeholder="e.g., Personnel, Equipment"
                  />
                </div>
                
                <div>
                  <label className="form-label">Breakdown Details</label>
                  <textarea
                    {...register(`budget.breakdown.${index}.br.0`)}
                    rows={2}
                    className="form-input"
                    placeholder="Detailed breakdown description"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Financing Arrangements</h3>
            <button
              type="button"
              onClick={() => appendFinancing('')}
              className="btn-secondary text-sm"
            >
              Add Financing
            </button>
          </div>
          
          {financingFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`budget.financing.${index}`)}
                className="form-input flex-1"
                placeholder="Financing arrangement"
              />
              <button
                type="button"
                onClick={() => removeFinancing(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
