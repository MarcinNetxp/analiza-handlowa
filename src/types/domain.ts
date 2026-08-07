import type {
  ActivityResult,
  ActivityStatus,
  ActivityType,
  CancellationReason,
  InterestArea,
  LeadSource,
  LeadStatus,
  SalespersonStatus,
} from "./enums";

export interface Salesperson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  team: string;
  status: SalespersonStatus;
  /** Archetype used only for mock generation / demos */
  archetype?:
    | "top_discipline"
    | "high_volume_low_result"
    | "overdue_heavy"
    | "reschedule_heavy"
    | "average"
    | "inactive";
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  salespersonId: string;
  createdAt: string;
  status: LeadStatus;
  source: LeadSource;
  interestArea: InterestArea;
  lastActivityId?: string | null;
  lastContactAt?: string | null;
}

export interface Activity {
  id: string;
  leadId: string;
  salespersonId: string;
  type: ActivityType;
  createdAt: string;
  plannedAt: string;
  completedAt?: string | null;
  status: ActivityStatus;
  result?: ActivityResult | null;
  note?: string | null;
  rescheduleCount: number;
  originalPlannedAt: string;
  currentPlannedAt: string;
  cancellationReason?: CancellationReason | null;
  hasNextStep: boolean;
}

export interface MockDataset {
  generatedAt: string;
  referenceDate: string;
  salespeople: Salesperson[];
  leads: Lead[];
  activities: Activity[];
}

export type AnalyticActivityStatus = ActivityStatus | "overdue";

export interface GlobalFilters {
  dateFrom: string;
  dateTo: string;
  salespersonId: string | "all";
  activityType: ActivityType | "all";
  activityStatus: ActivityStatus | "all";
  activityResult: ActivityResult | "all";
  leadSource: LeadSource | "all";
  interestArea: InterestArea | "all";
}

export type DrilldownType =
  | "planned"
  | "completed"
  | "overdue"
  | "rescheduled"
  | "cancelled"
  | "no_result"
  | "no_next_step"
  | "no_contact_7"
  | "no_contact_14"
  | "no_contact_30"
  | "no_first_contact"
  | "multi_reschedule"
  | "active_leads"
  | "meetings"
  | "next_contacts";
