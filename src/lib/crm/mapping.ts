import { CRM_MODULE_ACTIVITIES, crmDetailUrl } from "./config";
import type {
  Activity,
  Lead,
  RelatedEntityType,
  Salesperson,
} from "@/types/domain";
import type {
  ActivityResult,
  ActivityStatus,
  ActivityType,
  CancellationReason,
  InterestArea,
  LeadSource,
  LeadStatus,
} from "@/types/enums";

type CrmRecord = Record<string, unknown> & { _id?: string; _type?: string };

function clean(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s || s.toLowerCase() === "null" || s === "0") return null;
  return s;
}

function pick(rec: CrmRecord, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = clean(rec[k]);
    if (v) return v;
  }
  return null;
}

function pickNum(rec: CrmRecord, ...keys: string[]): number {
  for (const k of keys) {
    const v = rec[k];
    if (v == null || v === "") continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function toIso(v: string | null, fallback?: string): string {
  if (!v) return fallback ?? new Date().toISOString();
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return fallback ?? new Date().toISOString();
  return d.toISOString();
}

const STATUS_MAP: Record<string, ActivityStatus> = {
  zaplanowane: "planned",
  planned: "planned",
  wykonane: "completed",
  completed: "completed",
  done: "completed",
  przelozone: "rescheduled",
  przełożone: "rescheduled",
  rescheduled: "rescheduled",
  niewykonane: "not_done",
  not_done: "not_done",
  anulowane: "cancelled",
  cancelled: "cancelled",
};

const TYPE_MAP: Record<string, ActivityType> = {
  telefon: "phone",
  phone: "phone",
  email: "email",
  "e-mail": "email",
  "e-mail / kontakt mailowy": "email",
  "spotkanie online": "meeting_online",
  meeting_online: "meeting_online",
  "spotkanie osobiste": "meeting_in_person",
  meeting_in_person: "meeting_in_person",
  "follow-up": "follow_up",
  follow_up: "follow_up",
  "przygotowanie oferty": "offer_prep",
  offer_prep: "offer_prep",
  "inne działanie": "other",
  inne: "other",
  other: "other",
};

const RESULT_MAP: Record<string, ActivityResult> = {
  "kontakt nawiązany": "contact_made",
  contact_made: "contact_made",
  "brak odpowiedzi": "no_response",
  no_response: "no_response",
  "umówiono kolejny kontakt": "next_contact_scheduled",
  next_contact_scheduled: "next_contact_scheduled",
  "umówiono spotkanie": "meeting_scheduled",
  meeting_scheduled: "meeting_scheduled",
  "wysłano materiały": "materials_sent",
  materials_sent: "materials_sent",
  "ustalono przygotowanie oferty": "offer_agreed",
  offer_agreed: "offer_agreed",
  "brak zainteresowania": "no_interest",
  no_interest: "no_interest",
  "niewłaściwa osoba kontaktowa": "wrong_contact",
  wrong_contact: "wrong_contact",
  "lead zdyskwalifikowany": "lead_disqualified",
  lead_disqualified: "lead_disqualified",
  "konkurencja była pierwsza": "competitor_first",
  konkurencja_byla_pierwsza: "competitor_first",
  competitor_first: "competitor_first",
  "oferta nie spełnia oczekiwań finansowych": "offer_price_mismatch",
  oferta_nie_spelnia_oczekiwan_finansowych: "offer_price_mismatch",
  offer_price_mismatch: "offer_price_mismatch",
  inny: "other",
  other: "other",
};

const CANCEL_MAP: Record<string, CancellationReason> = {
  "klient odwołał": "client_cancelled",
  client_cancelled: "client_cancelled",
  "handlowiec odwołał": "salesperson_cancelled",
  salesperson_cancelled: "salesperson_cancelled",
  "brak zainteresowania": "no_interest",
  "zmiana priorytetów klienta": "priority_change",
  priority_change: "priority_change",
  "temat nieaktualny": "topic_outdated",
  topic_outdated: "topic_outdated",
  "lead zdyskwalifikowany": "lead_disqualified",
  "błędnie utworzone wydarzenie": "created_by_mistake",
  created_by_mistake: "created_by_mistake",
  inny: "other",
  other: "other",
};

function normKey(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

function mapDict<T extends string>(
  raw: string | null,
  table: Record<string, T>,
): T | null {
  if (!raw) return null;
  const key = normKey(raw);
  if (table[key]) return table[key];
  const slug = key.replace(/[^a-z0-9]+/g, "_");
  return table[slug] ?? null;
}

function parentModuleToRelated(type: string | null): RelatedEntityType {
  const t = (type ?? "").toLowerCase();
  if (t.includes("lead")) return "lead";
  if (t.includes("contact")) return "contact";
  if (t.includes("account")) return "account";
  return "unknown";
}

function crmModuleForRelated(type: RelatedEntityType): string {
  switch (type) {
    case "lead":
      return "Leads";
    case "contact":
      return "Contacts";
    case "account":
      return "Accounts";
    default:
      return "Leads";
  }
}

export function mapActivityRecord(
  rec: CrmRecord,
  baseUrl: string,
): Activity | null {
  const id = clean(rec._id);
  if (!id) return null;

  const statusRaw = pick(
    rec,
    "status_c",
    "status",
    "stat_c",
    "status_aktywnosci_c",
  );
  const status = mapDict(statusRaw, STATUS_MAP) ?? "planned";

  const typeRaw = pick(
    rec,
    "dzialanie_c",
    "dzialanie",
    "typ_dzialania_c",
    "rodzaj_dzialania_c",
    "activity_type_c",
    "name",
  );
  const type = mapDict(typeRaw, TYPE_MAP) ?? "other";

  const resultRaw = pick(
    rec,
    "wynik_dzialania_c",
    "wynik_c",
    "wynik",
    "result_c",
  );
  const cancelRaw = pick(
    rec,
    "powod_anulowania_c",
    "powod_przelozenia_c",
    "powod_c",
    "powod",
    "reason_c",
  );

  const createdAt = toIso(
    pick(rec, "date_entered", "created_at"),
    undefined,
  );
  const plannedAt = toIso(
    pick(
      rec,
      "date_start",
      "date_due",
      "data_planowana_c",
      "planowana_data_c",
      "termin_c",
    ),
    createdAt,
  );
  const completedAtRaw = pick(
    rec,
    "data_wykonania_c",
    "date_end",
    "wykonano_c",
    "completed_at_c",
  );
  const completedAt =
    status === "completed" && completedAtRaw
      ? toIso(completedAtRaw)
      : completedAtRaw
        ? toIso(completedAtRaw)
        : null;

  const currentPlannedAt = toIso(
    pick(rec, "date_due", "current_planned_c", "aktualny_termin_c") ??
      plannedAt,
    plannedAt,
  );
  const originalPlannedAt = toIso(
    pick(rec, "original_planned_c", "pierwotny_termin_c", "date_start") ??
      plannedAt,
    plannedAt,
  );

  const parentTypeRaw = pick(
    rec,
    "parent_type",
    "powiazane_z_module",
    "parent_module",
  );
  const relatedType = parentModuleToRelated(parentTypeRaw);
  const relatedCrmId = pick(
    rec,
    "parent_id",
    "lead_id",
    "contact_id",
    "account_id",
    "powiazane_z_id",
  );
  const relatedLabel =
    pick(rec, "parent_name", "powiazane_z_name", "parent_name_c") ?? "—";

  const salespersonCrmId = pick(rec, "assigned_user_id", "user_id_c") ?? "unknown";
  const leadId = relatedCrmId
    ? `${relatedType}:${relatedCrmId}`
    : `orphan:${id}`;

  return {
    id,
    crmId: id,
    crmUrl: crmDetailUrl(CRM_MODULE_ACTIVITIES, id, baseUrl),
    leadId,
    salespersonId: salespersonCrmId,
    relatedType,
    relatedCrmId: relatedCrmId ?? "",
    relatedLabel,
    relatedCrmUrl: relatedCrmId
      ? crmDetailUrl(crmModuleForRelated(relatedType), relatedCrmId, baseUrl)
      : null,
    type,
    createdAt,
    plannedAt,
    completedAt,
    status,
    result:
      status === "completed"
        ? mapDict(resultRaw, RESULT_MAP)
        : null,
    cancellationReason:
      status === "cancelled" ||
      status === "rescheduled" ||
      status === "not_done"
        ? mapDict(cancelRaw, CANCEL_MAP)
        : null,
    note: pick(rec, "description", "note", "notatka_c", "opis_c"),
    rescheduleCount: pickNum(
      rec,
      "liczba_przeniesien_c",
      "reschedule_count_c",
      "przeniesienia_c",
    ),
    originalPlannedAt,
    currentPlannedAt,
    hasNextStep: false,
  };
}

export function mapLeadRecord(
  rec: CrmRecord,
  relatedType: RelatedEntityType,
  baseUrl: string,
): Lead | null {
  const crmId = clean(rec._id);
  if (!crmId) return null;

  const id = `${relatedType}:${crmId}`;
  const companyName =
    pick(rec, "account_name", "company", "kontrahent") ??
    pick(rec, "name", "full_name") ??
    "—";
  const contactPerson = pick(rec, "name", "full_name", "first_name") ?? "—";
  const salespersonId =
    pick(rec, "assigned_user_id") ?? "unknown";

  const statusRaw = (pick(rec, "status", "status_c") ?? "in_progress").toLowerCase();
  let status: LeadStatus = "in_progress";
  if (statusRaw.includes("nowy") || statusRaw === "new") status = "new";
  else if (statusRaw.includes("zakwal")) status = "qualified";
  else if (statusRaw.includes("ofert") || statusRaw.includes("proposal"))
    status = "proposal";
  else if (statusRaw.includes("wygran") || statusRaw === "won") status = "won";
  else if (statusRaw.includes("przegr") || statusRaw === "lost") status = "lost";
  else if (statusRaw.includes("dyskw") || statusRaw.includes("dead"))
    status = "disqualified";

  const sourceRaw = pick(rec, "lead_source", "zrodlo_c", "source");
  const source = mapLeadSource(sourceRaw);
  const areaRaw = pick(rec, "obszar_c", "interest_area_c", "temat_c");
  const interestArea = mapInterestArea(areaRaw);

  return {
    id,
    crmId,
    crmUrl: crmDetailUrl(crmModuleForRelated(relatedType), crmId, baseUrl),
    relatedType,
    companyName,
    contactPerson,
    salespersonId,
    createdAt: toIso(pick(rec, "date_entered"), undefined),
    status,
    source,
    interestArea,
    lastActivityId: null,
    lastContactAt: null,
  };
}

function mapLeadSource(raw: string | null): LeadSource {
  const k = normKey(raw ?? "");
  if (k.includes("formularz") || k.includes("www")) return "web_form";
  if (k.includes("webinar")) return "webinar";
  if (k.includes("linkedin")) return "linkedin";
  if (k.includes("polec")) return "referral";
  if (k.includes("prospect")) return "prospecting";
  if (k.includes("partner")) return "partner";
  if (k.includes("produc") || k.includes("vendor")) return "vendor";
  if (k.includes("market")) return "marketing";
  return "marketing";
}

function mapInterestArea(raw: string | null): InterestArea {
  const k = normKey(raw ?? "");
  if (k.includes("lan") || k.includes("wlan")) return "lan_wlan";
  if (k.includes("cyber")) return "cybersecurity";
  if (k.includes("nis")) return "nis2";
  if (k.includes("ai")) return "ai";
  if (k.includes("voip")) return "voip";
  if (k.includes("konfer") || k.includes("sale")) return "conference_rooms";
  if (k.includes("isp")) return "isp";
  return "lan_wlan";
}

export function mapSalespersonFromActivity(
  rec: CrmRecord,
): Salesperson | null {
  const userId = pick(rec, "assigned_user_id");
  const name = pick(rec, "assigned_user_name");
  if (!userId || !name) return null;
  const parts = name.split(/\s+/);
  return {
    id: userId,
    crmId: userId,
    firstName: parts[0] ?? name,
    lastName: parts.slice(1).join(" ") || "—",
    email: pick(rec, "assigned_user_email") ?? `${userId}@crm.local`,
    team: pick(rec, "department", "team_c") ?? "Handlowcy",
    status: "active",
  };
}

export function enrichActivitiesAndLeads(
  activities: Activity[],
  leads: Map<string, Lead>,
): void {
  const byLead = new Map<string, Activity[]>();
  for (const a of activities) {
    const list = byLead.get(a.leadId) ?? [];
    list.push(a);
    byLead.set(a.leadId, list);
  }

  for (const [leadId, acts] of byLead) {
    acts.sort(
      (a, b) =>
        new Date(a.currentPlannedAt).getTime() -
        new Date(b.currentPlannedAt).getTime(),
    );
    const lead = leads.get(leadId);
    if (!lead) continue;

    const completed = acts.filter((a) => a.status === "completed" && a.completedAt);
    const lastCompleted = completed[completed.length - 1];
    if (lastCompleted) {
      lead.lastActivityId = lastCompleted.id;
      lead.lastContactAt = lastCompleted.completedAt ?? null;
    }

    const today = new Date();
    const hasFuture = acts.some(
      (a) =>
        a.status === "planned" &&
        new Date(a.currentPlannedAt) >= today,
    );
    for (const a of acts) {
      if (a.status === "completed") {
        a.hasNextStep = hasFuture;
      }
    }
  }
}
