import { inDateRange, parseDate } from "@/lib/dates";
import type { Activity, GlobalFilters, Lead } from "@/types/domain";

export function filterLeads(leads: Lead[], filters: GlobalFilters): Lead[] {
  return leads.filter((lead) => {
    if (
      filters.salespersonId !== "all" &&
      lead.salespersonId !== filters.salespersonId
    ) {
      return false;
    }
    if (filters.leadSource !== "all" && lead.source !== filters.leadSource) {
      return false;
    }
    if (
      filters.interestArea !== "all" &&
      lead.interestArea !== filters.interestArea
    ) {
      return false;
    }
    return true;
  });
}

export function filterActivities(
  activities: Activity[],
  leads: Lead[],
  filters: GlobalFilters,
  opts?: { usePlannedDate?: boolean },
): Activity[] {
  const leadMap = new Map(leads.map((l) => [l.id, l]));
  const usePlanned = opts?.usePlannedDate ?? true;

  return activities.filter((a) => {
    const lead = leadMap.get(a.leadId);
    if (!lead) return false;

    if (
      filters.salespersonId !== "all" &&
      a.salespersonId !== filters.salespersonId
    ) {
      return false;
    }
    if (filters.activityType !== "all" && a.type !== filters.activityType) {
      return false;
    }
    if (filters.activityStatus !== "all" && a.status !== filters.activityStatus) {
      return false;
    }
    if (filters.activityResult !== "all") {
      if (a.result !== filters.activityResult) return false;
    }
    if (filters.leadSource !== "all" && lead.source !== filters.leadSource) {
      return false;
    }
    if (
      filters.interestArea !== "all" &&
      lead.interestArea !== filters.interestArea
    ) {
      return false;
    }

    const dateField = usePlanned
      ? a.currentPlannedAt
      : a.completedAt ?? a.currentPlannedAt;
    return inDateRange(dateField, filters.dateFrom, filters.dateTo);
  });
}

/** Activities relevant to period: planned/completed date intersects filter range OR open overdue. */
export function filterActivitiesForDashboard(
  activities: Activity[],
  leads: Lead[],
  filters: GlobalFilters,
  today: string,
): Activity[] {
  const leadFiltered = filterLeads(leads, filters);
  const leadIds = new Set(leadFiltered.map((l) => l.id));

  return activities.filter((a) => {
    if (!leadIds.has(a.leadId)) return false;
    if (
      filters.salespersonId !== "all" &&
      a.salespersonId !== filters.salespersonId
    ) {
      return false;
    }
    if (filters.activityType !== "all" && a.type !== filters.activityType) {
      return false;
    }
    if (filters.activityStatus !== "all" && a.status !== filters.activityStatus) {
      return false;
    }
    if (
      filters.activityResult !== "all" &&
      a.result !== filters.activityResult
    ) {
      return false;
    }

    const plannedIn = inDateRange(a.currentPlannedAt, filters.dateFrom, filters.dateTo);
    const completedIn = a.completedAt
      ? inDateRange(a.completedAt, filters.dateFrom, filters.dateTo)
      : false;
    const overdueOpen =
      a.status === "planned" && parseDate(a.currentPlannedAt) < parseDate(today);

    return plannedIn || completedIn || overdueOpen;
  });
}
