"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import { resolveDrilldown } from "@/lib/analytics/kpi";
import type { DrilldownType } from "@/types/domain";
import { DataTable } from "@/components/DataTable";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import {
  activityDrilldownCsvRows,
  buildActivityDrilldownColumns,
  buildLeadDrilldownColumns,
  leadDrilldownCsvRows,
} from "@/lib/drilldownColumns";

const TITLES: Record<DrilldownType, string> = {
  planned: "Zaplanowane aktywności",
  completed: "Wykonane aktywności",
  overdue: "Aktywności po terminie",
  rescheduled: "Przełożone aktywności",
  cancelled: "Anulowane aktywności",
  no_result: "Wykonane bez wyniku",
  no_next_step: "Leady bez kolejnego kroku",
  no_contact_7: "Leady bez kontaktu >7 dni",
  no_contact_14: "Leady bez kontaktu >14 dni",
  no_contact_30: "Leady bez kontaktu >30 dni",
  no_first_contact: "Leady bez pierwszego kontaktu",
  multi_reschedule: "Wielokrotnie przełożone",
  active_leads: "Aktywne leady",
  meetings: "Spotkania",
  next_contacts: "Umówione kolejne kontakty",
};

export function DrilldownView({
  data,
  type,
  salespersonId,
}: {
  data: AppData;
  type: DrilldownType;
  salespersonId?: string;
}) {
  const { filters, today, setFilters } = useFilters();

  const effectiveFilters = useMemo(() => {
    if (salespersonId) {
      return { ...filters, salespersonId };
    }
    return filters;
  }, [filters, salespersonId]);

  const result = useMemo(
    () =>
      resolveDrilldown(
        type,
        data.leads,
        data.activities,
        effectiveFilters,
        today,
      ),
    [type, data, effectiveFilters, today],
  );

  const leadColumns = useMemo(
    () => buildLeadDrilldownColumns(type, data.salespeople),
    [type, data.salespeople],
  );

  const activityColumns = useMemo(
    () => buildActivityDrilldownColumns(type, data.leads, data.salespeople),
    [type, data.leads, data.salespeople],
  );

  const csvRows =
    result.kind === "leads"
      ? leadDrilldownCsvRows(type, result.leads, data.salespeople)
      : activityDrilldownCsvRows(type, result.activities, data.leads, data.salespeople);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/" className="text-xs text-slate-500 hover:underline">
            ← Pulpit
          </Link>
          <h1 className="page-title mt-1">{TITLES[type] ?? type}</h1>
          <p className="page-subtitle">
            {result.kind === "leads"
              ? `${result.leads.length} firm`
              : `${result.activities.length} aktywności`}
            {salespersonId ? " · filtr handlowca z profilu" : ""}
          </p>
        </div>
        <ExportCsvButton filename={`drilldown-${type}.csv`} rows={csvRows} />
      </div>

      {salespersonId && filters.salespersonId !== salespersonId ? (
        <button
          type="button"
          className="text-xs text-slate-600 underline"
          onClick={() => setFilters({ salespersonId })}
        >
          Ustaw globalny filtr na tego handlowca
        </button>
      ) : null}

      {result.kind === "leads" ? (
        <DataTable data={result.leads} columns={leadColumns} />
      ) : (
        <DataTable data={result.activities} columns={activityColumns} />
      )}
    </div>
  );
}
