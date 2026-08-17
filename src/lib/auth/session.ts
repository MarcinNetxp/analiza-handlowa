export const COOKIE_NAME = "handlowy_session";

/** Wartość cookie sesji managera — ustaw w Vercel (openssl rand -hex 24). */
export function getManagerSessionToken(): string {
  return process.env.MANAGER_SESSION_TOKEN?.trim() ?? "";
}

export function isValidManagerSession(cookieValue: string | undefined): boolean {
  const expected = getManagerSessionToken();
  if (!expected || !cookieValue) return false;
  return cookieValue === expected;
}

export function verifyManagerPassword(password: string): boolean {
  const expected = process.env.MANAGER_PASSWORD?.trim() ?? "";
  if (!expected) return false;
  return password === expected;
}
