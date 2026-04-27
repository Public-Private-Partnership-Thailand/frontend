import { ProjectData } from '@/types/project'

// Backend API URL - can be overridden with environment variable
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const DATASETS_ENDPOINT = `${BACKEND_API_URL}/api/v1/projects`
// const DATASETS_ENDPOINT = `${BACKEND_API_URL}/api/datasets`

/** New API project item shape (GET /api/v1/projects list item) */
export interface ApiProjectItem {
  id: string
  title: string
  ministry?: string[]
  public_authority?: string
  private_parties?: string[]
  sector?: string[]
  concession?: string[] | null
  start_date?: string
}

function isNewApiProject(item: any): item is ApiProjectItem {
  return item && typeof item.public_authority === 'string'
}

/** Map new API project item to ProjectData for use in app */
function mapApiProjectToProjectData(item: ApiProjectItem): ProjectData {
  const ministryList = item.ministry ?? []
  const ministryClassifications = ministryList.map(m => ({ scheme: 'TH-MINISTRY' as const, id: '', description: m }))
  return {
    id: item.id,
    identifiers: item.concession && item.concession.length > 0
      ? [{ scheme: 'TH-PPP-TYPE', id: item.concession[0] }]
      : undefined,
    updated: '',
    title: item.title ?? '',
    description: '',
    status: '',
    period: {
      startDate: item.start_date ?? '',
      endDate: ''
    },
    sector: item.sector ?? [],
    additionalClassifications: ministryClassifications.length > 0 ? ministryClassifications : undefined,
    type: '',
    purpose: '',
    locations: [],
    budget: { description: '', amount: { amount: 0, currency: 'THB' } },
    parties: (item.private_parties ?? []).map(name => ({ name, id: '', roles: ['contractor'] })),
    publicAuthority: { name: item.public_authority ?? '', id: '' }
  }
}

/** Response shape for GET /api/v1/projects (list) */
export interface ProjectsListResponse {
  data: ProjectData[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/** Query params for GET /api/v1/projects (ids from /api/v1/info) */
export interface ProjectQueryParams {
  sector_id?: number[]
  ministry_id?: number[]
  // concession_form_id?: number[]  // uncomment when needed
  year_from?: number
  year_to?: number
  search?: string
}

// Fallback to external JSON API URL if backend is not available
const EXTERNAL_API_URL = 'https://publicdigitaltwin.s3.ap-southeast-1.amazonaws.com/project-ppp.json'

// Function to fetch projects from backend API (optional query params from filters)
export async function fetchProjectsFromAPI(params?: ProjectQueryParams): Promise<ProjectData[]> {
  const url = new URL(DATASETS_ENDPOINT)
  if (params) {
    if (params.sector_id?.length) params.sector_id.forEach(id => url.searchParams.append('sector_id', String(id)))
    if (params.ministry_id?.length) params.ministry_id.forEach(id => url.searchParams.append('ministry_id', String(id)))
    // if (params.concession_form_id?.length) params.concession_form_id.forEach(id => url.searchParams.append('concession_form_id', String(id)))  // uncomment when needed
    if (params.year_from != null) url.searchParams.set('year_from', String(params.year_from))
    if (params.year_to != null) url.searchParams.set('year_to', String(params.year_to))
    if (params.search) url.searchParams.set('search', params.search)
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const json = await response.json()
    const rawList = Array.isArray(json) ? json : (json?.data ?? [])
    const data: ProjectData[] = rawList.map((item: any) =>
      isNewApiProject(item) ? mapApiProjectToProjectData(item) : item
    )
    return data
  } catch (error) {
    console.error('Error fetching projects from backend API:', error)

    // Fallback to external API only when no params (initial load)
    if (!params || (Object.keys(params).length === 0)) {
      try {
        console.log('Falling back to external API...')
        const response = await fetch(EXTERNAL_API_URL)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const externalData: ProjectData[] = await response.json()
        return externalData
      } catch (fallbackError) {
        console.error('Error fetching projects from external API:', fallbackError)
      }
    }
    return []
  }
}

// Function to fetch a single project by ID
export async function fetchProjectById(id: string): Promise<ProjectData | null> {
  try {
    const response = await fetch(`${DATASETS_ENDPOINT}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: ProjectData = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching project ${id} from API:`, error)
    return null
  }
}

// Function to create a new project
export async function createProject(project: ProjectData): Promise<any | null> {
  try {
    console.log('Sending project to backend:', project)
    const response = await fetch(DATASETS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    const result = await response.json()
    console.log('Backend response:', result)
    return result.project || result
  } catch (error) {
    console.error('Error creating project:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
    return null
  }
}

// Function to update a project
export async function updateProject(id: string, project: Partial<ProjectData>): Promise<ProjectData | null> {
  try {
    const response = await fetch(`${DATASETS_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result.project
  } catch (error) {
    console.error(`Error updating project ${id}:`, error)
    return null
  }
}

// Export the API URLs for reference
export { DATASETS_ENDPOINT, EXTERNAL_API_URL }
