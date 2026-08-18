import type { AppData } from "@/lib/data/load";
import type { Salesperson } from "@/types/domain";
import {
  PORTAL_SALESPEOPLE,
  foldPersonName,
  matchesPortalPerson,
  portalPersonBySlug,
} from "./config";

export function findSalespersonByPortalSlug(
  data: AppData,
  slug: string,
): Salesperson | null {
  const person = portalPersonBySlug(slug);
  if (!person) return null;

  return (
    data.salespeople.find((sp) => matchesPortalPerson(person, sp)) ??
    data.salespeople.find((sp) => {
      const email = foldPersonName(person.email);
      const cand = foldPersonName(sp.email);
      return Boolean(email && cand === email);
    }) ??
    null
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
    potentialClients: (data.potentialClients ?? []).filter(
      (p) => p.salespersonId === salespersonId,
    ),
    opportunities: (data.opportunities ?? []).filter(
      (o) => o.salespersonId === salespersonId,
    ),
  };
}

function nameToCandidate(fullName: string): {
  firstName: string;
  lastName: string;
  email?: string;
} | null {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function isAnalyzedFullName(fullName: string): boolean {
  const cand = nameToCandidate(fullName);
  if (!cand) return false;
  return PORTAL_SALESPEOPLE.some((p) => matchesPortalPerson(p, cand));
}

/** Widok managera: tylko ustalona ósemka handlowców, bez adminów i innych ról CRM. */
export function filterAppDataForAnalyzedTeam(data: AppData): AppData {
  const allowedIds = new Set<string>();

  for (const sp of data.salespeople) {
    if (PORTAL_SALESPEOPLE.some((p) => matchesPortalPerson(p, sp))) {
      allowedIds.add(sp.id);
    }
  }

  const consider = (
    id: string | undefined,
    name: string | undefined,
  ) => {
    if (id && allowedIds.has(id)) return;
    if (name && isAnalyzedFullName(name) && id) allowedIds.add(id);
  };

  for (const row of data.potentialClients ?? []) {
    consider(row.salespersonId, row.salespersonName);
  }
  for (const row of data.opportunities ?? []) {
    consider(row.salespersonId, row.salespersonName);
  }
  for (const row of data.leads) {
    consider(row.salespersonId, undefined);
  }
  for (const row of data.activities) {
    consider(row.salespersonId, undefined);
  }

  const byId = new Map(data.salespeople.map((s) => [s.id, s]));
  const salespeople = PORTAL_SALESPEOPLE.map((def) => {
    const existing = [...byId.values()].find((sp) =>
      matchesPortalPerson(def, sp),
    );
    if (existing) return existing;
    const fromId = [...allowedIds]
      .map((id) => byId.get(id))
      .find((sp) => sp && matchesPortalPerson(def, sp));
    if (fromId) return fromId;
    return {
      id: `team:${def.slug}`,
      firstName: def.firstName,
      lastName: def.lastName,
      email: def.email,
      team: "Handlowy",
      status: "active" as const,
    };
  });

  for (const sp of salespeople) allowedIds.add(sp.id);

  return {
    ...data,
    salespeople,
    leads: data.leads.filter((l) => allowedIds.has(l.salespersonId)),
    activities: data.activities.filter((a) => allowedIds.has(a.salespersonId)),
    potentialClients: (data.potentialClients ?? []).filter((p) =>
      allowedIds.has(p.salespersonId),
    ),
    opportunities: (data.opportunities ?? []).filter((o) =>
      allowedIds.has(o.salespersonId),
    ),
  };
}
