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
  }
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = projects.find(p => p.id === params.id)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const projectIndex = projects.findIndex(p => p.id === params.id)
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Update project with new data
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...body,
      id: params.id, // Ensure ID doesn't change
      updated: new Date().toISOString()
    }
    
    return NextResponse.json(projects[projectIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectIndex = projects.findIndex(p => p.id === params.id)
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    projects.splice(projectIndex, 1)
    
    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
