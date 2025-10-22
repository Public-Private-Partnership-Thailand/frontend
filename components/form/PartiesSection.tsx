import { UseFormRegister, Control, FieldErrors, useFieldArray } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'

interface PartiesSectionProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}

export default function PartiesSection({ register, control, errors }: PartiesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parties'
  })

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Parties & Stakeholders</h2>
        <button
          type="button"
          onClick={() => append({
            name: '',
            id: '',
            identifier: { Scheme: '', id: '', LegalName: '', URI: '' },
            additionalIdentifiers: ['']
          })}
          className="btn-secondary text-sm"
        >
          Add Party
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
                Remove Party
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label">Name *</label>
                <input
                  {...register(`parties.${index}.name`, { required: 'Party name is required' })}
                  className="form-input"
                  placeholder="Enter party name"
                />
                {errors.parties?.[index]?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.parties[index]?.name?.message}</p>
                )}
              </div>
              
              <div>
                <label className="form-label">ID</label>
                <input
                  {...register(`parties.${index}.id`)}
                  className="form-input"
                  placeholder="Enter party ID"
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Identifier Information</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">Scheme</label>
                  <input
                    {...register(`parties.${index}.identifier.Scheme`)}
                    className="form-input"
                    placeholder="Identifier scheme"
                  />
                </div>
                
                <div>
                  <label className="form-label">Identifier ID</label>
                  <input
                    {...register(`parties.${index}.identifier.id`)}
                    className="form-input"
                    placeholder="Identifier ID"
                  />
                </div>
                
                <div>
                  <label className="form-label">Legal Name</label>
                  <input
                    {...register(`parties.${index}.identifier.LegalName`)}
                    className="form-input"
                    placeholder="Legal name"
                  />
                </div>
                
                <div>
                  <label className="form-label">URI</label>
                  <input
                    {...register(`parties.${index}.identifier.URI`)}
                    className="form-input"
                    placeholder="URI"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="form-label">Additional Identifiers</label>
              <textarea
                {...register(`parties.${index}.additionalIdentifiers.0`)}
                rows={2}
                className="form-input"
                placeholder="Additional identifier information"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
