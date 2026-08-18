export type LeadTemperature = "cold" | "warm";

export interface PotentialClient {
  id: string;
  crmId: string;
  crmUrl: string;
  companyName: string;
  contactPerson: string;
  salespersonId: string;
  salespersonName: string;
  status: string;
  stage: string;
  temperature: LeadTemperature;
  converted: boolean;
  dead: boolean;
  inHandling: boolean;
  hasContact: boolean;
  source: string;
  createdAt: string | null;
}

export interface SalesOpportunity {
  id: string;
  crmId: string;
  crmUrl: string;
  name: string;
  accountName: string;
  accountId?: string | null;
  accountCrmUrl?: string | null;
  salespersonId: string;
  salespersonName: string;
  salesStage: string;
  probability: number;
  technology: string;
  createdAt: string | null;
  expectedCloseAt: string | null;
  closed: boolean;
  overdue: boolean;
  amount?: number | string | null;
}

export function potentialClientStats(rows: PotentialClient[]) {
  const active = rows.filter((r) => r.inHandling);
  return {
    assigned: active.length,
    cold: active.filter((r) => r.temperature === "cold").length,
    warm: active.filter((r) => r.temperature === "warm").length,
    withContact: active.filter((r) => r.hasContact).length,
    withoutContact: active.filter((r) => !r.hasContact).length,
  };
}

export function opportunityStats(rows: SalesOpportunity[]) {
  const open = rows.filter((r) => !r.closed);
  return {
    open: open.length,
    overdue: open.filter((r) => r.overdue).length,
    onTrack: open.filter((r) => !r.overdue).length,
  };
}
