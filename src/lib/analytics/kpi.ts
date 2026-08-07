import { hoursBetween, parseDate, startOfWeekMonday, toISODate } from "@/lib/dates";
import type {
  Activity,
  DrilldownType,
  GlobalFilters,
  Lead,
  Salesperson,
} from "@/types/domain";
import { filterActivitiesForDashboard, filterLeads } from "./filters";
import {
  daysWithoutContact,
  firstContactAt,
  isActiveLead,
  isLeadWithoutFirstContact,
  isLeadWithoutNextStep,
  isMissingResult,
  isMultiRescheduled,
  isOnTimeCompletion,
  isOverdue,
  lastCompletedAt,
  nextPlannedActivity,
} from "./rules";
import { computeDisciplineScore } from "./disciplineScore";
import { ACTIVITY_TYPE_LABELS } from "@/types/enums";

export interface DashboardKpis {
  activeLeads: number;
  planned: number;
  completed: number;
  timeliness: number;
  overdue: number;
  rescheduled: number;
  cancelled: number;
  noNextStep: number;
  noContact7: number;
  noContact14: number;
  noContact30: number;
}

export interface AlertItem {
  id: string;
  message: string;
  severity: "warning" | "danger";
  href: string;
}

export function computeDashboardKpis(
  leads: Lead[],
  activities: Activity[],
  filters: GlobalFilters,
  today: string,
): DashboardKpis {
  const fLeads = filterLeads(leads, filters);
  const fActs = filterActivitiesForDashboard(activities, leads, filters, today);
  const active = fLeads.filter(isActiveLead);
  const completed = fActs.filter((a) => a.status === "completed");
  const onTime = completed.filter(isOnTimeCompletion).length;

  return {
    activeLeads: active.length,
    planned: fActs.filter((a) => a.status === "planned").length,
    completed: completed.length,
    timeliness: completed.length ? onTime / completed.length : 0,
    overdue: fActs.filter((a) => isOverdue(a, today)).length,
    rescheduled: fActs.filter(
      (a) => a.status === "rescheduled" || a.rescheduleCount > 0,
    ).length,
    cancelled: fActs.filter((a) => a.status === "cancelled").length,
    noNextStep: active.filter((l) =>
      isLeadWithoutNextStep(l, activities, today),
    ).length,
    noContact7: active.filter((l) => {
      const d = daysWithoutContact(l, activities, today);
      return d != null ? d > 7 : isLeadWithoutFirstContact(l, activities);
    }).length,
    noContact14: active.filter((l) => {
      const d = daysWithoutContact(l, activities, today);
      return d != null && d > 14;
    }).length,
    noContact30: active.filter((l) => {
      const d = daysWithoutContact(l, activities, today);
      return d != null && d > 30;
    }).length,
  };
}

export function buildAlerts(
  leads: Lead[],
  activities: Activity[],
  salespeople: Salesperson[],
  filters: GlobalFilters,
  today: string,
): AlertItem[] {
  const kpis = computeDashboardKpis(leads, activities, filters, today);
  const alerts: AlertItem[] = [];

  if (kpis.noNextStep > 0) {
    alerts.push({
      id: "no-next",
      message: `${kpis.noNextStep} leadów nie ma zaplanowanego kolejnego działania`,
      severity: "danger",
      href: "/drilldown?type=no_next_step",
    });
  }
  if (kpis.overdue > 0) {
    alerts.push({
      id: "overdue",
      message: `${kpis.overdue} aktywności jest po terminie`,
      severity: "danger",
      href: "/drilldown?type=overdue",
    });
  }
  if (kpis.noContact30 > 0) {
    alerts.push({
      id: "nc30",
      message: `${kpis.noContact30} leadów nie miało kontaktu od ponad 30 dni`,
      severity: "danger",
      href: "/drilldown?type=no_contact_30",
    });
  }

  const fActs = filterActivitiesForDashboard(activities, leads, filters, today);
  const noResult = fActs.filter(isMissingResult).length;
  if (noResult > 0) {
    alerts.push({
      id: "no-result",
      message: `${noResult} wykonanych wydarzeń nie ma określonego wyniku`,
      severity: "warning",
      href: "/drilldown?type=no_result",
    });
  }

  for (const sp of salespeople.filter((s) => s.status === "active")) {
    const overdue = activities.filter(
      (a) => a.salespersonId === sp.id && isOverdue(a, today),
    ).length;
    if (overdue >= 8) {
      alerts.push({
        id: `sp-overdue-${sp.id}`,
        message: `Handlowiec ${sp.firstName} ${sp.lastName} ma ${overdue} wydarzeń po terminie`,
        severity: "danger",
        href: `/salespeople/${sp.id}`,
      });
    }
  }

  const multi = activities
    .filter(isMultiRescheduled)
    .filter((a) => a.rescheduleCount >= 3)
    .slice(0, 3);
  const leadMap = new Map(leads.map((l) => [l.id, l]));
  for (const a of multi) {
    const lead = leadMap.get(a.leadId);
    if (!lead) continue;
    alerts.push({
      id: `multi-${a.id}`,
      message: `Spotkanie z firmą ${lead.companyName} było przekładane ${a.rescheduleCount} razy`,
      severity: "warning",
      href: `/leads/${lead.id}`,
    });
  }

  return alerts.slice(0, 10);
}

export interface SalespersonRow {
  salesperson: Salesperson;
  activeLeads: number;
  planned: number;
  completed: number;
  timeliness: number;
  overdue: number;
  rescheduled: number;
  cancelled: number;
  noResult: number;
  noNextStep: number;
  noContact14: number;
  meetings: number;
  nextContacts: number;
  disciplineScore: number;
  activityVolume: number;
}

export function computeSalespersonRows(
  salespeople: Salesperson[],
  leads: Lead[],
  activities: Activity[],
  filters: GlobalFilters,
  today: string,
): SalespersonRow[] {
  return salespeople.map((sp) => {
    const spFilters: GlobalFilters = { ...filters, salespersonId: sp.id };
    const kpis = computeDashboardKpis(leads, activities, spFilters, today);
    const fActs = filterActivitiesForDashboard(activities, leads, spFilters, today);
    const completed = fActs.filter((a) => a.status === "completed");
    const discipline = computeDisciplineScore(sp.id, leads, activities, today);

    return {
      salesperson: sp,
      activeLeads: kpis.activeLeads,
      planned: kpis.planned,
      completed: kpis.completed,
      timeliness: kpis.timeliness,
      overdue: kpis.overdue,
      rescheduled: kpis.rescheduled,
      cancelled: kpis.cancelled,
      noResult: completed.filter(isMissingResult).length,
      noNextStep: kpis.noNextStep,
      noContact14: kpis.noContact14,
      meetings: fActs.filter(
        (a) =>
          a.type === "meeting_online" ||
          a.type === "meeting_in_person",
      ).length,
      nextContacts: completed.filter((a) => a.result === "next_contact_scheduled")
        .length,
      disciplineScore: discipline.total,
      activityVolume: fActs.length,
    };
  });
}

export function weeklyActivityTrend(
  activities: Activity[],
  salespersonId: string | null,
  today: string,
  weeks = 12,
): { week: string; count: number }[] {
  const end = startOfWeekMonday(parseDate(today));
  const buckets: { week: string; count: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(end);
    start.setDate(start.getDate() - i * 7);
    const label = toISODate(start);
    const next = new Date(start);
    next.setDate(next.getDate() + 7);
    const count = activities.filter((a) => {
      if (salespersonId && a.salespersonId !== salespersonId) return false;
      const d = parseDate(a.completedAt ?? a.currentPlannedAt);
      return d >= start && d < next;
    }).length;
    buckets.push({ week: label, count });
  }
  return buckets;
}

export function activityTypeStructure(
  activities: Activity[],
  salespersonId?: string,
): { type: string; label: string; count: number }[] {
  const filtered = salespersonId
    ? activities.filter((a) => a.salespersonId === salespersonId)
    : activities;
  const map = new Map<string, number>();
  for (const a of filtered) {
    map.set(a.type, (map.get(a.type) ?? 0) + 1);
  }
  return Object.entries(ACTIVITY_TYPE_LABELS).map(([type, label]) => ({
    type,
    label,
    count: map.get(type) ?? 0,
  }));
}

export function resultStructure(
  activities: Activity[],
  salespersonId?: string,
): { result: string; count: number }[] {
  const filtered = activities.filter(
    (a) =>
      a.status === "completed" &&
      a.result &&
      (!salespersonId || a.salespersonId === salespersonId),
  );
  const map = new Map<string, number>();
  for (const a of filtered) {
    map.set(a.result!, (map.get(a.result!) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([result, count]) => ({ result, count }))
    .sort((a, b) => b.count - a.count);
}

export interface AttentionLeadRow {
  lead: Lead;
  salespersonName: string;
  lastActivityType: string | null;
  lastActivityAt: string | null;
  daysWithoutContact: number | null;
  nextPlannedAt: string | null;
  rescheduleCount: number;
  category: string;
}

export function attentionBuckets(
  leads: Lead[],
  activities: Activity[],
  salespeople: Salesperson[],
  filters: GlobalFilters,
  today: string,
): Record<string, AttentionLeadRow[]> {
  const fLeads = filterLeads(leads, filters).filter(isActiveLead);
  const spMap = new Map(
    salespeople.map((s) => [s.id, `${s.firstName} ${s.lastName}`]),
  );

  const toRow = (lead: Lead, category: string): AttentionLeadRow => {
    const leadActs = activities.filter((a) => a.leadId === lead.id);
    const lastAt = lastCompletedAt(lead.id, activities);
    const lastAct = leadActs
      .filter((a) => a.status === "completed")
      .sort(
        (a, b) =>
          parseDate(b.completedAt!).getTime() - parseDate(a.completedAt!).getTime(),
      )[0];
    const next = nextPlannedActivity(lead.id, activities, today);
    const maxReschedule = Math.max(0, ...leadActs.map((a) => a.rescheduleCount));
    return {
      lead,
      salespersonName: spMap.get(lead.salespersonId) ?? "—",
      lastActivityType: lastAct ? ACTIVITY_TYPE_LABELS[lastAct.type] : null,
      lastActivityAt: lastAt,
      daysWithoutContact: daysWithoutContact(lead, activities, today),
      nextPlannedAt: next?.currentPlannedAt ?? null,
      rescheduleCount: maxReschedule,
      category,
    };
  };

  const noFirst = fLeads
    .filter((l) => isLeadWithoutFirstContact(l, activities))
    .map((l) => toRow(l, "Brak pierwszego kontaktu"));
  const nc7 = fLeads
    .filter((l) => {
      const d = daysWithoutContact(l, activities, today);
      return d != null && d > 7 && d <= 14;
    })
    .map((l) => toRow(l, "Brak kontaktu >7 dni"));
  const nc14 = fLeads
    .filter((l) => {
      const d = daysWithoutContact(l, activities, today);
      return d != null && d > 14 && d <= 30;
    })
    .map((l) => toRow(l, "Brak kontaktu >14 dni"));
  const nc30 = fLeads
    .filter((l) => {
      const d = daysWithoutContact(l, activities, today);
      return d != null && d > 30;
    })
    .map((l) => toRow(l, "Brak kontaktu >30 dni"));
  const noNext = fLeads
    .filter((l) => isLeadWithoutNextStep(l, activities, today))
    .map((l) => toRow(l, "Brak kolejnego kroku"));

  const overdueLeads = new Set(
    activities.filter((a) => isOverdue(a, today)).map((a) => a.leadId),
  );
  const overdue = fLeads
    .filter((l) => overdueLeads.has(l.id))
    .map((l) => toRow(l, "Aktywność po terminie"));

  const multiLeads = new Set(
    activities.filter(isMultiRescheduled).map((a) => a.leadId),
  );
  const multi = fLeads
    .filter((l) => multiLeads.has(l.id))
    .map((l) => toRow(l, "Wielokrotne przełożenia"));

  const noResultLeads = new Set(
    activities.filter(isMissingResult).map((a) => a.leadId),
  );
  const noResult = fLeads
    .filter((l) => noResultLeads.has(l.id))
    .map((l) => toRow(l, "Wykonane bez wyniku"));

  const cancelledLeads = new Set(
    activities.filter((a) => a.status === "cancelled").map((a) => a.leadId),
  );
  const cancelled = fLeads
    .filter((l) => cancelledLeads.has(l.id))
    .map((l) => toRow(l, "Anulowane działania"));

  return {
    "Brak pierwszego kontaktu": noFirst,
    "Brak kontaktu >7 dni": nc7,
    "Brak kontaktu >14 dni": nc14,
    "Brak kontaktu >30 dni": nc30,
    "Brak kolejnego kroku": noNext,
    "Aktywność po terminie": overdue,
    "Wielokrotne przełożenia": multi,
    "Wykonane bez wyniku": noResult,
    "Anulowane działania": cancelled,
  };
}

export function resolveDrilldown(
  type: DrilldownType,
  leads: Lead[],
  activities: Activity[],
  filters: GlobalFilters,
  today: string,
): { kind: "leads" | "activities"; leads: Lead[]; activities: Activity[] } {
  const fLeads = filterLeads(leads, filters);
  const fActs = filterActivitiesForDashboard(activities, leads, filters, today);
  const active = fLeads.filter(isActiveLead);

  switch (type) {
    case "active_leads":
      return { kind: "leads", leads: active, activities: [] };
    case "planned":
      return {
        kind: "activities",
        leads: [],
        activities: fActs.filter((a) => a.status === "planned"),
      };
    case "completed":
      return {
        kind: "activities",
        leads: [],
        activities: fActs.filter((a) => a.status === "completed"),
      };
    case "overdue":
      return {
        kind: "activities",
        leads: [],
        activities: fActs.filter((a) => isOverdue(a, today)),
      };
    case "rescheduled":
      return {
        kind: "activities",
        leads: [],
        activities: fActs.filter(
          (a) => a.status === "rescheduled" || a.rescheduleCount > 0,
        ),
      };
    case "cancelled":
      return {
        kind: "activities",
        leads: [],
        activities: fActs.filter((a) => a.status === "cancelled"),
      };
    case "no_result":
      return {
        kind: "activities",
        leads: [],
        activities: fActs.filter(isMissingResult),
      };
    case "no_next_step":
      return {
        kind: "leads",
        leads: active.filter((l) => isLeadWithoutNextStep(l, activities, today)),
        activities: [],
      };
    case "no_contact_7":
      return {
        kind: "leads",
        leads: active.filter((l) => {
          const d = daysWithoutContact(l, activities, today);
          return d != null ? d > 7 : isLeadWithoutFirstContact(l, activities);
        }),
        activities: [],
      };
    case "no_contact_14":
      return {
        kind: "leads",
        leads: active.filter((l) => {
          const d = daysWithoutContact(l, activities, today);
          return d != null && d > 14;
        }),
        activities: [],
      };
    case "no_contact_30":
      return {
        kind: "leads",
        leads: active.filter((l) => {
          const d = daysWithoutContact(l, activities, today);
          return d != null && d > 30;
        }),
        activities: [],
      };
    case "no_first_contact":
      return {
        kind: "leads",
        leads: fLeads.filter((l) => isLeadWithoutFirstContact(l, activities)),
        activities: [],
      };
    case "multi_reschedule":
      return {
        kind: "activities",
        leads: [],
        activities: fActs.filter(isMultiRescheduled),
      };
    case "meetings":
      return {
        kind: "activities",
        leads: [],
        activities: fActs.filter(
          (a) =>
            a.type === "meeting_online" || a.type === "meeting_in_person",
        ),
      };
    case "next_contacts":
      return {
        kind: "activities",
        leads: [],
        activities: fActs.filter((a) => a.result === "next_contact_scheduled"),
      };
    default:
      return { kind: "leads", leads: [], activities: [] };
  }
}

export function firstResponseMetrics(
  leads: Lead[],
  activities: Activity[],
  filters: GlobalFilters,
) {
  const fLeads = filterLeads(leads, filters);
  const hours: number[] = [];
  let noFirst = 0;
  for (const lead of fLeads) {
    const first = firstContactAt(lead.id, activities);
    if (!first) {
      noFirst += 1;
      continue;
    }
    hours.push(hoursBetween(lead.createdAt, first));
  }
  const sorted = [...hours].sort((a, b) => a - b);
  const avg = hours.length
    ? hours.reduce((s, h) => s + h, 0) / hours.length
    : null;
  const median = sorted.length
    ? sorted.length % 2
      ? sorted[(sorted.length - 1) / 2]!
      : (sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2
    : null;
  return {
    averageHours: avg,
    medianHours: median,
    pct24h: hours.length
      ? hours.filter((h) => h <= 24).length / hours.length
      : 0,
    pct48h: hours.length
      ? hours.filter((h) => h <= 48).length / hours.length
      : 0,
    noFirstContact: noFirst,
    sampleSize: hours.length,
  };
}

export function qualityMetrics(
  leads: Lead[],
  activities: Activity[],
  filters: GlobalFilters,
  today: string,
) {
  const fLeads = filterLeads(leads, filters);
  const fActs = filterActivitiesForDashboard(activities, leads, filters, today);
  const active = fLeads.filter(isActiveLead);
  const completed = fActs.filter((a) => a.status === "completed");

  const firstHours: number[] = [];
  const gaps: number[] = [];
  for (const lead of fLeads) {
    const first = firstContactAt(lead.id, activities);
    if (first) firstHours.push(hoursBetween(lead.createdAt, first) / 24);
    const completedLead = activities
      .filter((a) => a.leadId === lead.id && a.status === "completed" && a.completedAt)
      .sort(
        (a, b) =>
          parseDate(a.completedAt!).getTime() - parseDate(b.completedAt!).getTime(),
      );
    for (let i = 1; i < completedLead.length; i++) {
      gaps.push(
        hoursBetween(completedLead[i - 1]!.completedAt!, completedLead[i]!.completedAt!) /
          24,
      );
    }
  }

  return {
    pctNoFirstContact: fLeads.length
      ? fLeads.filter((l) => isLeadWithoutFirstContact(l, activities)).length /
        fLeads.length
      : 0,
    pctNoNextStep: active.length
      ? active.filter((l) => isLeadWithoutNextStep(l, activities, today)).length /
        active.length
      : 0,
    pctOverdue: fActs.length
      ? fActs.filter((a) => isOverdue(a, today)).length / fActs.length
      : 0,
    pctRescheduled: fActs.length
      ? fActs.filter((a) => a.rescheduleCount > 0 || a.status === "rescheduled")
          .length / fActs.length
      : 0,
    pctNoResult: completed.length
      ? completed.filter(isMissingResult).length / completed.length
      : 0,
    pctCancelled: fActs.length
      ? fActs.filter((a) => a.status === "cancelled").length / fActs.length
      : 0,
    avgFirstContactDays: firstHours.length
      ? firstHours.reduce((a, b) => a + b, 0) / firstHours.length
      : null,
    avgGapDays: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null,
  };
}

export function effectivenessMetrics(
  activities: Activity[],
  leads: Lead[],
  filters: GlobalFilters,
  today: string,
) {
  const fActs = filterActivitiesForDashboard(activities, leads, filters, today);
  const phones = fActs.filter((a) => a.type === "phone" && a.status === "completed");
  const meetings = fActs.filter(
    (a) =>
      (a.type === "meeting_online" || a.type === "meeting_in_person") &&
      a.status === "completed",
  );
  const followUps = fActs.filter(
    (a) => a.type === "follow_up" && a.status === "completed",
  );

  const contactMade = phones.filter((a) => a.result === "contact_made").length;
  return {
    phone: {
      completed: phones.length,
      contactMade,
      noResponse: phones.filter((a) => a.result === "no_response").length,
      meetingsScheduled: phones.filter((a) => a.result === "meeting_scheduled")
        .length,
      contactRate: phones.length ? contactMade / phones.length : 0,
    },
    meetings: {
      count: meetings.length,
      offerPrep: meetings.filter((a) => a.result === "offer_agreed").length,
      nextSteps: meetings.filter(
        (a) =>
          a.result === "next_contact_scheduled" ||
          a.result === "offer_agreed" ||
          a.hasNextStep,
      ).length,
    },
    followUp: {
      count: followUps.length,
      nextContacts: followUps.filter((a) => a.result === "next_contact_scheduled")
        .length,
      noInterest: followUps.filter((a) => a.result === "no_interest").length,
      noResponse: followUps.filter((a) => a.result === "no_response").length,
    },
  };
}
