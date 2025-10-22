import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'

interface BasicInfoSectionProps {
  register: UseFormRegister<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}

export default function BasicInfoSection({ register, errors }: BasicInfoSectionProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="form-label">Title *</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="form-input"
            placeholder="Enter project title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="form-label">Language</label>
          <select {...register('language')} className="form-input">
            <option value="th">Thai</option>
            <option value="en">English</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="form-label">Description *</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={4}
            className="form-input"
            placeholder="Enter project description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="form-label">Status</label>
          <select {...register('status')} className="form-input">
            <option value="">Select status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="form-label">Type</label>
          <input
            {...register('type')}
            className="form-input"
            placeholder="Enter project type"
          />
        </div>

        <div>
          <label className="form-label">Purpose</label>
          <input
            {...register('purpose')}
            className="form-input"
            placeholder="Enter project purpose"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Public Authority</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">Name</label>
            <input
              {...register('publicAuthority.n')}
              className="form-input"
              placeholder="Authority name"
            />
          </div>
          <div>
            <label className="form-label">Reference</label>
            <input
              {...register('publicAuthority.r')}
              className="form-input"
              placeholder="Authority reference"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
