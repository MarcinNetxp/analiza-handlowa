import {
  activitiesService,
  leadsService,
  salespeopleService,
} from "@/services";
import type { Activity, Lead, Salesperson } from "@/types/domain";

export interface AppData {
  salespeople: Salesperson[];
  leads: Lead[];
  activities: Activity[];
  today: string;
}

export async function loadAppData(): Promise<AppData> {
  const [salespeople, leads, activities, today] = await Promise.all([
    salespeopleService.list(),
    leadsService.list(),
    activitiesService.list(),
    activitiesService.getReferenceDate(),
  ]);
  return { salespeople, leads, activities, today };
}
