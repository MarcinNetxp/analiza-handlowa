"use client";

import { useFilters } from "@/contexts/FilterContext";
import type { Salesperson } from "@/types/domain";
import {
  ACTIVITY_RESULT_LABELS,
  ACTIVITY_RESULTS,
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_STATUSES,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPES,
  INTEREST_AREA_LABELS,
  INTEREST_AREAS,
  LEAD_SOURCE_LABELS,
  LEAD_SOURCES,
} from "@/types/enums";
import { Button } from "./ui/button";

export function FilterBar({
  salespeople,
  hideSalespersonFilter = false,
}: {
  salespeople: Salesperson[];
  hideSalespersonFilter?: boolean;
}) {
  const { filters, setFilters, resetFilters } = useFilters();

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Okres od">
          <input
            type="date"
            className="input"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ dateFrom: e.target.value })}
          />
        </Field>
        <Field label="Okres do">
          <input
            type="date"
            className="input"
            value={filters.dateTo}
            onChange={(e) => setFilters({ dateTo: e.target.value })}
          />
        </Field>
        {!hideSalespersonFilter ? (
        <Field label="Handlowiec">
          <select
            className="input"
            value={filters.salespersonId}
            onChange={(e) =>
              setFilters({ salespersonId: e.target.value as "all" | string })
            }
          >
            <option value="all">Wszyscy</option>
            {salespeople.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
        </Field>
        ) : null}
        <Field label="Typ aktywności">
          <select
            className="input"
            value={filters.activityType}
            onChange={(e) =>
              setFilters({
                activityType: e.target.value as typeof filters.activityType,
              })
            }
          >
            <option value="all">Wszystkie</option>
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACTIVITY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className="input"
            value={filters.activityStatus}
            onChange={(e) =>
              setFilters({
                activityStatus: e.target.value as typeof filters.activityStatus,
              })
            }
          >
            <option value="all">Wszystkie</option>
            {ACTIVITY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ACTIVITY_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rezultat">
          <select
            className="input"
            value={filters.activityResult}
            onChange={(e) =>
              setFilters({
                activityResult: e.target.value as typeof filters.activityResult,
              })
            }
          >
            <option value="all">Wszystkie</option>
            {ACTIVITY_RESULTS.map((r) => (
              <option key={r} value={r}>
                {ACTIVITY_RESULT_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Źródło leada">
          <select
            className="input"
            value={filters.leadSource}
            onChange={(e) =>
              setFilters({
                leadSource: e.target.value as typeof filters.leadSource,
              })
            }
          >
            <option value="all">Wszystkie</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {LEAD_SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Obszar">
          <select
            className="input"
            value={filters.interestArea}
            onChange={(e) =>
              setFilters({
                interestArea: e.target.value as typeof filters.interestArea,
              })
            }
          >
            <option value="all">Wszystkie</option>
            {INTEREST_AREAS.map((a) => (
              <option key={a} value={a}>
                {INTEREST_AREA_LABELS[a]}
              </option>
            ))}
          </select>
        </Field>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Reset filtrów
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-[140px] flex-col gap-1 text-xs text-slate-500">
      <span>{label}</span>
      {children}
    </label>
  );
}
