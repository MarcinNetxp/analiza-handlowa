import type { AppData } from "@/lib/data/load";
import type { Salesperson } from "@/types/domain";
import { portalPersonBySlug } from "./config";

export function findSalespersonByPortalSlug(
  data: AppData,
  slug: string,
): Salesperson | null {
  const person = portalPersonBySlug(slug);
  if (!person) return null;

  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .trim();

  const targetFirst = norm(person.firstName);
  const targetLast = norm(person.lastName);

  return (
    data.salespeople.find(
      (sp) =>
        norm(sp.firstName) === targetFirst && norm(sp.lastName) === targetLast,
    ) ?? null
  );
}

export function filterAppDataForSalesperson(
  data: AppData,
  salespersonId: string,
): AppData {
  return {
    ...data,
    salespeople: data.salespeople.filter((s) => s.id === salespersonId),
    leads: data.leads.filter((l) => l.salespersonId === salespersonId),
    activities: data.activities.filter((a) => a.salespersonId === salespersonId),
  };
}
