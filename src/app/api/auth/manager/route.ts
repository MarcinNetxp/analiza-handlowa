import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  getManagerSessionToken,
  verifyManagerPassword,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!getManagerSessionToken() || !process.env.MANAGER_PASSWORD?.trim()) {
    return NextResponse.json(
      { error: "Logowanie managera nie jest skonfigurowane (MANAGER_PASSWORD / MANAGER_SESSION_TOKEN)." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password ?? "";

  if (!verifyManagerPassword(password)) {
    return NextResponse.json({ error: "Nieprawidłowe hasło." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, getManagerSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
