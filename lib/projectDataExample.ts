/**
 * Example of how form data is transformed to backend structure
 * This demonstrates the complete structure with all required fields
 */

import { transformToBackendFormat } from './projectDataTransformer'
import { ProjectFormData } from '@/types/project'

/**
 * Example of minimal form data (user fills only required fields)
 */
const minimalFormData: ProjectFormData = {
  title: "Test Project",
  description: "Test project description",
  status: "planning",
  type: "expansion",
  purpose: "To test the system",
  period: {
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  },
  sector: ["transport"],
  locations: [],
  budget: {
    description: "Test budget",
    amount: {
      amount: 1000000,
      currency: "THB"
    }
  },
  parties: [],
  publicAuthority: {
    name: "Test Authority",
    id: "TA-001"
  }
}

/**
 * Transform and log the structure to console
 * This shows exactly what will be sent to the backend
 */
export function logExampleStructure() {
  console.log("=== MINIMAL FORM DATA ===")
  console.log(JSON.stringify(minimalFormData, null, 2))
  
  console.log("\n=== TRANSFORMED BACKEND DATA ===")
  const backendData = transformToBackendFormat(minimalFormData)
  console.log(JSON.stringify(backendData, null, 2))
  
  return backendData
}

/**
 * Full example matching the backend structure provided
 */
export const fullExampleData: ProjectFormData = {
  title: "M75 Junctions 4 to 5 upgrade smart motorway",
  description: "Upgrading the 5km stretch of the M75 near Birmingham Airport, between junction 4 near Patcham and junction 5 at Windlesham, to an all-lane running smart motorway.",
  status: "maintenance",
  type: "expansion",
  purpose: "To help support local economic growth and maintain mobility.",
  period: {
    startDate: "2016-01-01T00:00:00Z",
    endDate: "2018-12-10T00:00:00Z",
    durationInDays: 1074
  },
  identificationPeriod: {
    startDate: "2016-01-01T00:00:00Z",
    endDate: "2016-06-30T00:00:00Z"
  },
  preparationPeriod: {
    startDate: "2016-07-01T00:00:00Z",
    endDate: "2016-12-31T00:00:00Z"
  },
  implementationPeriod: {
    startDate: "2017-01-01T00:00:00Z",
    endDate: "2017-06-30T00:00:00Z"
  },
  completionPeriod: {
    startDate: "2017-07-01T00:00:00Z",
    endDate: "2017-12-31T00:00:00Z"
  },
  maintenancePeriod: {
    startDate: "2018-01-01T00:00:00Z",
    endDate: "2040-07-01T00:00:00Z"
  },
  decommissioningPeriod: {
    startDate: "2040-07-01T00:00:00Z",
    endDate: "2041-06-30T00:00:00Z"
  },
  sector: ["transport", "transport.road"],
  identifiers: [
    {
      id: "M75/SM/4-5",
      scheme: "internal"
    }
  ],
  additionalClassifications: [
    {
      scheme: "COFOG",
      id: "04.5.1",
      description: "Road transport (CS)"
    }
  ],
  relatedProjects: [
    {
      id: "1",
      scheme: "oc4ids",
      identifier: "oc4ids-bu3kcz-m75-junctions-4-to-5-construction",
      relationship: "construction",
      title: "Original construction of M75 J4-5"
    }
  ],
  assetLifetime: {
    startDate: "2018-07-01T00:00:00Z",
    endDate: "2040-07-01T00:00:00Z",
    durationInDays: 8027
  },
  locations: [
    {
      id: "001",
      description: "M75 J4 Patcham Interchange",
      geometry: {
        type: "Point",
        coordinates: [52.2571843, -0.1163333]
      },
      gazetteer: {
        scheme: "GEONAMES",
        identifiers: ["2657507"]
      },
      address: {
        streetAddress: "Patcham Interchange, New Road",
        locality: "Patcham",
        region: "Westshire",
        postalCode: "WS20 5TV",
        countryName: "United Kingdom"
      },
      uri: "https://www.openstreetmap.org/node/202995"
    }
  ],
  budget: {
    description: "Budget allocation for Motorways UK, aligned with the 2016-2018 strategic plan.",
    amount: {
      amount: 40000000,
      currency: "GBP"
    },
    requestDate: "2015-05-30T00:00:00Z",
    approvalDate: "2015-06-24T00:00:00Z",
    budgetBreakdowns: [
      {
        id: "1",
        description: "Breakdown by year of implementation",
        budgetBreakdown: [
          {
            id: "2016",
            description: "2016 budget allocation",
            amount: {
              amount: 10000000,
              currency: "GBP"
            },
            period: {
              startDate: "2016-01-01T00:00:00Z",
              endDate: "2016-12-31T00:00:00Z"
            },
            sourceParty: {
              name: "Motorways UK",
              id: "GB-GOR-XX1234"
            }
          }
        ]
      }
    ],
    finance: [
      {
        id: "1",
        assetClass: ["debt"],
        type: "loan",
        concessional: true,
        value: {
          amount: 50000000,
          currency: "USD"
        },
        source: "Green Climate Fund",
        financingParty: {
          id: "1",
          name: "United Nations Development Programme"
        },
        period: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2043-12-31T00:00:00Z"
        },
        paymentPeriod: {
          startDate: "2029-01-01T00:00:00Z",
          endDate: "2043-12-31T00:00:00Z"
        },
        interestRate: {
          margin: 0.0075
        },
        description: "Annual principal repayment years 11–20 (% of initial principal): 6.7%."
      }
    ]
  },
  parties: [
    {
      name: "Motorways UK",
      id: "GB-GOR-XX1234",
      identifier: {
        scheme: "GB-GOR",
        legalName: "Motorways UK",
        id: "XX1234",
        uri: "https://government-organisation.register.gov.uk/records/XX1234"
      },
      roles: ["procuringEntity", "buyer", "publicAuthority", "funder", "payee"]
    }
  ],
  publicAuthority: {
    name: "Motorways UK",
    id: "GB-GOR-XX1234"
  },
  documents: [
    {
      id: "plan-1234",
      documentType: "procurementPlan",
      title: "M75 Junction 4 to 5 Smart Motorway procurement plan.",
      description: "Procurement plan for the M75 Junction 4 to 5 Smart Motorway",
      url: "https://example.com/plan.pdf",
      datePublished: "2016-05-01T00:00:00Z",
      format: "application/pdf",
      language: "en",
      author: "Fred Consulter"
    }
  ],
  forecasts: [
    {
      id: "physicalProgress",
      title: "Physical progress",
      observations: [
        {
          id: "1",
          measure: "50",
          unit: {
            name: "percent",
            id: "P1",
            scheme: "UNCEFACT"
          },
          period: {
            startDate: "2018-01-07T00:00:00Z",
            endDate: "2018-01-07T00:00:00Z"
          }
        }
      ]
    }
  ],
  metrics: [
    {
      id: "physicalProgress",
      title: "Physical progress",
      observations: [
        {
          id: "1",
          measure: "50",
          unit: {
            name: "percent",
            id: "P1",
            scheme: "UNCEFACT"
          },
          period: {
            startDate: "2018-01-07T00:00:00Z",
            endDate: "2018-01-07T00:00:00Z"
          }
        }
      ]
    }
  ],
  milestones: [
    {
      id: "1",
      title: "Grant disbursement",
      status: "met",
      dueDate: "2016-01-01T00:00:00Z",
      dateMet: "2016-01-01T00:00:00Z",
      type: "payment"
    }
  ],
  completion: {
    endDate: "2018-12-10T00:00:00Z",
    endDateDetails: "Construction was delayed due to excavation problems"
  }
}

/**
 * Log the full example structure
 */
export function logFullExampleStructure() {
  console.log("=== FULL FORM DATA EXAMPLE ===")
  console.log(JSON.stringify(fullExampleData, null, 2))
  
  console.log("\n=== TRANSFORMED BACKEND DATA (FULL) ===")
  const backendData = transformToBackendFormat(fullExampleData)
  console.log(JSON.stringify(backendData, null, 2))
  
  return backendData
}

/**
 * Validates that all required fields are present in the backend data
 */
export function validateBackendStructure(data: any): { valid: boolean; missing: string[] } {
  const requiredFields = [
    'identifiers',
    'updated',
    'title',
    'description',
    'status',
    'period',
    'sector',
    'additionalClassifications',
    'type',
    'purpose',
    'relatedProjects',
    'locations',
    'budget',
    'costMeasurements',
    'parties',
    'publicAuthority',
    'documents',
    'forecasts',
    'metrics',
    'contractingProcesses',
    'milestones',
    'transactions',
    'lobbyingMeetings',
    'benefits'
  ]
  
  const missing: string[] = []
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      missing.push(field)
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  }
}

