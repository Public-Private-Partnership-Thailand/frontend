import { ProjectData } from '@/types/project'

// Backend API URL - can be overridden with environment variable
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const DATASETS_ENDPOINT = `${BACKEND_API_URL}/api/datasets`

// Fallback to external JSON API URL if backend is not available
const EXTERNAL_API_URL = 'https://publicdigitaltwin.s3.ap-southeast-1.amazonaws.com/project-ppp.json'

// Helper function to convert amount string to number
function parseAmount(amount: string | number): number {
  if (typeof amount === 'number') return amount
  if (!amount || amount === 'N/A') return 0
  
  // Extract numeric value
  const numericMatch = amount.toString().match(/[\d,]+/)
  if (numericMatch) {
    return parseInt(numericMatch[0].replace(/,/g, ''))
  }
  
  return 0
}

// Function to convert external JSON data to ProjectData
function convertExternalDataToProject(externalData: ProjectData, index: number): ProjectData {
  // Generate unique ID
  const id = (index + 1).toString()
  
  // Safely parse budget amount with fallback
  const budgetAmount = externalData.budget?.amount 
    ? parseAmount(externalData.budget.amount.amount)
    : 0
  const budgetCurrency = externalData.budget?.amount?.currency || 'THB'
  
  // Map parties to correct structure (ensure they have IDs)
  const parties = (externalData.parties || []).map((party, i) => ({
    name: party.name,
    id: party.id || `PARTY-${index}-${i}`,
    roles: party.roles || []
  }))
  
  return {
    id,
    updated: new Date().toISOString(),
    title: externalData.title,
    description: externalData.description || `${externalData.title} - ${externalData.businessGroup}`,
    status: externalData.status,
    period: {
      startDate: externalData.period?.startDate || new Date().toISOString().split('T')[0],
      endDate: externalData.period?.endDate || ''
    },
    type: externalData.type,
    purpose: externalData.purpose || '',
    businessGroup: externalData.businessGroup,
    ministry: externalData.ministry,
    sector: externalData.sector || [externalData.businessGroup || ''],
    locations: externalData.locations || [],
    publicAuthority: {
      name: externalData.publicAuthority?.name || '',
      id: externalData.publicAuthority?.id || ''
    },
    budget: {
      description: externalData.budget?.description || '',
      amount: {
        amount: budgetAmount,
        currency: budgetCurrency
      },
      requestDate: externalData.budget?.requestDate,
      approvalDate: externalData.budget?.approvalDate,
      budgetBreakdowns: externalData.budget?.budgetBreakdowns || [],
      finance: externalData.budget?.finance || []
    },
    parties,
    identificationPeriod: externalData.period?.endDate ? {
      startDate: externalData.period.startDate,
      endDate: externalData.period.endDate
    } : undefined,
    preparationPeriod: undefined,
    implementationPeriod: externalData.implementationPeriod?.startDate ? {
      startDate: externalData.implementationPeriod.startDate,
      endDate: externalData.implementationPeriod.endDate || ''
    } : undefined,
    completionPeriod: externalData.completionPeriod?.startDate ? {
      startDate: externalData.completionPeriod.startDate,
      endDate: externalData.completionPeriod.endDate || ''
    } : undefined,
    maintenancePeriod: externalData.maintenancePeriod?.startDate ? {
      startDate: externalData.maintenancePeriod.startDate,
      endDate: externalData.maintenancePeriod.endDate || ''
    } : undefined,
    decommissioningPeriod: externalData.decommissioningPeriod?.startDate ? {
      startDate: externalData.decommissioningPeriod.startDate,
      endDate: externalData.decommissioningPeriod.endDate || ''
    } : undefined,
    identifiers: externalData.identifiers || [],
    additionalClassifications: externalData.additionalClassifications || [],
    relatedProjects: undefined,
    assetLifetime: undefined,
    forecasts: externalData.forecasts || [],
    metrics: externalData.metrics || [],
    costMeasurements: undefined,
    contractingProcesses: undefined,
    milestones: externalData.milestones || [],
    transactions: undefined,
    completion: externalData.completion?.endDate ? {
      endDate: externalData.completion.endDate
    } : undefined,
    lobbyingMeetings: undefined,
    social: undefined,
    environment: undefined,
    policyAlignment: undefined,
    benefits: undefined,
    documents: undefined
  }
}

// Function to fetch projects from backend API
export async function fetchProjectsFromAPI(): Promise<ProjectData[]> {
  try {
    // Try backend API first
    const response = await fetch(DATASETS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: ProjectData[] = await response.json()
    
    // Backend already returns data in the correct format
    return data
  } catch (error) {
    console.error('Error fetching projects from backend API:', error)
    
    // Fallback to external API if backend fails
    try {
      console.log('Falling back to external API...')
      const response = await fetch(EXTERNAL_API_URL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const externalData: ProjectData[] = await response.json()
      
      // Convert external data to ProjectData format
      return externalData.map((project, index) => 
        convertExternalDataToProject(project, index)
      )
    } catch (fallbackError) {
      console.error('Error fetching projects from external API:', fallbackError)
      // Return empty array if both APIs fail
      return []
    }
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
export async function createProject(project: ProjectData): Promise<ProjectData | null> {
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
    return result.project
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

// Function to delete a project
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATASETS_ENDPOINT}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error)
    return false
  }
}

// Export the API URLs for reference
export { DATASETS_ENDPOINT, EXTERNAL_API_URL }
