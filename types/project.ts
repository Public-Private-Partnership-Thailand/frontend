// Based on schema.json structure

export interface Identifier {
  id: string;
  scheme: string;
}

export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface Gazetteer {
  scheme: string;
  identifiers: string[];
}

export interface Address {
  streetAddress?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  countryName: string;
}

export interface Location {
  id: string;
  description: string;
  geometry?: Geometry;
  gazetteer?: Gazetteer;
  address?: Address;
  uri?: string;
}

export interface PublicAuthority {
  name: string;
  id: string;
}

export interface Amount {
  amount: number;
  currency: string;
  amountFormatted?: string;
}

export interface BudgetBreakdownItem {
  id: string;
  description: string;
  amount: Amount;
  period?: {
    startDate: string;
    endDate: string;
  };
  sourceParty?: {
    name: string;
    id: string;
  };
}

export interface BudgetBreakdown {
  id: string;
  description: string;
  budgetBreakdown: BudgetBreakdownItem[];
}

export interface Finance {
  id: string;
  assetClass: string[];
  type: string;
  concessional: boolean;
  value: Amount;
  source: string;
  financingParty: {
    id: string;
    name: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  paymentPeriod?: {
    startDate: string;
    endDate: string;
  };
  interestRate?: {
    margin: number;
  };
  description?: string;
}

export interface Budget {
  description: string;
  amount: Amount;
  requestDate?: string;
  approvalDate?: string;
  budgetBreakdowns?: BudgetBreakdown[];
  finance?: Finance[];
}

export interface Period {
  startDate: string;
  endDate: string;
  durationInDays?: number;
  durationInMonths?: number;
}

export interface ContactPoint {
  name?: string;
  email?: string;
  telephone?: string;
  faxNumber?: string;
  url?: string;
}

export interface People {
  id: string;
  name: string;
  jobTitle?: string;
}

export interface Classification {
  id: string;
  scheme: string;
  description?: string;
}

export interface AdditionalIdentifier {
  scheme: string;
  legalName: string;
  id: string;
}

export interface BeneficialOwner {
  id: string;
  name: string;
  identifier?: {
    scheme: string;
    id: string;
  };
  nationalities?: string[];
  address?: Address;
  email?: string;
  faxNumber?: string;
  telephone?: string;
}

export interface Party {
  name: string;
  id: string;
  /** เอกชนคู่สัญญา: comma-separated names in legalName */
  identifier?: {
    scheme: string;
    legalName?: string;
    id: string;
    uri?: string;
  };
  additionalIdentifiers?: AdditionalIdentifier[];
  address?: Address;
  contactPoint?: ContactPoint;
  roles: string[];
  people?: People[];
  classifications?: Classification[];
  beneficialOwners?: BeneficialOwner[];
}

export interface Document {
  id: string;
  documentType: string;
  title: string;
  description?: string;
  url?: string;
  datePublished?: string;
  dateModified?: string;
  format?: string;
  language?: string;
  author?: string;
  pageStart?: string;
  pageEnd?: string;
  accessDetails?: string;
}

export interface Observation {
  id: string;
  measure: string;
  unit: {
    name: string;
    id: string;
    scheme: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface Forecast {
  id: string;
  title: string;
  observations: Observation[];
}

export interface Metric {
  id: string;
  title: string;
  observations: Observation[];
}

export interface RelatedProject {
  id: string;
  scheme: string;
  identifier: string;
  relationship: string;
  title: string;
}

export interface RiskFactorItem {
  /** Numeric ID referencing InfoData.riskFactor.id */
  risk_factor_id: number;
  factor_name: string;
}

export interface RiskCategoryDriver {
  /** Numeric ID referencing InfoData.riskCategory.id */
  risk_category_id: number;
  risk_category_code: string;
  category_name: string;
  driven_by_risk_factors: RiskFactorItem[];
}

/** Single mitigation / handling action */
export interface RiskMitigationItem {
  action: string;
  status: string; // 'planned' | 'in_progress' | 'done_or_selected' | 'rejected'
}

/** Single risk item */
export interface Risk {
  risk_id?: string;
  title: string;
  phase: string;
  description: string[];
  category_drivers: RiskCategoryDriver[];
  mitigation_handling: RiskMitigationItem[];
  impact_statement: string[];
}

/** @deprecated use RiskCategoryDriver */
export interface RiskCategoryEntry {
  category_id: string;
  risk_factors: string[];
}

export interface CostMeasurement {
  id: string;
  date: string;
  lifeCycleCosting?: {
    value: Amount;
  };
  costGroups?: any[];
}

export interface Completion {
  endDate: string;
  endDateDetails?: string;
  finalValue?: Amount;
  finalValueDetails?: string;
  finalScope?: string;
  finalScopeDetails?: string;
}

export interface ProjectData {
  id: string;
  identifiers?: Identifier[];
  updated: string;
  /** Display/sort date from API (e.g. summary `latestProjects`); prefer over `updated` when present. */
  date?: string;
  title: string;
  description: string;
  status: string;
  period: Period;
  identificationPeriod?: Period;
  preparationPeriod?: Period;
  implementationPeriod?: Period;
  completionPeriod?: Period;
  maintenancePeriod?: Period;
  decommissioningPeriod?: Period;
  sector: Classification[];
  additionalClassifications?: Classification[];
  type: string;
  purpose: string;
  relatedProjects?: RelatedProject[];
  assetLifetime?: {
    startDate: string;
    endDate: string;
    durationInDays: number;
  };
  locations: Location[];
  budget: Budget;
  parties: Party[];
  publicAuthority: PublicAuthority;
  documents?: Document[];
  forecasts?: Forecast[];
  metrics?: Metric[];
  costMeasurements?: CostMeasurement[];
  contractingProcesses?: any[];
  milestones?: any[];
  transactions?: any[];
  completion?: Completion;
  lobbyingMeetings?: any[];
  social?: any;
  environment?: any;
  policyAlignment?: any;
  benefits?: any[];
  risks?: Risk[];
}

export interface ProjectFormData extends Omit<ProjectData, 'id' | 'updated'> {
  // Form-specific fields can be added here if needed
}
