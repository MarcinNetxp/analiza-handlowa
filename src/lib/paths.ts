/** Bazowa ścieżka aplikacji (pusty string = widok managera). */
export function joinAppPath(basePath: string, path: string): string {
  if (!basePath) return path.startsWith("/") ? path : `/${path}`;
  const sub = path.startsWith("/") ? path : `/${path}`;
  return `${basePath.replace(/\/$/, "")}${sub}`;
}

export function drilldownHref(
  type: string,
  basePath = "",
  salespersonId?: string,
): string {
  const params = new URLSearchParams({ type });
  if (salespersonId) params.set("salespersonId", salespersonId);
  return joinAppPath(basePath, `/drilldown?${params}`);
}

export function encodeRouteId(id: string): string {
  return encodeURIComponent(id);
}

export function decodeRouteId(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function leadHref(leadId: string, basePath = ""): string {
  return joinAppPath(basePath, `/leads/${encodeRouteId(leadId)}`);
}

export function salespersonHref(salespersonId: string, basePath = ""): string {
  return joinAppPath(basePath, `/salespeople/${encodeRouteId(salespersonId)}`);
}
