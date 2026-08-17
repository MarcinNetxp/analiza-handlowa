"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = params.get("next") || "/";
  const portalError = params.get("error") === "portal";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/manager", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Logowanie nie powiodło się.");
      return;
    }
    router.push(next.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Analiza handlowa</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Logowanie</h1>
        <p className="mt-2 text-sm text-slate-600">
          Widok managerski — pełny dostęp do wszystkich handlowców.
        </p>
        {portalError ? (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Nieprawidłowy link handlowca. Użyj osobistego adresu od przełożonego.
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-slate-600">
            Hasło managera
            <input
              type="password"
              className="input mt-1 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Logowanie…" : "Zaloguj"}
          </button>
        </form>
        <p className="mt-6 text-xs text-slate-500">
          Handlowcy: osobisty link{" "}
          <span className="font-mono">/p/imie-nazwisko/token</span>
        </p>
      </div>
    </div>
  );
}
