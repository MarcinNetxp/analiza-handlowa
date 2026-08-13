"use client";

import type { Salesperson } from "@/types/domain";
import type { DataSource } from "@/config/dataSource";
import { FilterProvider } from "@/contexts/FilterContext";
import { AppSidebar } from "./AppSidebar";
import { FilterBar } from "./FilterBar";
import { crmActivitiesListUrl } from "@/lib/crm/config";

export function AppShell({
  children,
  salespeople,
  today,
  dataSource,
  loadError,
}: {
  children: React.ReactNode;
  salespeople: Salesperson[];
  today: string;
  dataSource: DataSource;
  loadError?: string;
}) {
  return (
    <FilterProvider today={today}>
      <div className="min-h-screen font-sans text-ink-900">
        <header className="sticky top-0 z-10 border-b border-ink-200 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 items-center rounded-lg bg-brand-600 px-3 text-sm font-bold text-white">
                ngCRM
              </span>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-ink-900">
                  Analiza handlowa
                </p>
                <p className="label-caps -mt-0.5 text-brand-600">Insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <a
                href={crmActivitiesListUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 sm:inline-flex"
              >
                Wszystkie aktywności w CRM
              </a>
              <span className="label-caps rounded-full bg-ink-100 px-2.5 py-1 text-ink-600">
                {dataSource === "api" ? "Live CRM" : "Demo mock"}
              </span>
            </div>
          </div>
          <FilterBar salespeople={salespeople} />
        </header>

        {loadError ? (
          <div className="mx-auto max-w-7xl px-6 pt-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <strong>Błąd połączenia z CRM:</strong> {loadError}. Sprawdź
              zmienne CRM_* na Vercel lub ustaw DATA_SOURCE=mock.
            </div>
          </div>
        ) : null}

        <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
          <AppSidebar dataSource={dataSource} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </FilterProvider>
  );
}
