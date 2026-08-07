"use client";

import type { Salesperson } from "@/types/domain";
import { FilterProvider } from "@/contexts/FilterContext";
import { AppSidebar } from "./AppSidebar";
import { FilterBar } from "./FilterBar";

export function AppShell({
  children,
  salespeople,
  today,
}: {
  children: React.ReactNode;
  salespeople: Salesperson[];
  today: string;
}) {
  return (
    <FilterProvider today={today}>
      <div className="flex min-h-screen bg-slate-100 text-slate-900">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <FilterBar salespeople={salespeople} />
          <main className="flex-1 px-4 py-5 lg:px-6">{children}</main>
        </div>
      </div>
    </FilterProvider>
  );
}
