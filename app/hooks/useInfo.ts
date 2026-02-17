import { useQuery } from '@tanstack/react-query'
import { appConfig } from '@/app/configs/appConfig'

export interface InfoData {
  sector: Array<{ id: number; value: string }>
  ministry: Array<{ id: number; value: string }>
  contractType: Array<{ id: number; value: string }>
  projectType: Array<{ id: number; value: string }>
  concessionForm: Array<{ id: number; value: string }>
}

export const useInfo = () => {
  return useQuery<InfoData>({
    queryKey: ['get', 'info'],
    queryFn: async () => {
      const response = await fetch(`${appConfig.apiUrl}/api/v1/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: InfoData = await response.json()
      // console.log('Fetched info from /api/info:', data)
      return data
    },
    // Return empty data structure on error to prevent crashes
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
