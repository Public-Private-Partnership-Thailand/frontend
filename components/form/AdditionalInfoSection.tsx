import { UseFormRegister, Control, FieldErrors, useFieldArray } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'

interface AdditionalInfoSectionProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}

export default function AdditionalInfoSection({ register, control, errors }: AdditionalInfoSectionProps) {
  const { t } = useLanguage()
  const { fields: identifierFields, append: appendIdentifier, remove: removeIdentifier } = useFieldArray({
    control,
    name: 'identifiers' as any
  })

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({
    control,
    name: 'locations' as any
  })

  const { fields: sectorFields, append: appendSector, remove: removeSector } = useFieldArray({
    control,
    name: 'sector' as any
  })

  const { fields: classificationFields, append: appendClassification, remove: removeClassification } = useFieldArray({
    control,
    name: 'additionalClassifications' as any
  })

  const { fields: forecastFields, append: appendForecast, remove: removeForecast } = useFieldArray({
    control,
    name: 'forecasts' as any
  })

  const { fields: metricFields, append: appendMetric, remove: removeMetric } = useFieldArray({
    control,
    name: 'metrics' as any
  })

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control,
    name: 'milestones' as any
  })

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('form.additional.title')}</h2>
      
      <div className="space-y-8">
        {/* Identifiers */}
        <div>
              <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('form.additional.identifiers')}</h3>
            <button
              type="button"
              onClick={() => appendIdentifier({ id: '', scheme: '' })}
              className="btn-secondary text-sm"
            >
              {t('form.additional.addIdentifier')}
            </button>
          </div>
          
          {identifierFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">Identifier {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeIdentifier(index)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  {t('common.remove')}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  {...register(`identifiers.${index}.id`)}
                  className="form-input"
                  placeholder="Identifier ID"
                />
                <input
                  {...register(`identifiers.${index}.scheme`)}
                  className="form-input"
                  placeholder="Scheme"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Locations */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('form.additional.deliveryLocations')}</h3>
            <button
              type="button"
              onClick={() => appendLocation('')}
              className="btn-secondary text-sm"
            >
              {t('form.additional.addLocation')}
            </button>
          </div>
          
          {locationFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`locations.${index}`)}
                className="form-input flex-1"
                placeholder={t('form.additional.enterLocation')}
              />
              <button
                type="button"
                onClick={() => removeLocation(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                {t('common.remove')}
              </button>
            </div>
          ))}
        </div>

        {/* Sectors */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('form.additional.sectors')}</h3>
            <button
              type="button"
              onClick={() => appendSector('')}
              className="btn-secondary text-sm"
            >
              {t('form.additional.addSector')}
            </button>
          </div>
          
          {sectorFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`sector.${index}`)}
                className="form-input flex-1"
                placeholder={t('form.additional.enterSector')}
              />
              <button
                type="button"
                onClick={() => removeSector(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                {t('common.remove')}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Classifications */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('form.additional.classifications')}</h3>
            <button
              type="button"
              onClick={() => appendClassification('')}
              className="btn-secondary text-sm"
            >
              {t('form.additional.addClassification')}
            </button>
          </div>
          
          {classificationFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`additionalClassifications.${index}`)}
                className="form-input flex-1"
                placeholder={t('form.additional.enterClassification')}
              />
              <button
                type="button"
                onClick={() => removeClassification(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                {t('common.remove')}
              </button>
            </div>
          ))}
        </div>

        {/* Forecasts */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('form.additional.forecasts')}</h3>
            <button
              type="button"
              onClick={() => appendForecast('')}
              className="btn-secondary text-sm"
            >
              {t('form.additional.addForecast')}
            </button>
          </div>
          
          {forecastFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`forecasts.${index}`)}
                className="form-input flex-1"
                placeholder={t('form.additional.enterForecast')}
              />
              <button
                type="button"
                onClick={() => removeForecast(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                {t('common.remove')}
              </button>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('form.additional.metrics')}</h3>
            <button
              type="button"
              onClick={() => appendMetric('')}
              className="btn-secondary text-sm"
            >
              {t('form.additional.addMetric')}
            </button>
          </div>
          
          {metricFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`metrics.${index}`)}
                className="form-input flex-1"
                placeholder={t('form.additional.enterMetric')}
              />
              <button
                type="button"
                onClick={() => removeMetric(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                {t('common.remove')}
              </button>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('form.additional.milestones')}</h3>
            <button
              type="button"
              onClick={() => appendMilestone({ title: '', type: '', code: '', dateMet: '', dueDate: '' })}
              className="btn-secondary text-sm"
            >
              {t('form.additional.addMilestone')}
            </button>
          </div>
          
          {milestoneFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">{t('form.additional.enterMilestone')} {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  {t('common.remove')}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">{t('form.additional.milestoneTitle')}</label>
                  <input
                    {...register(`milestones.${index}.title` as any)}
                    className="form-input"
                    placeholder={t('form.additional.milestoneTitle')}
                  />
                </div>
                <div>
                  <label className="form-label">{t('form.additional.milestoneType')}</label>
                  <select
                    {...register(`milestones.${index}.code` as any)}
                    className="form-input"
                  >
                    <option value="">{t('common.select')}</option>
                    <option value="contractAmendment">{t('form.additional.milestoneTypeContractAmendment')}</option>
                    <option value="completion">{t('form.additional.milestoneTypeCompletion')}</option>
                    <option value="approval">{t('form.additional.milestoneTypeApproval')}</option>
                    <option value="other">{t('form.additional.milestoneTypeOther')}</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('form.additional.milestoneDueDate')}</label>
                  <input
                    {...register(`milestones.${index}.dueDate` as any)}
                    type="date"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">{t('form.additional.milestoneDateMet')}</label>
                  <input
                    {...register(`milestones.${index}.dateMet` as any)}
                    type="date"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('form.additional.completionInfo')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">{t('form.additional.endDate')}</label>
              <input
                {...register('completion.endDate')}
                type="date"
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
