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
  mode = "manager",
  basePath = "",
  lockedSalespersonId,
  portalTitle,
}: {
  children: React.ReactNode;
  salespeople: Salesperson[];
  today: string;
  dataSource: DataSource;
  loadError?: string;
  mode?: "manager" | "portal";
  basePath?: string;
  lockedSalespersonId?: string;
  portalTitle?: string;
}) {
  return (
    <FilterProvider today={today} lockedSalespersonId={lockedSalespersonId}>
      <div className="flex min-h-screen bg-slate-100 text-slate-900">
        <AppSidebar
          dataSource={dataSource}
          mode={mode}
          basePath={basePath}
          portalTitle={portalTitle}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <FilterBar salespeople={salespeople} hideSalespersonFilter={mode === "portal"} />
          {loadError ? (
            <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 lg:px-6">
              <strong>Błąd połączenia z CRM:</strong> {loadError}
            </div>
          ) : null}
          <main className="flex-1 px-4 py-5 lg:px-6">{children}</main>
        </div>
      </div>
    </FilterProvider>
  );
}
