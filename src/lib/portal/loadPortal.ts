import { cache } from "react";
import { loadAppData } from "@/lib/data/load";
import { validatePortalCredentials } from "./config";
import {
  filterAppDataForSalesperson,
  findSalespersonByPortalSlug,
} from "./filterData";

export const loadPortalContext = cache(async function loadPortalContext(
  slug: string,
  token: string,
) {
  if (!validatePortalCredentials(slug, token)) {
    return null;
  }

  const full = await loadAppData();
  const salesperson = findSalespersonByPortalSlug(full, slug);
  if (!salesperson) {
    return {
      slug,
      token,
      salesperson: null as null,
      data: {
        ...full,
        salespeople: [],
        leads: [],
        activities: [],
        potentialClients: [],
        opportunities: [],
      },
      loadError:
        full.loadError ??
        "Nie znaleziono handlowca w danych CRM — sprawdź przypisanie aktywności w SuiteCRM.",
    };
  }

  return {
    slug,
    token,
    salesperson,
    data: filterAppDataForSalesperson(full, salesperson.id),
    loadError: full.loadError,
  };
});
