export const COOKIE_NAME = "handlowy_session";

const DEFAULT_MANAGER_PASSWORD = "HandlowyMgr2026!";
const DEFAULT_MANAGER_SESSION_TOKEN =
  "f8c2a91e4b7d6035e1a94c82d56f0b37c9e2d148a6b03f5";

/** Wartość cookie sesji managera — env albo wbudowany fallback (Edge). */
export function getManagerSessionToken(): string {
  return process.env.MANAGER_SESSION_TOKEN?.trim() || DEFAULT_MANAGER_SESSION_TOKEN;
}

export function isValidManagerSession(cookieValue: string | undefined): boolean {
  const expected = getManagerSessionToken();
  if (!expected || !cookieValue) return false;
  return cookieValue === expected;
}

export function verifyManagerPassword(password: string): boolean {
  const expected =
    process.env.MANAGER_PASSWORD?.trim() || DEFAULT_MANAGER_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
