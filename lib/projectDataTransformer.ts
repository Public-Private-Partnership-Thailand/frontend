/**
 * Transforms form data into the complete backend structure
 * Ensures all fields are present with empty strings ("") when not filled
 */

import { ProjectFormData } from '@/types/project'

export interface BackendProjectData {
  identifiers: Array<{
    id: string
    scheme: string
  }>
  updated: string
  title: string
  description: string
  status: string
  period: {
    startDate: string
    endDate: string
    durationInDays?: number
  }
  identificationPeriod?: {
    startDate: string
    endDate: string
  }
  preparationPeriod?: {
    startDate: string
    endDate: string
  }
  implementationPeriod?: {
    startDate: string
    endDate: string
  }
  completionPeriod?: {
    startDate: string
    endDate: string
  }
  maintenancePeriod?: {
    startDate: string
    endDate: string
  }
  decommissioningPeriod?: {
    startDate: string
    endDate: string
  }
  sector: string[]
  additionalClassifications: Array<{
    scheme: string
    id: string
    description: string
  }>
  type: string
  purpose: string
  relatedProjects: Array<{
    id: string
    scheme: string
    identifier: string
    relationship: string
    title: string
  }>
  assetLifetime?: {
    startDate: string
    endDate: string
    durationInDays: number
  }
  locations: Array<{
    id: string
    description: string
    geometry?: {
      type: string
      coordinates: number[]
    }
    gazetteer?: {
      scheme: string
      identifiers: string[]
    }
    address?: {
      streetAddress?: string
      locality?: string
      region?: string
      postalCode?: string
      countryName: string
    }
    uri?: string
  }>
  budget: {
    description: string
    amount: {
      amount: number
      currency: string
    }
    requestDate?: string
    approvalDate?: string
    budgetBreakdowns?: Array<{
      id: string
      description: string
      budgetBreakdown: Array<{
        id: string
        description: string
        amount: {
          amount: number
          currency: string
        }
        period?: {
          startDate: string
          endDate: string
        }
        sourceParty?: {
          name: string
          id: string
        }
      }>
    }>
    finance?: Array<{
      id: string
      assetClass: string[]
      type: string
      concessional: boolean
      value: {
        amount: number
        currency: string
      }
      source: string
      financingParty: {
        id: string
        name: string
      }
      period: {
        startDate: string
        endDate: string
      }
      paymentPeriod?: {
        startDate: string
        endDate: string
      }
      interestRate?: {
        margin: number
      }
      description?: string
    }>
  }
  costMeasurements: Array<{
    id: string
    date: string
    lifeCycleCosting?: {
      value: {
        amount: number
        currency: string
      }
    }
    costGroups?: Array<{
      id: string
      category: string
      costs: Array<{
        id: string
        value: {
          amount: number
          currency: string
        }
        classification?: {
          id: string
          scheme: string
          description: string
        }
      }>
    }>
  }>
  parties: Array<{
    name: string
    id: string
    identifier?: {
      scheme: string
      legalName?: string
      id: string
      uri?: string
    }
    additionalIdentifiers?: Array<{
      scheme: string
      legalName: string
      id: string
    }>
    address?: {
      postalCode?: string
      countryName?: string
      streetAddress?: string
      region?: string
      locality?: string
    }
    contactPoint?: {
      name?: string
      email?: string
      telephone?: string
      faxNumber?: string
      url?: string
    }
    roles: string[]
    people?: Array<{
      id: string
      name: string
      jobTitle?: string
    }>
    classifications?: Array<{
      id: string
      scheme: string
    }>
    beneficialOwners?: Array<{
      id: string
      name: string
      identifier?: {
        scheme: string
        id: string
      }
      nationalities?: string[]
      address?: {
        streetAddress?: string
        locality?: string
        region?: string
        postalCode?: string
        countryName?: string
      }
      email?: string
      faxNumber?: string
      telephone?: string
    }>
  }>
  publicAuthority: {
    name: string
    id: string
  }
  documents: Array<{
    id: string
    documentType: string
    title: string
    description?: string
    url?: string
    datePublished?: string
    dateModified?: string
    format?: string
    language?: string
    author?: string
    pageStart?: string
    pageEnd?: string
    accessDetails?: string
  }>
  forecasts: Array<{
    id: string
    title: string
    observations: Array<{
      id: string
      measure: string
      unit: {
        name: string
        id: string
        scheme: string
      }
      period: {
        startDate: string
        endDate: string
      }
    }>
  }>
  metrics: Array<{
    id: string
    title: string
    observations: Array<{
      id: string
      measure: string
      unit: {
        name: string
        id: string
        scheme: string
      }
      period: {
        startDate: string
        endDate: string
      }
    }>
  }>
  contractingProcesses: Array<{
    id: string
    summary: {
      ocid: string
      externalReference: string
      nature: string[]
      title: string
      description: string
      status: string
      tender?: {
        procurementMethod?: string
        procurementMethodDetails?: string
        datePublished?: string
        costEstimate?: {
          amount: number
          currency: string
        }
        numberOfTenderers?: number
        tenderers?: Array<{
          name: string
          id: string
        }>
        procuringEntity?: {
          name: string
          id: string
        }
        administrativeEntity?: {
          name: string
          id: string
        }
        sustainability?: Array<{
          strategies: string[]
        }>
      }
      suppliers?: Array<{
        name: string
        id: string
      }>
      contractValue?: {
        amount: number
        currency: string
      }
      contractPeriod?: {
        startDate: string
        endDate: string
      }
      finalValue?: {
        amount: number
        currency: string
      }
      milestones?: Array<{
        id: string
        title: string
        status: string
        dueDate?: string
        dateMet?: string
        type: string
        value?: {
          amount: number
          currency: string
        }
      }>
      transactions?: Array<{
        id: string
        source?: string
        date: string
        value: {
          amount: number
          currency: string
        }
        payer?: {
          id: string
          name: string
        }
        payee?: {
          name: string
          id: string
        }
        uri?: string
        relatedImplementationMilestone?: {
          id: string
          title: string
        }
      }>
      documents?: Array<{
        id: string
        documentType: string
        title: string
        description?: string
        url?: string
        datePublished?: string
        dateModified?: string
        format?: string
        language?: string
        accessDetails?: string
        author?: string
      }>
      modifications?: Array<{
        id: string
        date: string
        description: string
        rationale: string
        type: string
        releaseID: string
        oldContractPeriod?: {
          startDate: string
          endDate: string
        }
        newContractPeriod?: {
          startDate: string
          endDate: string
        }
        oldContractValue?: {
          amount: number
          currency: string
        }
        newContractValue?: {
          amount: number
          currency: string
        }
      }>
      social?: {
        laborBudget?: {
          amount: number
          currency: string
        }
        laborObligations?: {
          obligations: string[]
          description: string
        }
      }
    }
    releases: Array<{
      id: string
      date: string
      tag: string[]
      url: string
    }>
  }>
  milestones: Array<{
    id: string
    title: string
    status: string
    dueDate?: string
    dateMet?: string
    type: string
    value?: {
      amount: number
      currency: string
    }
  }>
  transactions: Array<{
    id: string
    date: string
    value: {
      amount: number
      currency: string
    }
    payer?: {
      id: string
      name: string
    }
    payee?: {
      id: string
      name: string
    }
    relatedImplementationMilestone?: {
      id: string
      title: string
    }
  }>
  completion?: {
    endDate: string
    endDateDetails?: string
    finalValue?: {
      amount: number
      currency: string
    }
    finalValueDetails?: string
    finalScope?: string
    finalScopeDetails?: string
  }
  lobbyingMeetings: Array<{
    id: string
    date: string
    address?: {
      streetAddress?: string
      locality?: string
      region?: string
      postalCode?: string
      countryName?: string
    }
    numberOfParticipants?: number
    publicOffice?: {
      person?: {
        name: string
      }
      organization?: {
        name: string
        id: string
      }
      jobTitle?: string
    }
  }>
  social?: {
    consultationMeetings?: Array<{
      id: string
      address?: {
        streetAddress?: string
        locality?: string
        region?: string
        postalCode?: string
        countryName?: string
      }
      date: string
      numberOfParticipants?: number
      publicOffice?: {
        person?: {
          name: string
        }
        organization?: {
          name: string
          id: string
        }
        jobTitle?: string
      }
    }>
    landCompensationBudget?: {
      amount: number
      currency: string
    }
    inIndigenousLand?: boolean
    healthAndSafety?: {
      materialTests?: {
        tests: string[]
        description: string
      }
    }
  }
  environment?: {
    goals?: string[]
    conservationMeasures?: Array<{
      type: string
      description: string
    }>
    environmentalMeasures?: Array<{
      type: string
      description: string
    }>
    climateOversightTypes?: string[]
    hasImpactAssessment?: boolean
    impactCategories?: Array<{
      scheme: string
      id: string
    }>
    abatementCost?: {
      amount: number
      currency: string
    }
    inProtectedArea?: boolean
    climateMeasures?: Array<{
      type: string[]
      description: string
    }>
  }
  policyAlignment?: {
    policies: string[]
    description: string
  }
  benefits: Array<{
    title: string
    description: string
    beneficiaries?: Array<{
      description: string
      numberOfPeople?: number
      location?: {
        id: string
        address?: {
          countryName: string
        }
      }
    }>
  }>
}

/**
 * Transforms form data to complete backend structure
 * All optional fields will be included with empty strings or empty arrays
 */
export function transformToBackendFormat(formData: ProjectFormData): BackendProjectData {
  return {
    // Identifiers
    identifiers: Array.isArray(formData.identifiers) && formData.identifiers.length > 0
      ? formData.identifiers.map(id => ({
          id: id?.id || "",
          scheme: id?.scheme || ""
        }))
      : [],

    // Basic info
    updated: new Date().toISOString(),
    title: formData.title || "",
    description: formData.description || "",
    status: formData.status || "",
    
    // Main period
    period: {
      startDate: formData.period?.startDate || "",
      endDate: formData.period?.endDate || "",
      durationInDays: formData.period?.durationInDays
    },

    // Project lifecycle periods
    identificationPeriod: formData.identificationPeriod ? {
      startDate: formData.identificationPeriod.startDate || "",
      endDate: formData.identificationPeriod.endDate || ""
    } : undefined,

    preparationPeriod: formData.preparationPeriod ? {
      startDate: formData.preparationPeriod.startDate || "",
      endDate: formData.preparationPeriod.endDate || ""
    } : undefined,

    implementationPeriod: formData.implementationPeriod ? {
      startDate: formData.implementationPeriod.startDate || "",
      endDate: formData.implementationPeriod.endDate || ""
    } : undefined,

    completionPeriod: formData.completionPeriod ? {
      startDate: formData.completionPeriod.startDate || "",
      endDate: formData.completionPeriod.endDate || ""
    } : undefined,

    maintenancePeriod: formData.maintenancePeriod ? {
      startDate: formData.maintenancePeriod.startDate || "",
      endDate: formData.maintenancePeriod.endDate || ""
    } : undefined,

    decommissioningPeriod: formData.decommissioningPeriod ? {
      startDate: formData.decommissioningPeriod.startDate || "",
      endDate: formData.decommissioningPeriod.endDate || ""
    } : undefined,

    // Sector
    sector: Array.isArray(formData.sector) ? formData.sector.filter(s => s) : [],

    // Classifications
    additionalClassifications: Array.isArray(formData.additionalClassifications) && formData.additionalClassifications.length > 0
      ? formData.additionalClassifications.map(c => ({
          scheme: typeof c === 'object' && c !== null ? (c.scheme || "") : "",
          id: typeof c === 'object' && c !== null ? (c.id || "") : "",
          description: typeof c === 'object' && c !== null ? (c.description || "") : ""
        }))
      : [],

    type: formData.type || "",
    purpose: formData.purpose || "",

    // Related projects
    relatedProjects: Array.isArray(formData.relatedProjects) && formData.relatedProjects.length > 0
      ? formData.relatedProjects.map(rp => ({
          id: rp?.id || "",
          scheme: rp?.scheme || "",
          identifier: rp?.identifier || "",
          relationship: rp?.relationship || "",
          title: rp?.title || ""
        }))
      : [],

    // Asset lifetime
    assetLifetime: formData.assetLifetime ? {
      startDate: formData.assetLifetime.startDate || "",
      endDate: formData.assetLifetime.endDate || "",
      durationInDays: formData.assetLifetime.durationInDays || 0
    } : undefined,

    // Locations
    locations: Array.isArray(formData.locations) && formData.locations.length > 0
      ? formData.locations.map((loc, idx) => {
          if (typeof loc === 'string') {
            return {
              id: String(idx + 1),
              description: loc,
              geometry: undefined,
              gazetteer: undefined,
              address: undefined,
              uri: undefined
            }
          }
          return {
            id: loc?.id || String(idx + 1),
            description: loc?.description || "",
            geometry: loc?.geometry ? {
              type: loc.geometry.type || "",
              coordinates: Array.isArray(loc.geometry.coordinates) ? loc.geometry.coordinates : []
            } : undefined,
            gazetteer: loc?.gazetteer ? {
              scheme: loc.gazetteer.scheme || "",
              identifiers: Array.isArray(loc.gazetteer.identifiers) ? loc.gazetteer.identifiers : []
            } : undefined,
            address: loc?.address ? {
              streetAddress: loc.address.streetAddress || undefined,
              locality: loc.address.locality || undefined,
              region: loc.address.region || undefined,
              postalCode: loc.address.postalCode || undefined,
              countryName: loc.address.countryName || ""
            } : undefined,
            uri: loc?.uri || undefined
          }
        })
      : [],

    // Budget
    budget: {
      description: formData.budget?.description || "",
      amount: {
        amount: formData.budget?.amount?.amount || 0,
        currency: formData.budget?.amount?.currency || ""
      },
      requestDate: formData.budget?.requestDate || undefined,
      approvalDate: formData.budget?.approvalDate || undefined,
      budgetBreakdowns: Array.isArray(formData.budget?.budgetBreakdowns) && formData.budget.budgetBreakdowns.length > 0
        ? formData.budget.budgetBreakdowns.map(bb => ({
            id: bb?.id || "",
            description: bb?.description || "",
            budgetBreakdown: Array.isArray(bb?.budgetBreakdown) && bb.budgetBreakdown.length > 0
              ? bb.budgetBreakdown.map(item => ({
                  id: item?.id || "",
                  description: item?.description || "",
                  amount: {
                    amount: item?.amount?.amount || 0,
                    currency: item?.amount?.currency || ""
                  },
                  period: item?.period ? {
                    startDate: item.period.startDate || "",
                    endDate: item.period.endDate || ""
                  } : undefined,
                  sourceParty: item?.sourceParty ? {
                    name: item.sourceParty.name || "",
                    id: item.sourceParty.id || ""
                  } : undefined
                }))
              : []
          }))
        : undefined,
      finance: Array.isArray(formData.budget?.finance) && formData.budget.finance.length > 0
        ? formData.budget.finance.map(f => ({
            id: f?.id || "",
            assetClass: Array.isArray(f?.assetClass) ? f.assetClass : [],
            type: f?.type || "",
            concessional: f?.concessional || false,
            value: {
              amount: f?.value?.amount || 0,
              currency: f?.value?.currency || ""
            },
            source: f?.source || "",
            financingParty: {
              id: f?.financingParty?.id || "",
              name: f?.financingParty?.name || ""
            },
            period: {
              startDate: f?.period?.startDate || "",
              endDate: f?.period?.endDate || ""
            },
            paymentPeriod: f?.paymentPeriod ? {
              startDate: f.paymentPeriod.startDate || "",
              endDate: f.paymentPeriod.endDate || ""
            } : undefined,
            interestRate: f?.interestRate ? {
              margin: f.interestRate.margin || 0
            } : undefined,
            description: f?.description || undefined
          }))
        : undefined
    },

    // Cost measurements
    costMeasurements: Array.isArray(formData.costMeasurements) && formData.costMeasurements.length > 0
      ? formData.costMeasurements.map(cm => ({
          id: cm?.id || "",
          date: cm?.date || "",
          lifeCycleCosting: cm?.lifeCycleCosting ? {
            value: {
              amount: cm.lifeCycleCosting.value?.amount || 0,
              currency: cm.lifeCycleCosting.value?.currency || ""
            }
          } : undefined,
          costGroups: cm?.costGroups || undefined
        }))
      : [],

    // Parties
    parties: Array.isArray(formData.parties) && formData.parties.length > 0
      ? formData.parties.map(p => ({
          name: p?.name || "",
          id: p?.id || "",
          identifier: p?.identifier ? {
            scheme: p.identifier.scheme || "",
            legalName: p.identifier.legalName || undefined,
            id: p.identifier.id || "",
            uri: p.identifier.uri || undefined
          } : undefined,
          additionalIdentifiers: Array.isArray(p?.additionalIdentifiers) && p.additionalIdentifiers.length > 0
            ? p.additionalIdentifiers.map(ai => ({
                scheme: ai?.scheme || "",
                legalName: ai?.legalName || "",
                id: ai?.id || ""
              }))
            : undefined,
          address: p?.address ? {
            postalCode: p.address.postalCode || undefined,
            countryName: p.address.countryName || undefined,
            streetAddress: p.address.streetAddress || undefined,
            region: p.address.region || undefined,
            locality: p.address.locality || undefined
          } : undefined,
          contactPoint: p?.contactPoint ? {
            name: p.contactPoint.name || undefined,
            email: p.contactPoint.email || undefined,
            telephone: p.contactPoint.telephone || undefined,
            faxNumber: p.contactPoint.faxNumber || undefined,
            url: p.contactPoint.url || undefined
          } : undefined,
          roles: Array.isArray(p?.roles) ? p.roles.filter(r => r) : [],
          people: Array.isArray(p?.people) && p.people.length > 0
            ? p.people.map(person => ({
                id: person?.id || "",
                name: person?.name || "",
                jobTitle: person?.jobTitle || undefined
              }))
            : undefined,
          classifications: Array.isArray(p?.classifications) && p.classifications.length > 0
            ? p.classifications.map(c => ({
                id: c?.id || "",
                scheme: c?.scheme || ""
              }))
            : undefined,
          beneficialOwners: Array.isArray(p?.beneficialOwners) && p.beneficialOwners.length > 0
            ? p.beneficialOwners.map(bo => ({
                id: bo?.id || "",
                name: bo?.name || "",
                identifier: bo?.identifier ? {
                  scheme: bo.identifier.scheme || "",
                  id: bo.identifier.id || ""
                } : undefined,
                nationalities: Array.isArray(bo?.nationalities) ? bo.nationalities : undefined,
                address: bo?.address ? {
                  streetAddress: bo.address.streetAddress || undefined,
                  locality: bo.address.locality || undefined,
                  region: bo.address.region || undefined,
                  postalCode: bo.address.postalCode || undefined,
                  countryName: bo.address.countryName || undefined
                } : undefined,
                email: bo?.email || undefined,
                faxNumber: bo?.faxNumber || undefined,
                telephone: bo?.telephone || undefined
              }))
            : undefined
        }))
      : [],

    // Public authority
    publicAuthority: {
      name: formData.publicAuthority?.name || "",
      id: formData.publicAuthority?.id || ""
    },

    // Documents
    documents: Array.isArray(formData.documents) && formData.documents.length > 0
      ? formData.documents.map(doc => ({
          id: doc?.id || "",
          documentType: doc?.documentType || "",
          title: doc?.title || "",
          description: doc?.description || undefined,
          url: doc?.url || undefined,
          datePublished: doc?.datePublished || undefined,
          dateModified: doc?.dateModified || undefined,
          format: doc?.format || undefined,
          language: doc?.language || undefined,
          author: doc?.author || undefined,
          pageStart: doc?.pageStart || undefined,
          pageEnd: doc?.pageEnd || undefined,
          accessDetails: doc?.accessDetails || undefined
        }))
      : [],

    // Forecasts
    forecasts: Array.isArray(formData.forecasts) && formData.forecasts.length > 0
      ? formData.forecasts.map(f => {
          if (typeof f === 'string') {
            return {
              id: "",
              title: f,
              observations: []
            }
          }
          return {
            id: f?.id || "",
            title: f?.title || "",
            observations: Array.isArray(f?.observations) && f.observations.length > 0
              ? f.observations.map(obs => ({
                  id: obs?.id || "",
                  measure: obs?.measure || "",
                  unit: {
                    name: obs?.unit?.name || "",
                    id: obs?.unit?.id || "",
                    scheme: obs?.unit?.scheme || ""
                  },
                  period: {
                    startDate: obs?.period?.startDate || "",
                    endDate: obs?.period?.endDate || ""
                  }
                }))
              : []
          }
        })
      : [],

    // Metrics
    metrics: Array.isArray(formData.metrics) && formData.metrics.length > 0
      ? formData.metrics.map(m => {
          if (typeof m === 'string') {
            return {
              id: "",
              title: m,
              observations: []
            }
          }
          return {
            id: m?.id || "",
            title: m?.title || "",
            observations: Array.isArray(m?.observations) && m.observations.length > 0
              ? m.observations.map(obs => ({
                  id: obs?.id || "",
                  measure: obs?.measure || "",
                  unit: {
                    name: obs?.unit?.name || "",
                    id: obs?.unit?.id || "",
                    scheme: obs?.unit?.scheme || ""
                  },
                  period: {
                    startDate: obs?.period?.startDate || "",
                    endDate: obs?.period?.endDate || ""
                  }
                }))
              : []
          }
        })
      : [],

    // Contracting processes
    contractingProcesses: Array.isArray(formData.contractingProcesses) && formData.contractingProcesses.length > 0
      ? formData.contractingProcesses.map(cp => ({
          id: cp?.id || "",
          summary: {
            ocid: cp?.summary?.ocid || "",
            externalReference: cp?.summary?.externalReference || "",
            nature: Array.isArray(cp?.summary?.nature) ? cp.summary.nature : [],
            title: cp?.summary?.title || "",
            description: cp?.summary?.description || "",
            status: cp?.summary?.status || "",
            tender: cp?.summary?.tender || undefined,
            suppliers: cp?.summary?.suppliers || undefined,
            contractValue: cp?.summary?.contractValue || undefined,
            contractPeriod: cp?.summary?.contractPeriod || undefined,
            finalValue: cp?.summary?.finalValue || undefined,
            milestones: cp?.summary?.milestones || undefined,
            transactions: cp?.summary?.transactions || undefined,
            documents: cp?.summary?.documents || undefined,
            modifications: cp?.summary?.modifications || undefined,
            social: cp?.summary?.social || undefined
          },
          releases: Array.isArray(cp?.releases) && cp.releases.length > 0
            ? cp.releases.map((r: any) => ({
                id: r?.id || "",
                date: r?.date || "",
                tag: Array.isArray(r?.tag) ? r.tag : [],
                url: r?.url || ""
              }))
            : []
        }))
      : [],

    // Milestones
    milestones: Array.isArray(formData.milestones) && formData.milestones.length > 0
      ? formData.milestones.map(m => ({
          id: m?.id || "",
          title: m?.title || "",
          status: m?.status || "",
          dueDate: m?.dueDate || undefined,
          dateMet: m?.dateMet || undefined,
          type: m?.type || m?.code || "",
          value: m?.value ? {
            amount: m.value.amount || 0,
            currency: m.value.currency || ""
          } : undefined
        }))
      : [],

    // Transactions
    transactions: Array.isArray(formData.transactions) && formData.transactions.length > 0
      ? formData.transactions.map(t => ({
          id: t?.id || "",
          date: t?.date || "",
          value: {
            amount: t?.value?.amount || 0,
            currency: t?.value?.currency || ""
          },
          payer: t?.payer ? {
            id: t.payer.id || "",
            name: t.payer.name || ""
          } : undefined,
          payee: t?.payee ? {
            id: t.payee.id || "",
            name: t.payee.name || ""
          } : undefined,
          relatedImplementationMilestone: t?.relatedImplementationMilestone || undefined
        }))
      : [],

    // Completion
    completion: formData.completion ? {
      endDate: formData.completion.endDate || "",
      endDateDetails: formData.completion.endDateDetails || undefined,
      finalValue: formData.completion.finalValue ? {
        amount: formData.completion.finalValue.amount || 0,
        currency: formData.completion.finalValue.currency || ""
      } : undefined,
      finalValueDetails: formData.completion.finalValueDetails || undefined,
      finalScope: formData.completion.finalScope || undefined,
      finalScopeDetails: formData.completion.finalScopeDetails || undefined
    } : undefined,

    // Lobbying meetings
    lobbyingMeetings: Array.isArray(formData.lobbyingMeetings) && formData.lobbyingMeetings.length > 0
      ? formData.lobbyingMeetings.map(lm => ({
          id: lm?.id || "",
          date: lm?.date || "",
          address: lm?.address || undefined,
          numberOfParticipants: lm?.numberOfParticipants || undefined,
          publicOffice: lm?.publicOffice || undefined
        }))
      : [],

    // Social
    social: formData.social ? {
      consultationMeetings: formData.social.consultationMeetings || undefined,
      landCompensationBudget: formData.social.landCompensationBudget || undefined,
      inIndigenousLand: formData.social.inIndigenousLand || undefined,
      healthAndSafety: formData.social.healthAndSafety || undefined
    } : undefined,

    // Environment
    environment: formData.environment ? {
      goals: formData.environment.goals || undefined,
      conservationMeasures: formData.environment.conservationMeasures || undefined,
      environmentalMeasures: formData.environment.environmentalMeasures || undefined,
      climateOversightTypes: formData.environment.climateOversightTypes || undefined,
      hasImpactAssessment: formData.environment.hasImpactAssessment || undefined,
      impactCategories: formData.environment.impactCategories || undefined,
      abatementCost: formData.environment.abatementCost || undefined,
      inProtectedArea: formData.environment.inProtectedArea || undefined,
      climateMeasures: formData.environment.climateMeasures || undefined
    } : undefined,

    // Policy alignment
    policyAlignment: formData.policyAlignment ? {
      policies: Array.isArray(formData.policyAlignment.policies) ? formData.policyAlignment.policies : [],
      description: formData.policyAlignment.description || ""
    } : undefined,

    // Benefits
    benefits: Array.isArray(formData.benefits) && formData.benefits.length > 0
      ? formData.benefits.map(b => ({
          title: b?.title || "",
          description: b?.description || "",
          beneficiaries: b?.beneficiaries || undefined
        }))
      : []
  }
}

