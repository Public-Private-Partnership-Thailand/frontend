'use client'

import { ProjectData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'

interface ProjectCardProps {
  project: ProjectData
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useLanguage()
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card hover:shadow-lg transition-all duration-200 border-l-4 border-transparent hover:border-chula-pink">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {project.title || 'Untitled Project'}
        </h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status || 'Unknown'}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {project.description || 'No description available'}
      </p>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex justify-between">
          <span>Language:</span>
          <span className="font-medium">{project.language || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="font-medium">{project.type || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Start Date:</span>
          <span className="font-medium">{formatDate(project.period?.startDate)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>End Date:</span>
          <span className="font-medium">{formatDate(project.period?.endDate)}</span>
        </div>
        
        {project.budget?.amount?.n && (
          <div className="flex justify-between">
            <span>Budget:</span>
            <span className="font-medium">
              {project.budget.amount.n.toLocaleString()} {project.budget.amount.t || ''}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-xs text-gray-400">
          Updated: {formatDate(project.updated)}
        </div>
        <div className="flex space-x-2">
        <a href={`/edit/${project.id}`} className="text-chula-pink hover:text-chula-pink-dark text-sm font-medium transition-colors duration-200">
          {t('common.edit')}
        </a>
        <a href={`/view/${project.id}`} className="text-gray-600 hover:text-chula-pink text-sm font-medium transition-colors duration-200">
          {t('common.view')}
        </a>
        </div>
      </div>
    </div>
  )
}
