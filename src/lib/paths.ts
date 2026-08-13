/** Id leadów/kontaktów ma postać `account:uuid` — kodujemy segment URL. */
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

export function leadHref(leadId: string): string {
  return `/leads/${encodeRouteId(leadId)}`;
}

export function salespersonHref(salespersonId: string): string {
  return `/salespeople/${encodeRouteId(salespersonId)}`;
}
