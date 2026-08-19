export type LeadTemperature = "cold" | "warm";

export type LeadStatusGroup =
  | "new"
  | "in_handling"
  | "rejected"
  | "recontact"
  | "inactive"
  | "converted"
  | "other";

export interface PotentialClient {
  id: string;
  crmId: string;
  crmUrl: string;
  companyName: string;
  contactPerson: string;
  salespersonId: string;
  salespersonName: string;
  status: string;
  statusGroup?: LeadStatusGroup;
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

function foldStatus(value: string): string {
  return (value || "")
    .replaceAll("ł", "l")
    .replaceAll("Ł", "L")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveStatusGroup(row: PotentialClient): LeadStatusGroup {
  if (row.converted) return "converted";
  const key = foldStatus(row.status);
  if (["nowy", "new"].includes(key)) return "new";
  if (
    ["w trakcie obslugi", "w trakcie", "in process", "in_process", "assigned"].includes(
      key,
    )
  ) {
    return "in_handling";
  }
  if (["odrzucony", "rejected", "dead", "recycled"].includes(key)) return "rejected";
  if (["do ponownego kontaktu", "ponowny kontakt"].includes(key)) {
    return "recontact";
  }
  if (["nieaktywny", "inactive"].includes(key)) return "inactive";
  if (row.statusGroup) return row.statusGroup;
  if (row.inHandling) return "in_handling";
  return "other";
}

const CRM_STATUS_LABELS: Record<string, string> = {
  new: "Nowy",
  assigned: "W trakcie obsługi",
  "in process": "W trakcie obsługi",
  in_process: "W trakcie obsługi",
  recycled: "Odrzucony",
  dead: "Odrzucony",
  rejected: "Odrzucony",
  converted: "Przekonwertowany",
  inactive: "Nieaktywny",
};

/** Angielskie statusy SuiteCRM pokazujemy po polsku; polskie zostawiamy jak w CRM. */
export function crmStatusLabel(status: string): string {
  return CRM_STATUS_LABELS[foldStatus(status)] ?? status;
}

export function potentialClientStats(rows: PotentialClient[]) {
  const visible = rows.filter((r) => !r.converted);
  const active = visible.filter((r) => r.inHandling);
  const group = (key: LeadStatusGroup) =>
    visible.filter((r) => resolveStatusGroup(r) === key).length;
  return {
    visible: visible.length,
    assigned: active.length,
    rejected: group("rejected"),
    recontact: group("recontact"),
    inactive: group("inactive"),
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
