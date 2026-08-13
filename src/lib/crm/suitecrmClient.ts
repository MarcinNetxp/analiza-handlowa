import { CRM_MODULE_ACTIVITIES, getCrmConfig } from "./config";

export class SuiteCrmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SuiteCrmError";
  }
}

type CrmRecord = Record<string, unknown> & { _id?: string; _type?: string };

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken(force = false): Promise<string> {
  const cfg = getCrmConfig();
  if (!cfg) {
    throw new SuiteCrmError(
      "Brak konfiguracji CRM — ustaw CRM_BASE_URL, CRM_API_CLIENT_ID, CRM_API_CLIENT_SECRET (Vercel → Environment Variables).",
    );
  }
  const now = Date.now();
  if (!force && tokenCache && now < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  });

  const resp = await fetch(`${cfg.baseUrl}/Api/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new SuiteCrmError(
      `OAuth2 CRM (${resp.status}): ${text.slice(0, 400)}`,
    );
  }
  const payload = (await resp.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!payload.access_token) {
    throw new SuiteCrmError("OAuth2: brak access_token w odpowiedzi CRM");
  }
  tokenCache = {
    token: payload.access_token,
    expiresAt: now + (payload.expires_in ?? 3600) * 1000,
  };
  return tokenCache.token;
}

async function crmGet(
  path: string,
  params?: Record<string, string>,
): Promise<Record<string, unknown>> {
  const cfg = getCrmConfig();
  if (!cfg) throw new SuiteCrmError("CRM nie skonfigurowane");

  const url = new URL(`${cfg.baseUrl}/Api/V8/${path.replace(/^\//, "")}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }

  const headers = {
    Authorization: `Bearer ${await getToken()}`,
    Accept: "application/vnd.api+json",
    "Content-Type": "application/json",
  };

  let resp = await fetch(url, { headers, cache: "no-store" });
  if (resp.status === 401) {
    headers.Authorization = `Bearer ${await getToken(true)}`;
    resp = await fetch(url, { headers, cache: "no-store" });
  }
  if (!resp.ok) {
    const text = await resp.text();
    throw new SuiteCrmError(`GET ${path} → ${resp.status}: ${text.slice(0, 600)}`);
  }
  if (!resp.headers.get("content-length") && !resp.body) return {};
  const text = await resp.text();
  if (!text) return {};
  return JSON.parse(text) as Record<string, unknown>;
}

export async function listModuleRecords(
  module: string,
  opts?: {
    pageSize?: number;
    maxPages?: number;
    filters?: Record<string, string>;
    fields?: string[];
    sort?: string;
  },
): Promise<CrmRecord[]> {
  const pageSize = opts?.pageSize ?? 100;
  const maxPages = opts?.maxPages ?? 200;
  const records: CrmRecord[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const params: Record<string, string> = {
      "page[size]": String(pageSize),
      "page[number]": String(page),
    };
    if (opts?.sort) params.sort = opts.sort;
    if (opts?.fields?.length) {
      params[`fields[${module}]`] = opts.fields.join(",");
    }
    if (opts?.filters) {
      for (const [k, v] of Object.entries(opts.filters)) params[k] = v;
    }

    const payload = await crmGet(`module/${module}`, params);
    const data = (payload.data as unknown[]) ?? [];
    if (!data.length) break;

    for (const item of data) {
      const row = item as {
        id?: string;
        type?: string;
        attributes?: Record<string, unknown>;
      };
      const attrs: CrmRecord = { ...(row.attributes ?? {}) };
      attrs._id = row.id;
      attrs._type = row.type ?? module;
      records.push(attrs);
    }

    const meta = (payload.meta as Record<string, unknown>) ?? {};
    const totalPages =
      (meta["total-pages"] as number | undefined) ??
      (meta.total_pages as number | undefined);
    if (totalPages != null && page >= totalPages) break;
    if (data.length < pageSize) break;
  }

  return records;
}

export async function getModuleRecord(
  module: string,
  recordId: string,
): Promise<CrmRecord> {
  const payload = await crmGet(`module/${module}/${recordId}`);
  const data = payload.data as {
    id?: string;
    type?: string;
    attributes?: Record<string, unknown>;
  };
  const attrs: CrmRecord = { ...(data?.attributes ?? {}) };
  attrs._id = data?.id ?? recordId;
  attrs._type = data?.type ?? module;
  return attrs;
}

export async function probeActivitiesModule(): Promise<Record<string, unknown>> {
  const cfg = getCrmConfig();
  const token = await getToken();
  const sample = await listModuleRecords(CRM_MODULE_ACTIVITIES, {
    pageSize: 2,
    maxPages: 1,
  });
  return {
    configured: Boolean(cfg),
    baseUrl: cfg?.baseUrl,
    module: CRM_MODULE_ACTIVITIES,
    tokenOk: Boolean(token),
    sampleCount: sample.length,
    sampleKeys: sample[0] ? Object.keys(sample[0]).sort() : [],
    sample: sample[0] ?? null,
  };
}
