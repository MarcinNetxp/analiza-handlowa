import { getMockDataset } from "@/data/mock/store";
import type { Activity, Lead, Salesperson } from "@/types/domain";

export async function listSalespeople(): Promise<Salesperson[]> {
  return getMockDataset().salespeople;
}

export async function getSalesperson(id: string): Promise<Salesperson | null> {
  return getMockDataset().salespeople.find((s) => s.id === id) ?? null;
}

export async function listLeads(): Promise<Lead[]> {
  return getMockDataset().leads;
}

export async function getLead(id: string): Promise<Lead | null> {
  return getMockDataset().leads.find((l) => l.id === id) ?? null;
}

export async function listActivities(): Promise<Activity[]> {
  return getMockDataset().activities;
}

export async function getActivity(id: string): Promise<Activity | null> {
  return getMockDataset().activities.find((a) => a.id === id) ?? null;
}

export async function getReferenceDate(): Promise<string> {
  return getMockDataset().referenceDate;
}
