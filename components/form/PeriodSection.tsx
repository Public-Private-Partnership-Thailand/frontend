import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'

interface PeriodSectionProps {
  register: UseFormRegister<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}

export default function PeriodSection({ register, errors }: PeriodSectionProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Periods</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Main Period</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="form-label">Start Date *</label>
              <input
                {...register('period.startDate', { required: 'Start date is required' })}
                type="datetime-local"
                className="form-input"
              />
              {errors.period?.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.period.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">End Date *</label>
              <input
                {...register('period.endDate', { required: 'End date is required' })}
                type="datetime-local"
                className="form-input"
              />
              {errors.period?.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.period.endDate.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">Duration (Months)</label>
              <input
                {...register('period.durationInMonths', { valueAsNumber: true })}
                type="number"
                className="form-input"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Implementation Period</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Start Date</label>
                <input
                  {...register('implementationPeriod.startDate')}
                  type="datetime-local"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  {...register('implementationPeriod.endDate')}
                  type="datetime-local"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Completion Period</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Start Date</label>
                <input
                  {...register('completionPeriod.startDate')}
                  type="datetime-local"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  {...register('completionPeriod.endDate')}
                  type="datetime-local"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Period</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Start Date</label>
                <input
                  {...register('maintenancePeriod.startDate')}
                  type="datetime-local"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  {...register('maintenancePeriod.endDate')}
                  type="datetime-local"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Decommissioning Period</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Start Date</label>
                <input
                  {...register('decommissioningPeriod.startDate')}
                  type="datetime-local"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  {...register('decommissioningPeriod.endDate')}
                  type="datetime-local"
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
