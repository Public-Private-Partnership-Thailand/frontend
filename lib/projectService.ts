import { ProjectData } from '@/types/project'
import { appConfig } from '@/app/configs/appConfig'

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
  year_from?: number
  year_to?: number
  search?: string
}

export interface ProjectListQueryParams extends ProjectQueryParams {
  page?: number
  page_size?: number
}

// Fallback to external JSON API URL if backend is not available
const EXTERNAL_API_URL = 'https://publicdigitaltwin.s3.ap-southeast-1.amazonaws.com/project-ppp.json'

function buildProjectsListQueryString(params?: ProjectListQueryParams): string {
  const search = new URLSearchParams()
  const page = params?.page ?? 1
  const pageSize = params?.page_size ?? 10
  search.set('page', String(page))
  search.set('page_size', String(pageSize))
  if (params) {
    if (params.sector_id?.length) {
      params.sector_id.forEach((id) => search.append('sector_id', String(id)))
    }
    if (params.ministry_id?.length) {
      params.ministry_id.forEach((id) => search.append('ministry_id', String(id)))
    }
    // if (params.concession_form_id?.length) params.concession_form_id.forEach(id => search.append('concession_form_id', String(id)))  // uncomment when needed
    if (params.year_from != null) search.set('year_from', String(params.year_from))
    if (params.year_to != null) search.set('year_to', String(params.year_to))
    if (params.search) search.set('search', params.search)
  }
  return search.toString()
}

// Function to fetch projects from backend API (optional query params from filters)
export async function fetchProjectsFromAPI(params?: ProjectQueryParams): Promise<ProjectData[]> {
  const response = await fetchProjectsPageFromAPI(params)
  return response.data
}

// Function to fetch projects + pagination metadata from backend API
export async function fetchProjectsPageFromAPI(params?: ProjectListQueryParams): Promise<ProjectsListResponse> {
  const page = params?.page ?? 1
  const pageSize = params?.page_size ?? 10
  const queryString = buildProjectsListQueryString(params)
  console.log('Query string:', queryString)
  console.log('App config API URL:', appConfig.apiUrl)
  const url = `${appConfig.apiUrl}/api/v1/projects?${queryString}`
  console.log('Fetching projects from API:', url)

  try {
    const response = await fetch(url, {
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
    const rawPagination = json?.pagination
    const total = Number(rawPagination?.total ?? data.length)
    const totalPagesFromApi = Number(rawPagination?.totalPages ?? 0)
    const normalizedPageSize = Number(rawPagination?.pageSize ?? rawPagination?.page_size ?? pageSize)
    const totalPages = totalPagesFromApi > 0 ? totalPagesFromApi : Math.max(1, Math.ceil(total / Math.max(1, normalizedPageSize)))

    return {
      data,
      pagination: {
        page: Number(rawPagination?.page ?? page),
        pageSize: normalizedPageSize,
        total,
        totalPages,
      },
    }
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
        const safePage = Math.max(1, page)
        const safePageSize = Math.max(1, pageSize)
        const startIndex = (safePage - 1) * safePageSize
        const pagedData = externalData.slice(startIndex, startIndex + safePageSize)
        return {
          data: pagedData,
          pagination: {
            page: safePage,
            pageSize: safePageSize,
            total: externalData.length,
            totalPages: Math.max(1, Math.ceil(externalData.length / safePageSize)),
          },
        }
      } catch (fallbackError) {
        console.error('Error fetching projects from external API:', fallbackError)
      }
    }
    return {
      data: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 1,
      },
    }
  }
}

// Function to fetch a single project by ID
export async function fetchProjectById(id: string): Promise<ProjectData | null> {
  try {
    const response = await fetch(`${appConfig.apiUrl}/api/v1/projects/${id}`, {
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
    const response = await fetch(`${appConfig.apiUrl}/api/v1/projects`, {
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
    const response = await fetch(`${appConfig.apiUrl}/api/v1/projects/${id}`, {
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
export { EXTERNAL_API_URL }
