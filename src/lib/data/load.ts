import { cache } from "react";
import { readDataSource } from "@/config/dataSource";
import { buildDatasetFromCrm } from "@/lib/crm/buildDataset";
import { buildDatasetFromNgcrm } from "@/lib/data/loadNgcrm";
import { getMockDataset } from "@/data/mock/store";
import type { Activity, Lead, Salesperson } from "@/types/domain";
import type { PotentialClient, SalesOpportunity } from "@/types/pipeline";
import type { DataSource } from "@/config/dataSource";

export interface AppData {
  salespeople: Salesperson[];
  leads: Lead[];
  activities: Activity[];
  potentialClients: PotentialClient[];
  opportunities: SalesOpportunity[];
  today: string;
  dataSource: DataSource;
  crmConfigured: boolean;
  loadError?: string;
}

export const loadAppData = cache(async function loadAppData(): Promise<AppData> {
  const source = readDataSource();

  if (source === "ngcrm") {
    try {
      return await buildDatasetFromNgcrm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nieznany błąd ładowania ngCRM BFF";
      console.error("[loadAppData] ngCRM BFF error:", message);
      return {
        salespeople: [],
        leads: [],
        activities: [],
        potentialClients: [],
        opportunities: [],
        today: new Date().toISOString(),
        dataSource: "ngcrm",
        crmConfigured: false,
        loadError: message,
      };
    }
  }

  if (source === "api") {
    try {
      return await buildDatasetFromCrm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nieznany błąd ładowania CRM";
      console.error("[loadAppData] CRM error:", message);
      return {
        salespeople: [],
        leads: [],
        activities: [],
        potentialClients: [],
        opportunities: [],
        today: new Date().toISOString(),
        dataSource: "api",
        crmConfigured: false,
        loadError: message,
      };
    }
  }

  const mock = getMockDataset();
  return {
    salespeople: mock.salespeople,
    leads: mock.leads,
    activities: mock.activities,
    potentialClients: [],
    opportunities: [],
    today: mock.referenceDate,
    dataSource: "mock",
    crmConfigured: false,
  };
});
