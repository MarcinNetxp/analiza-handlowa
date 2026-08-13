"use client";

import type { Salesperson } from "@/types/domain";
import type { DataSource } from "@/config/dataSource";
import { FilterProvider } from "@/contexts/FilterContext";
import { AppSidebar } from "./AppSidebar";
import { FilterBar } from "./FilterBar";

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
      <div className="flex min-h-screen bg-slate-100 text-slate-900">
        <AppSidebar dataSource={dataSource} />
        <div className="flex min-w-0 flex-1 flex-col">
          <FilterBar salespeople={salespeople} />
          {loadError ? (
            <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 lg:px-6">
              <strong>Błąd połączenia z CRM:</strong> {loadError}. Sprawdź
              zmienne CRM_* na Vercel lub ustaw DATA_SOURCE=mock.
            </div>
          ) : null}
          <main className="flex-1 px-4 py-5 lg:px-6">{children}</main>
        </div>
      </div>
    </FilterProvider>
  );
}
