import type { Activity, Lead, Salesperson } from "@/types/domain";

function notConfigured(): never {
  throw new Error(
    'DATA_SOURCE="api" — podłącz endpointy CRM w services/api/repository.ts. Mock jest dostępny przy DATA_SOURCE="mock".',
  );
}

export async function listSalespeople(): Promise<Salesperson[]> {
  notConfigured();
}

export async function getSalesperson(id: string): Promise<Salesperson | null> {
  void id;
  notConfigured();
}

export async function listLeads(): Promise<Lead[]> {
  notConfigured();
}

export async function getLead(id: string): Promise<Lead | null> {
  void id;
  notConfigured();
}

export async function listActivities(): Promise<Activity[]> {
  notConfigured();
}

export async function getActivity(id: string): Promise<Activity | null> {
  void id;
  notConfigured();
}

export async function getReferenceDate(): Promise<string> {
  notConfigured();
}
