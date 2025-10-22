export interface PublicAuthority {
  n: string;
  r: string;
}

export interface Amount {
  n: number;
  r: number;
  t: string;
  request: string; // date-time
  approval: string; // date-time
}

export interface BudgetBreakdown {
  bt: string;
  br: string[];
}

export interface Budget {
  description: string;
  amount: Amount;
  breakdown: BudgetBreakdown[];
  financing: string[];
}

export interface Period {
  startDate: string; // date-time
  endDate: string; // date-time
  durationInMonths: number;
}

export interface Identifier {
  Scheme: string;
  id: string;
  LegalName: string;
  URI: string;
}

export interface Party {
  name: string;
  id: string;
  identifier: Identifier;
  additionalIdentifiers: string[];
}

export interface Completion {
  endDate: string; // date-time
  endDateDetails: Record<string, any>;
  finalValue: Record<string, any>;
  finalValueDetails: Record<string, any>;
}

export interface ProjectData {
  id: string;
  updated: string; // date-time
  language: string;
  identifiers: string[];
  publicAuthority: PublicAuthority;
  title: string;
  description: string;
  budget: Budget;
  period: Period;
  implementationPeriod: Record<string, any>;
  completionPeriod: Record<string, any>;
  maintenancePeriod: Record<string, any>;
  decommissioningPeriod: Record<string, any>;
  locations: string[];
  status: string;
  type: string;
  sector: string[];
  purpose: string;
  additionalClassifications: string[];
  parties: Party[];
  assetLifetime: Record<string, any>;
  forecasts: string[];
  metrics: string[];
  milestones: string[];
  completion: Completion;
  Documents: any[];
}

export interface ProjectFormData extends Omit<ProjectData, 'id' | 'updated'> {
  // Form-specific fields can be added here
}
