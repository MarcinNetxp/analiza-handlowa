/** Zdefiniowani handlowcy objęci analizą (portal + widok managera). */
export const PORTAL_SALESPEOPLE = [
  {
    slug: "lukasz-bogucki",
    firstName: "Łukasz",
    lastName: "Bogucki",
    email: "lukasz.bogucki@netxp.pl",
  },
  {
    slug: "adrian-nowicki",
    firstName: "Adrian",
    lastName: "Nowicki",
    email: "adrian.nowicki@netxp.pl",
  },
  {
    slug: "damian-swiecak",
    firstName: "Damian",
    lastName: "Świecak",
    email: "damian.swiecak@netxp.pl",
  },
  {
    slug: "marcin-karolkiewicz",
    firstName: "Marcin",
    lastName: "Karolkiewicz",
    email: "marcin.karolkiewicz@netxp.pl",
  },
  {
    slug: "artur-zbrozyna",
    firstName: "Artur",
    lastName: "Zbrożyna",
    email: "artur.zbrozyna@netxp.pl",
  },
  {
    slug: "jacek-ziolkowski",
    slugAliases: ["jacek-zielinski"],
    firstName: "Jacek",
    lastName: "Ziółkowski",
    lastNameAliases: ["Zieliński"],
    email: "jacek.ziolkowski@netxp.pl",
  },
  {
    slug: "izabela-wojciechowska",
    firstName: "Izabela",
    lastName: "Wojciechowska",
    email: "izabela.wojciechowska@netxp.pl",
  },
  {
    slug: "dariusz-krzesniak",
    firstName: "Dariusz",
    lastName: "Krześniak",
    email: "dariusz.krzesniak@netxp.pl",
  },
] as const;

export type PortalSlug = (typeof PORTAL_SALESPEOPLE)[number]["slug"];

export type PortalPerson = (typeof PORTAL_SALESPEOPLE)[number];

/** Porównanie imion/nazwisk PL (ł nie rozpada się w NFD). */
export function foldPersonName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[łŁ]/g, "l")
    .toLowerCase()
    .trim();
}

export function lastNamesOf(person: PortalPerson): string[] {
  const aliases =
    "lastNameAliases" in person && Array.isArray(person.lastNameAliases)
      ? person.lastNameAliases
      : [];
  return [person.lastName, ...aliases];
}

export function matchesPortalPerson(
  person: PortalPerson,
  candidate: { firstName: string; lastName: string; email?: string },
): boolean {
  const email = foldPersonName(person.email);
  const candEmail = foldPersonName(candidate.email ?? "");
  if (
    email &&
    candEmail &&
    candEmail === email &&
    !candEmail.endsWith("@crm.local")
  ) {
    return true;
  }
  if (foldPersonName(candidate.firstName) !== foldPersonName(person.firstName)) {
    return false;
  }
  const last = foldPersonName(candidate.lastName);
  return lastNamesOf(person).some((n) => foldPersonName(n) === last);
}

/** Fallback, gdy env Edge nie wczyta HANDLOWY_PORTAL_TOKENS. */
const DEFAULT_PORTAL_TOKENS: Record<string, string> = {
  "adrian-nowicki": "974cc54871bec294",
  "artur-zbrozyna": "3f47477319229acc",
  "marcin-karolkiewicz": "ac8b618c582b6cca",
  "damian-swiecak": "a0d516543883de0a",
  "izabela-wojciechowska": "1d475a9c0a0077d0",
  "jacek-ziolkowski": "c14c9c067ae68ea0",
  "jacek-zielinski": "c14c9c067ae68ea0",
  "dariusz-krzesniak": "25a82613a05a2d29",
  "lukasz-bogucki": "b7e19c4a62f08d15",
};

export function portalPersonBySlug(slug: string) {
  const key = slug.toLowerCase();
  return (
    PORTAL_SALESPEOPLE.find((p) => p.slug === key) ??
    PORTAL_SALESPEOPLE.find(
      (p) =>
        "slugAliases" in p &&
        Array.isArray(p.slugAliases) &&
        p.slugAliases.includes(key),
    ) ??
    null
  );
}

export function canonicalPortalSlug(slug: string): string | null {
  return portalPersonBySlug(slug)?.slug ?? null;
}

/** JSON map slug → token, np. {"adrian-nowicki":"a1b2c3..."} */
export function readPortalTokens(): Record<string, string> {
  const raw = process.env.HANDLOWY_PORTAL_TOKENS?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      return {
        ...DEFAULT_PORTAL_TOKENS,
        ...Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k.toLowerCase(), String(v)]),
        ),
      };
    } catch {
      /* keep defaults */
    }
  }
  return DEFAULT_PORTAL_TOKENS;
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
