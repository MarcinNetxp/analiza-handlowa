export type DataSource = "mock" | "api" | "ngcrm";

/** Wywołuj przy każdym load — nie cache'uj na poziomie modułu (Next SSG). */
export function readDataSource(): DataSource {
  const v = process.env.DATA_SOURCE?.trim().toLowerCase();
  if (v === "mock") return "mock";
  if (v === "api") return "api";
  if (v === "ngcrm") return "ngcrm";
  // Produkcja Vercel: domyślnie BFF ngCRM (OAuth tylko na serwerze CRM).
  if (process.env.VERCEL === "1") return "ngcrm";
  return "mock";
}

/** @deprecated użyj readDataSource() w loadAppData */
export const DATA_SOURCE: DataSource = readDataSource();

export const NGCRM_API_URL =
  process.env.NGCRM_API_URL?.replace(/\/$/, "") ??
  "https://crm.netxp.pl/ngcrm/api";

export const NGCRM_BFF_TOKEN = process.env.NGCRM_BFF_TOKEN?.trim() ?? "";
