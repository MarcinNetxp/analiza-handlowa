import { NGCRM_API_URL, NGCRM_BFF_TOKEN } from "@/config/dataSource";
import type { AppData } from "./load";

export async function buildDatasetFromNgcrm(): Promise<AppData> {
  const headers: HeadersInit = { Accept: "application/json" };
  if (NGCRM_BFF_TOKEN) {
    headers["X-Handlowy-BFF-Token"] = NGCRM_BFF_TOKEN;
  }

  const res = await fetch(`${NGCRM_API_URL}/handlowy/bff/dataset`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail =
      (body as { detail?: string } | null)?.detail ??
      `ngCRM BFF HTTP ${res.status}`;
    throw new Error(detail);
  }

  const payload = (await res.json()) as AppData & { loadError?: string };
  return {
    salespeople: payload.salespeople ?? [],
    leads: payload.leads ?? [],
    activities: payload.activities ?? [],
    today: payload.today ?? new Date().toISOString(),
    dataSource: "ngcrm",
    crmConfigured: payload.crmConfigured ?? true,
    loadError: payload.loadError,
  };
}
