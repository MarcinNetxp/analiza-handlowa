import { daysBetween, parseDate } from "@/lib/dates";
import type { Activity, Lead } from "@/types/domain";
import { ACTIVE_LEAD_STATUSES } from "@/types/enums";

export function isActiveLead(lead: Lead): boolean {
  return ACTIVE_LEAD_STATUSES.includes(lead.status);
}

export function isOverdue(activity: Activity, today: Date | string): boolean {
  return (
    activity.status === "planned" &&
    parseDate(activity.currentPlannedAt) < parseDate(today)
  );
}

export function isMissingResult(activity: Activity): boolean {
  return activity.status === "completed" && (activity.result == null || activity.result === undefined);
}

export function isMultiRescheduled(activity: Activity): boolean {
  return activity.rescheduleCount >= 2;
}

export function isLateCompletion(activity: Activity): boolean {
  if (activity.status !== "completed" || !activity.completedAt) return false;
  return parseDate(activity.completedAt) > parseDate(activity.plannedAt);
}

export function isOnTimeCompletion(activity: Activity): boolean {
  if (activity.status !== "completed" || !activity.completedAt) return false;
  return parseDate(activity.completedAt) <= parseDate(activity.plannedAt);
}

export function completedActivitiesForLead(
  leadId: string,
  activities: Activity[],
): Activity[] {
  return activities
    .filter((a) => a.leadId === leadId && a.status === "completed" && a.completedAt)
    .sort(
      (a, b) =>
        parseDate(a.completedAt!).getTime() - parseDate(b.completedAt!).getTime(),
    );
}

export function hasFirstContact(leadId: string, activities: Activity[]): boolean {
  return completedActivitiesForLead(leadId, activities).length > 0;
}

export function firstContactAt(leadId: string, activities: Activity[]): string | null {
  return completedActivitiesForLead(leadId, activities)[0]?.completedAt ?? null;
}

export function lastCompletedAt(leadId: string, activities: Activity[]): string | null {
  const list = completedActivitiesForLead(leadId, activities);
  return list[list.length - 1]?.completedAt ?? null;
}

export function hasFuturePlanned(
  leadId: string,
  activities: Activity[],
  today: Date | string,
): boolean {
  const t = parseDate(today).getTime();
  return activities.some(
    (a) =>
      a.leadId === leadId &&
      a.status === "planned" &&
      parseDate(a.currentPlannedAt).getTime() >= t,
  );
}

export function isLeadWithoutFirstContact(lead: Lead, activities: Activity[]): boolean {
  return !hasFirstContact(lead.id, activities);
}

export function isLeadWithoutNextStep(
  lead: Lead,
  activities: Activity[],
  today: Date | string,
): boolean {
  if (!isActiveLead(lead)) return false;
  const completed = completedActivitiesForLead(lead.id, activities);
  if (completed.length === 0) return false;
  return !hasFuturePlanned(lead.id, activities, today);
}

export function daysWithoutContact(
  lead: Lead,
  activities: Activity[],
  today: Date | string,
): number | null {
  const last = lastCompletedAt(lead.id, activities) ?? lead.lastContactAt;
  if (!last) return null;
  return daysBetween(last, today);
}

export function isLeadWithoutContactDays(
  lead: Lead,
  activities: Activity[],
  today: Date | string,
  minDays: number,
): boolean {
  if (!isActiveLead(lead)) return false;
  const days = daysWithoutContact(lead, activities, today);
  if (days == null) return isLeadWithoutFirstContact(lead, activities) && minDays <= 999;
  return days > minDays;
}

export function nextPlannedActivity(
  leadId: string,
  activities: Activity[],
  today: Date | string,
): Activity | null {
  const t = parseDate(today).getTime();
  return (
    activities
      .filter(
        (a) =>
          a.leadId === leadId &&
          a.status === "planned" &&
          parseDate(a.currentPlannedAt).getTime() >= t,
      )
      .sort(
        (a, b) =>
          parseDate(a.currentPlannedAt).getTime() -
          parseDate(b.currentPlannedAt).getTime(),
      )[0] ?? null
  );
}

export function analyticStatus(
  activity: Activity,
  today: Date | string,
): Activity["status"] | "overdue" {
  if (isOverdue(activity, today)) return "overdue";
  return activity.status;
}
