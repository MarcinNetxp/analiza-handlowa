"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultPeriod, toISODate } from "@/lib/dates";
import type { GlobalFilters } from "@/types/domain";
import type {
  ActivityResult,
  ActivityStatus,
  ActivityType,
  InterestArea,
  LeadSource,
} from "@/types/enums";

interface FilterContextValue {
  filters: GlobalFilters;
  setFilters: (patch: Partial<GlobalFilters>) => void;
  resetFilters: () => void;
  today: string;
}

const FilterContext = createContext<FilterContextValue | null>(null);

function initialFilters(today: string): GlobalFilters {
  const period = defaultPeriod(new Date(today));
  return {
    dateFrom: period.dateFrom,
    dateTo: period.dateTo,
    salespersonId: "all",
    activityType: "all",
    activityStatus: "all",
    activityResult: "all",
    leadSource: "all",
    interestArea: "all",
  };
}

export function FilterProvider({
  children,
  today,
}: {
  children: ReactNode;
  today: string;
}) {
  const [filters, setFiltersState] = useState<GlobalFilters>(() =>
    initialFilters(today),
  );

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      today,
      setFilters: (patch) => setFiltersState((prev) => ({ ...prev, ...patch })),
      resetFilters: () => setFiltersState(initialFilters(today)),
    }),
    [filters, today],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}

export type FilterOptionPatch = {
  salespersonId?: string | "all";
  activityType?: ActivityType | "all";
  activityStatus?: ActivityStatus | "all";
  activityResult?: ActivityResult | "all";
  leadSource?: LeadSource | "all";
  interestArea?: InterestArea | "all";
  dateFrom?: string;
  dateTo?: string;
};

export function useTodayIso() {
  return toISODate(new Date());
}
