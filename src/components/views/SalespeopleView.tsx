"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import { computeSalespersonRows, type SalespersonRow } from "@/lib/analytics/kpi";
import { DataTable } from "@/components/DataTable";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { salespersonHref } from "@/lib/paths";
import { formatPercent } from "@/lib/utils";

export function SalespeopleView({ data }: { data: AppData }) {
  const { filters, today } = useFilters();
  const router = useRouter();

  const rows = useMemo(
    () =>
      computeSalespersonRows(
        data.salespeople,
        data.leads,
        data.activities,
        filters,
        today,
      ),
    [data, filters, today],
  );

  const columns = useMemo<ColumnDef<SalespersonRow>[]>(
    () => [
      {
        id: "name",
        accessorFn: (r) =>
          `${r.salesperson.firstName} ${r.salesperson.lastName}`,
        header: "Handlowiec",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              {row.original.salesperson.firstName}{" "}
              {row.original.salesperson.lastName}
            </div>
            <div className="text-xs text-slate-500">
              {row.original.salesperson.team}
              {row.original.salesperson.status === "inactive"
                ? " · nieaktywny"
                : ""}
            </div>
          </div>
        ),
      },
      { accessorKey: "activeLeads", header: "Aktywne leady" },
      { accessorKey: "planned", header: "Zaplanowane" },
      { accessorKey: "completed", header: "Wykonane" },
      {
        accessorKey: "timeliness",
        header: "Terminowość %",
        cell: ({ getValue }) => formatPercent(getValue<number>()),
      },
      { accessorKey: "overdue", header: "Po terminie" },
      { accessorKey: "rescheduled", header: "Przełożone" },
      { accessorKey: "cancelled", header: "Anulowane" },
      { accessorKey: "noResult", header: "Bez wyniku" },
      { accessorKey: "noNextStep", header: "Bez kolejnego kroku" },
      { accessorKey: "noContact14", header: "Bez kontaktu >14 dni" },
      { accessorKey: "meetings", header: "Spotkania" },
      { accessorKey: "nextContacts", header: "Umówione kolejne kontakty" },
      {
        accessorKey: "activityVolume",
        header: "Aktywność (wolumen)",
      },
      {
        accessorKey: "disciplineScore",
        header: "Dyscyplina procesu",
        cell: ({ getValue }) => `${getValue<number>()}/100`,
      },
    ],
    [],
  );

  const csvRows = rows.map((r) => ({
    Handlowiec: `${r.salesperson.firstName} ${r.salesperson.lastName}`,
    "Aktywne leady": r.activeLeads,
    Zaplanowane: r.planned,
    Wykonane: r.completed,
    Terminowość: formatPercent(r.timeliness),
    "Po terminie": r.overdue,
    Przełożone: r.rescheduled,
    Anulowane: r.cancelled,
    "Bez wyniku": r.noResult,
    "Bez kolejnego kroku": r.noNextStep,
    "Bez kontaktu >14": r.noContact14,
    Spotkania: r.meetings,
    "Kolejne kontakty": r.nextContacts,
    "Aktywność (wolumen)": r.activityVolume,
    "Dyscyplina procesu": r.disciplineScore,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Handlowcy</h1>
          <p className="page-subtitle">
            Porównanie wolumenu aktywności oraz dyscypliny procesu (osobne osie).
          </p>
        </div>
        <ExportCsvButton filename="handlowcy.csv" rows={csvRows} />
      </div>
      <DataTable
        data={rows}
        columns={columns}
        onRowClick={(row) => router.push(salespersonHref(row.salesperson.id))}
      />
    </div>
  );
}
