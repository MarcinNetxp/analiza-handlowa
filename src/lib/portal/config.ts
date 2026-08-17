/** Zdefiniowani handlowcy z dostępem do portalu (token w env). */
export const PORTAL_SALESPEOPLE = [
  { slug: "adrian-nowicki", firstName: "Adrian", lastName: "Nowicki" },
  { slug: "artur-zbrozyna", firstName: "Artur", lastName: "Zbrożyna" },
  { slug: "marcin-karolkiewicz", firstName: "Marcin", lastName: "Karolkiewicz" },
  { slug: "damian-swiecak", firstName: "Damian", lastName: "Świecak" },
  { slug: "izabela-wojciechowska", firstName: "Izabela", lastName: "Wojciechowska" },
  { slug: "jacek-zielinski", firstName: "Jacek", lastName: "Zieliński" },
  { slug: "dariusz-krzesniak", firstName: "Dariusz", lastName: "Krześniak" },
] as const;

export type PortalSlug = (typeof PORTAL_SALESPEOPLE)[number]["slug"];

export function portalPersonBySlug(slug: string) {
  return PORTAL_SALESPEOPLE.find((p) => p.slug === slug) ?? null;
}

/** JSON map slug → token, np. {"adrian-nowicki":"a1b2c3..."} */
export function readPortalTokens(): Record<string, string> {
  const raw = process.env.HANDLOWY_PORTAL_TOKENS?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k.toLowerCase(), String(v)]),
    );
  } catch {
    return {};
  }
}

export function validatePortalCredentials(slug: string, token: string): boolean {
  const person = portalPersonBySlug(slug);
  if (!person) return false;
  const tokens = readPortalTokens();
  const expected = tokens[slug.toLowerCase()];
  if (!expected) return false;
  return expected === token;
}

export function portalBasePath(slug: string, token: string): string {
  return `/p/${slug}/${token}`;
}
