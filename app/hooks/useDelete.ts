import { useMutation } from '@tanstack/react-query'
import { appConfig } from '@/app/configs/appConfig'

/**
 * DELETE /api/v1/projects/{project_id}
 * Call mutate(projectId) or mutateAsync(projectId) to delete a project.
 */
export function useDeleteProject() {
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`${appConfig.apiUrl}/api/v1/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return true
    },
  })
}
