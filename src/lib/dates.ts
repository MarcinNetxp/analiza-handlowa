import {
  differenceInCalendarDays,
  differenceInHours,
  endOfDay,
  format,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

export function parseDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function toISODateTime(date: Date): string {
  return date.toISOString();
}

export function daysBetween(from: string | Date, to: string | Date): number {
  return differenceInCalendarDays(parseDate(to), parseDate(from));
}

export function hoursBetween(from: string | Date, to: string | Date): number {
  return differenceInHours(parseDate(to), parseDate(from));
}

export function defaultPeriod(referenceDate: Date = new Date()): {
  dateFrom: string;
  dateTo: string;
} {
  return {
    dateFrom: toISODate(subDays(referenceDate, 29)),
    dateTo: toISODate(referenceDate),
  };
}

export function inDateRange(
  iso: string,
  from: string,
  to: string,
): boolean {
  const d = parseDate(iso).getTime();
  return d >= startOfDay(parseDate(from)).getTime() && d <= endOfDay(parseDate(to)).getTime();
}

export function formatPlDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return format(parseDate(iso), "dd.MM.yyyy");
}

export function formatPlDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return format(parseDate(iso), "dd.MM.yyyy HH:mm");
}

export function startOfWeekMonday(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}
