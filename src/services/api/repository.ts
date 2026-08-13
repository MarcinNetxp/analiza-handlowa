import { buildDatasetFromCrm } from "@/lib/crm/buildDataset";
import { DATA_SOURCE } from "@/config/dataSource";
import type { Activity, Lead, Salesperson } from "@/types/domain";
import type { AppData } from "@/lib/data/load";

export async function listSalespeople(): Promise<Salesperson[]> {
  return (await loadCrmDataset()).salespeople;
}

export async function getSalesperson(id: string): Promise<Salesperson | null> {
  return (await loadCrmDataset()).salespeople.find((s) => s.id === id) ?? null;
}

export async function listLeads(): Promise<Lead[]> {
  return (await loadCrmDataset()).leads;
}

export async function getLead(id: string): Promise<Lead | null> {
  return (await loadCrmDataset()).leads.find((l) => l.id === id) ?? null;
}

export async function listActivities(): Promise<Activity[]> {
  return (await loadCrmDataset()).activities;
}

export async function getActivity(id: string): Promise<Activity | null> {
  return (await loadCrmDataset()).activities.find((a) => a.id === id) ?? null;
}

export async function getReferenceDate(): Promise<string> {
  return (await loadCrmDataset()).today;
}

async function loadCrmDataset(): Promise<AppData> {
  return buildDatasetFromCrm();
}

export { DATA_SOURCE };
