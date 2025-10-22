import { NextRequest, NextResponse } from 'next/server'
import { ProjectData } from '@/types/project'

// Mock data storage (in a real app, this would be a database)
let projects: ProjectData[] = [
  {
    id: '1',
    updated: new Date().toISOString(),
    language: 'th',
    identifiers: ['PROJ-001'],
    publicAuthority: {
      n: 'Ministry of Digital Economy and Society',
      r: 'MDES-2024-001'
    },
    title: 'Digital Infrastructure Development Project',
    description: 'A comprehensive project to develop digital infrastructure across Thailand, focusing on broadband connectivity and digital services.',
    budget: {
      description: 'Infrastructure development budget allocation',
      amount: {
        n: 5000000000,
        r: 4500000000,
        t: 'THB',
        request: '2024-01-15T00:00:00Z',
        approval: '2024-02-01T00:00:00Z'
      },
      breakdown: [
        {
          bt: 'Infrastructure',
          br: ['Fiber optic cables', 'Network equipment', 'Installation costs']
        },
        {
          bt: 'Personnel',
          br: ['Project managers', 'Technical staff', 'Support personnel']
        }
      ],
      financing: ['Government budget', 'Private sector partnership']
    },
    period: {
      startDate: '2024-03-01T00:00:00Z',
      endDate: '2026-12-31T00:00:00Z',
      durationInMonths: 34
    },
    implementationPeriod: {
      startDate: '2024-03-01T00:00:00Z',
      endDate: '2026-06-30T00:00:00Z'
    },
    completionPeriod: {
      startDate: '2026-07-01T00:00:00Z',
      endDate: '2026-12-31T00:00:00Z'
    },
    maintenancePeriod: {},
    decommissioningPeriod: {},
    locations: ['Bangkok', 'Chiang Mai', 'Phuket', 'Khon Kaen'],
    status: 'active',
    type: 'Infrastructure',
    sector: ['Technology', 'Telecommunications'],
    purpose: 'Digital transformation and connectivity improvement',
    additionalClassifications: ['Public Infrastructure', 'Digital Services'],
    parties: [
      {
        name: 'Ministry of Digital Economy and Society',
        id: 'MDES-001',
        identifier: {
          Scheme: 'Government',
          id: 'MDES-001',
          LegalName: 'Ministry of Digital Economy and Society',
          URI: 'https://www.mdes.go.th'
        },
        additionalIdentifiers: ['Government Agency']
      }
    ],
    assetLifetime: {},
    forecasts: ['Increased internet penetration', 'Improved digital services'],
    metrics: ['Coverage percentage', 'User satisfaction', 'Network speed'],
    milestones: ['Phase 1 completion', 'Phase 2 completion', 'Final deployment'],
    completion: {
      endDate: '',
      endDateDetails: {},
      finalValue: {},
      finalValueDetails: {}
    },
    Documents: []
  },
  {
    id: '2',
    updated: new Date().toISOString(),
    language: 'en',
    identifiers: ['PROJ-002'],
    publicAuthority: {
      n: 'Department of Transportation',
      r: 'DOT-2024-002'
    },
    title: 'Smart City Transportation System',
    description: 'Implementation of smart traffic management and public transportation systems in major cities.',
    budget: {
      description: 'Smart transportation infrastructure budget',
      amount: {
        n: 2000000000,
        r: 1800000000,
        t: 'THB',
        request: '2024-02-01T00:00:00Z',
        approval: '2024-02-15T00:00:00Z'
      },
      breakdown: [
        {
          bt: 'Technology',
          br: ['Traffic sensors', 'Control systems', 'Software development']
        }
      ],
      financing: ['Government funding', 'International grants']
    },
    period: {
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2025-12-31T00:00:00Z',
      durationInMonths: 21
    },
    implementationPeriod: {},
    completionPeriod: {},
    maintenancePeriod: {},
    decommissioningPeriod: {},
    locations: ['Bangkok Metropolitan Area'],
    status: 'planning',
    type: 'Smart City',
    sector: ['Transportation', 'Technology'],
    purpose: 'Improve urban mobility and traffic efficiency',
    additionalClassifications: ['Smart City Initiative'],
    parties: [
      {
        name: 'Department of Transportation',
        id: 'DOT-001',
        identifier: {
          Scheme: 'Government',
          id: 'DOT-001',
          LegalName: 'Department of Transportation',
          URI: 'https://www.dot.go.th'
        },
        additionalIdentifiers: ['Government Agency']
      }
    ],
    assetLifetime: {},
    forecasts: ['Reduced traffic congestion', 'Improved public transport efficiency'],
    metrics: ['Traffic flow improvement', 'User satisfaction', 'System reliability'],
    milestones: ['System design', 'Pilot implementation', 'Full deployment'],
    completion: {
      endDate: '',
      endDateDetails: {},
      finalValue: {},
      finalValueDetails: {}
    },
    Documents: []
  }
]

export async function GET() {
  try {
    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Generate new ID and timestamp
    const newProject: ProjectData = {
      ...body,
      id: (projects.length + 1).toString(),
      updated: new Date().toISOString()
    }
    
    projects.push(newProject)
    
    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
