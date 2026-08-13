import { CRM_MODULE_ACTIVITIES, getCrmConfig } from "./config";
import {
  enrichActivitiesAndLeads,
  mapActivityRecord,
  mapLeadRecord,
  mapSalespersonFromActivity,
} from "./mapping";
import { listModuleRecords } from "./suitecrmClient";
import type { AppData } from "@/lib/data/load";
import type { Lead, RelatedEntityType } from "@/types/domain";

let datasetCache: { data: AppData; expiresAt: number } | null = null;
const CACHE_MS = 120_000;

export async function buildDatasetFromCrm(): Promise<AppData> {
  const now = Date.now();
  if (datasetCache && now < datasetCache.expiresAt) {
    return datasetCache.data;
  }

  const cfg = getCrmConfig();
  if (!cfg) {
    throw new Error("CRM nie skonfigurowane — brak zmiennych środowiskowych");
  }

  const filters: Record<string, string> = {};
  if (cfg.activitiesSince) {
    filters["filter[date_entered][gte]"] = cfg.activitiesSince;
  }

  const rawActivities = await listModuleRecords(CRM_MODULE_ACTIVITIES, {
    pageSize: 100,
    maxPages: 300,
    filters,
    sort: "-date_entered",
  });

  const activities = rawActivities
    .map((r) => mapActivityRecord(r, cfg.baseUrl))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const leadsMap = new Map<string, Lead>();
  const salespeopleMap = new Map<string, ReturnType<typeof mapSalespersonFromActivity>>();

  for (const rec of rawActivities) {
    const sp = mapSalespersonFromActivity(rec);
    if (sp) salespeopleMap.set(sp.id, sp);
  }

  const relatedIds = new Map<RelatedEntityType, Set<string>>();
  for (const a of activities) {
    if (!a.relatedCrmId || a.relatedType === "unknown") continue;
    const set = relatedIds.get(a.relatedType) ?? new Set();
    set.add(a.relatedCrmId);
    relatedIds.set(a.relatedType, set);
  }

  await Promise.all([
    loadRelatedModule("lead", "Leads", relatedIds, leadsMap, cfg.baseUrl),
    loadRelatedModule("contact", "Contacts", relatedIds, leadsMap, cfg.baseUrl),
    loadRelatedModule("account", "Accounts", relatedIds, leadsMap, cfg.baseUrl),
  ]);

  for (const a of activities) {
    if (leadsMap.has(a.leadId)) continue;
    if (!a.relatedCrmId) continue;
    leadsMap.set(a.leadId, {
      id: a.leadId,
      crmId: a.relatedCrmId,
      crmUrl: a.relatedCrmUrl,
      relatedType: a.relatedType,
      companyName: a.relatedLabel,
      contactPerson: a.relatedLabel,
      salespersonId: a.salespersonId,
      createdAt: a.createdAt,
      status: "in_progress",
      source: "marketing",
      interestArea: "lan_wlan",
      lastActivityId: null,
      lastContactAt: null,
    });
  }

  enrichActivitiesAndLeads(activities, leadsMap);

  const data: AppData = {
    salespeople: [...salespeopleMap.values()].filter(
      (s): s is NonNullable<typeof s> => Boolean(s),
    ),
    leads: [...leadsMap.values()],
    activities,
    today: new Date().toISOString(),
    dataSource: "api",
    crmConfigured: true,
  };

  datasetCache = { data, expiresAt: Date.now() + CACHE_MS };
  return data;
}

async function loadRelatedModule(
  relatedType: RelatedEntityType,
  module: string,
  relatedIds: Map<RelatedEntityType, Set<string>>,
  leadsMap: Map<string, Lead>,
  baseUrl: string,
) {
  const ids = relatedIds.get(relatedType);
  if (!ids?.size) return;

  const records = await listModuleRecords(module, {
    pageSize: 100,
    maxPages: 100,
  });

  for (const rec of records) {
    const crmId = String(rec._id ?? "");
    if (!ids.has(crmId)) continue;
    const lead = mapLeadRecord(rec, relatedType, baseUrl);
    if (lead) leadsMap.set(lead.id, lead);
  }
}
