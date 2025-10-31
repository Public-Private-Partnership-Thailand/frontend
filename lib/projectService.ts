import { ProjectData } from '@/types/project'

// External JSON API URL
const API_URL = 'https://publicdigitaltwin.s3.ap-southeast-1.amazonaws.com/project-ppp.json'

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

// Function to fetch projects from external API
export async function fetchProjectsFromAPI(): Promise<ProjectData[]> {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const externalData: ProjectData[] = await response.json()
    
    // Convert external data to ProjectData format
    return externalData.map((project, index) => 
      convertExternalDataToProject(project, index)
    )
  } catch (error) {
    console.error('Error fetching projects from API:', error)
    // Return empty array if API fails
    return []
  }
}

// Export the API URL for reference
export { API_URL }
