import { UseFormRegister, Control, FieldErrors, useFieldArray } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'

interface AdditionalInfoSectionProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}

export default function AdditionalInfoSection({ register, control, errors }: AdditionalInfoSectionProps) {
  const { fields: identifierFields, append: appendIdentifier, remove: removeIdentifier } = useFieldArray({
    control,
    name: 'identifiers'
  })

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({
    control,
    name: 'locations'
  })

  const { fields: sectorFields, append: appendSector, remove: removeSector } = useFieldArray({
    control,
    name: 'sector'
  })

  const { fields: classificationFields, append: appendClassification, remove: removeClassification } = useFieldArray({
    control,
    name: 'additionalClassifications'
  })

  const { fields: forecastFields, append: appendForecast, remove: removeForecast } = useFieldArray({
    control,
    name: 'forecasts'
  })

  const { fields: metricFields, append: appendMetric, remove: removeMetric } = useFieldArray({
    control,
    name: 'metrics'
  })

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control,
    name: 'milestones'
  })

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
      
      <div className="space-y-8">
        {/* Identifiers */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Identifiers</h3>
            <button
              type="button"
              onClick={() => appendIdentifier('')}
              className="btn-secondary text-sm"
            >
              Add Identifier
            </button>
          </div>
          
          {identifierFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`identifiers.${index}`)}
                className="form-input flex-1"
                placeholder="Simple identifier"
              />
              <button
                type="button"
                onClick={() => removeIdentifier(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Locations */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Delivery Locations</h3>
            <button
              type="button"
              onClick={() => appendLocation('')}
              className="btn-secondary text-sm"
            >
              Add Location
            </button>
          </div>
          
          {locationFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`locations.${index}`)}
                className="form-input flex-1"
                placeholder="Delivery location"
              />
              <button
                type="button"
                onClick={() => removeLocation(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Sectors */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Sectors</h3>
            <button
              type="button"
              onClick={() => appendSector('')}
              className="btn-secondary text-sm"
            >
              Add Sector
            </button>
          </div>
          
          {sectorFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`sector.${index}`)}
                className="form-input flex-1"
                placeholder="Sector name"
              />
              <button
                type="button"
                onClick={() => removeSector(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Additional Classifications */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Classifications</h3>
            <button
              type="button"
              onClick={() => appendClassification('')}
              className="btn-secondary text-sm"
            >
              Add Classification
            </button>
          </div>
          
          {classificationFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`additionalClassifications.${index}`)}
                className="form-input flex-1"
                placeholder="Classification"
              />
              <button
                type="button"
                onClick={() => removeClassification(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Forecasts */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Forecasts</h3>
            <button
              type="button"
              onClick={() => appendForecast('')}
              className="btn-secondary text-sm"
            >
              Add Forecast
            </button>
          </div>
          
          {forecastFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`forecasts.${index}`)}
                className="form-input flex-1"
                placeholder="Metric forecast"
              />
              <button
                type="button"
                onClick={() => removeForecast(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Metrics</h3>
            <button
              type="button"
              onClick={() => appendMetric('')}
              className="btn-secondary text-sm"
            >
              Add Metric
            </button>
          </div>
          
          {metricFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`metrics.${index}`)}
                className="form-input flex-1"
                placeholder="Metric"
              />
              <button
                type="button"
                onClick={() => removeMetric(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Milestones</h3>
            <button
              type="button"
              onClick={() => appendMilestone('')}
              className="btn-secondary text-sm"
            >
              Add Milestone
            </button>
          </div>
          
          {milestoneFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`milestones.${index}`)}
                className="form-input flex-1"
                placeholder="Milestone"
              />
              <button
                type="button"
                onClick={() => removeMilestone(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Completion Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Completion Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">End Date</label>
              <input
                {...register('completion.endDate')}
                type="datetime-local"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Final Value</label>
              <input
                {...register('completion.finalValue.value')}
                className="form-input"
                placeholder="Final value"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
