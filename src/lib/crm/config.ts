export const CRM_MODULE_ACTIVITIES = "nxp_aktualnosci";

export interface CrmEnvConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  sslVerify: boolean;
  activitiesSince: string;
}

export function getCrmConfig(): CrmEnvConfig | null {
  const baseUrl = process.env.CRM_BASE_URL?.trim();
  const clientId = process.env.CRM_API_CLIENT_ID?.trim();
  const clientSecret = process.env.CRM_API_CLIENT_SECRET?.trim();
  if (!baseUrl || !clientId || !clientSecret) return null;
  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    clientId,
    clientSecret,
    sslVerify: process.env.CRM_SSL_VERIFY !== "false",
    activitiesSince:
      process.env.CRM_ACTIVITIES_SINCE?.trim() ||
      new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10),
  };
}

export function crmDetailUrl(
  module: string,
  recordId: string,
  baseUrl?: string,
): string {
  const root = (baseUrl || process.env.CRM_BASE_URL || "https://crm.netxp.pl")
    .replace(/\/$/, "");
  return `${root}/index.php?module=${module}&action=DetailView&record=${recordId}`;
}

export function crmActivitiesListUrl(baseUrl?: string): string {
  const root = (baseUrl || process.env.CRM_BASE_URL || "https://crm.netxp.pl")
    .replace(/\/$/, "");
  return `${root}/index.php?module=${CRM_MODULE_ACTIVITIES}&action=index&parentTab=Wszystko`;
}
