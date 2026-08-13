export type DataSource = "mock" | "api" | "ngcrm";

function readDataSource(): DataSource {
  const v = process.env.DATA_SOURCE?.trim().toLowerCase();
  if (v === "api") return "api";
  if (v === "ngcrm") return "ngcrm";
  return "mock";
}

/** ngcrm = dane z ngCRM BFF (OAuth CRM tylko na serwerze). api = bezpośrednio SuiteCRM na Vercel. */
export const DATA_SOURCE: DataSource = readDataSource();

export const NGCRM_API_URL =
  process.env.NGCRM_API_URL?.replace(/\/$/, "") ??
  "https://crm.netxp.pl/ngcrm/api";

export const NGCRM_BFF_TOKEN = process.env.NGCRM_BFF_TOKEN?.trim() ?? "";
