"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import { resolveDrilldown } from "@/lib/analytics/kpi";
import type { Activity, DrilldownType, Lead } from "@/types/domain";
import { DataTable } from "@/components/DataTable";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { CrmLink } from "@/components/CrmLink";
import { formatPlDateTime } from "@/lib/dates";
import {
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
  LEAD_STATUS_LABELS,
} from "@/types/enums";

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

  // Apply salesperson override from query once into local filter copy
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

  const leadColumns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "companyName",
        header: "Firma",
        cell: ({ row }) => (
          <Link
            href={`/leads/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.companyName}
          </Link>
        ),
      },
      {
        id: "sp",
        accessorFn: (l) => {
          const sp = data.salespeople.find((s) => s.id === l.salespersonId);
          return sp ? `${sp.firstName} ${sp.lastName}` : "—";
        },
        header: "Handlowiec",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) =>
          LEAD_STATUS_LABELS[getValue() as keyof typeof LEAD_STATUS_LABELS],
      },
      {
        accessorKey: "lastContactAt",
        header: "Ostatni kontakt",
        cell: ({ getValue }) => formatPlDateTime(getValue<string | null>()),
      },
    ],
    [data.salespeople],
  );

  const activityColumns = useMemo<ColumnDef<Activity>[]>(
    () => [
      {
        id: "company",
        accessorFn: (a) =>
          data.leads.find((l) => l.id === a.leadId)?.companyName ?? "—",
        header: "Firma",
        cell: ({ row }) => (
          <Link
            href={`/leads/${row.original.leadId}`}
            className="font-medium hover:underline"
          >
            {data.leads.find((l) => l.id === row.original.leadId)?.companyName ??
              "—"}
          </Link>
        ),
      },
      {
        accessorKey: "type",
        header: "Typ",
        cell: ({ getValue }) =>
          ACTIVITY_TYPE_LABELS[getValue() as keyof typeof ACTIVITY_TYPE_LABELS],
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div>
            {
              ACTIVITY_STATUS_LABELS[
                row.original.status as keyof typeof ACTIVITY_STATUS_LABELS
              ]
            }
            <CrmLink href={row.original.crmUrl} className="mt-1" />
          </div>
        ),
      },
      {
        accessorKey: "currentPlannedAt",
        header: "Termin",
        cell: ({ getValue }) => formatPlDateTime(getValue<string>()),
      },
      { accessorKey: "rescheduleCount", header: "Przełożenia" },
    ],
    [data.leads],
  );

  const csvRows =
    result.kind === "leads"
      ? result.leads.map((l) => ({
          Firma: l.companyName,
          Status: LEAD_STATUS_LABELS[l.status],
          "Ostatni kontakt": l.lastContactAt ?? "",
        }))
      : result.activities.map((a) => ({
          Firma:
            data.leads.find((l) => l.id === a.leadId)?.companyName ?? "",
          Typ: ACTIVITY_TYPE_LABELS[a.type],
          Status: ACTIVITY_STATUS_LABELS[a.status],
          Termin: a.currentPlannedAt,
        }));

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
