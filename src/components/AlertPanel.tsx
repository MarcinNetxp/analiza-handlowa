"use client";

import Link from "next/link";
import type { AlertItem } from "@/lib/analytics/kpi";
import { cn } from "@/lib/utils";

export function AlertPanel({ alerts }: { alerts: AlertItem[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="text-sm font-semibold text-emerald-800">
          Wymaga uwagi
        </div>
        <p className="mt-1 text-sm text-emerald-700">
          Brak krytycznych alertów w wybranym okresie.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">Wymaga uwagi</div>
      <ul className="mt-3 space-y-2">
        {alerts.map((a) => (
          <li key={a.id}>
            <Link
              href={a.href}
              className={cn(
                "block rounded-md border px-3 py-2 text-sm transition-colors hover:bg-slate-50",
                a.severity === "danger"
                  ? "border-rose-200 text-rose-800"
                  : "border-amber-200 text-amber-800",
              )}
            >
              {a.message}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
