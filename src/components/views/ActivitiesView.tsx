"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import { filterActivitiesForDashboard } from "@/lib/analytics/filters";
import { analyticStatus } from "@/lib/analytics/rules";
import { DataTable } from "@/components/DataTable";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { CrmLink } from "@/components/CrmLink";
import { formatPlDateTime } from "@/lib/dates";
import type { Activity } from "@/types/domain";
import {
  ACTIVITY_RESULT_LABELS,
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
} from "@/types/enums";

type Row = Activity & {
  companyName: string;
  salespersonName: string;
  analytic: string;
};

export function ActivitiesView({ data }: { data: AppData }) {
  const { filters, today } = useFilters();

  const rows = useMemo(() => {
    const acts = filterActivitiesForDashboard(
      data.activities,
      data.leads,
      filters,
      today,
    );
    const leadMap = new Map(data.leads.map((l) => [l.id, l]));
    const spMap = new Map(
      data.salespeople.map((s) => [s.id, `${s.firstName} ${s.lastName}`]),
    );
    return acts.map((a) => {
      const status = analyticStatus(a, today);
      return {
        ...a,
        companyName: leadMap.get(a.leadId)?.companyName ?? "—",
        salespersonName: spMap.get(a.salespersonId) ?? "—",
        analytic:
          status === "overdue"
            ? "Po terminie"
            : ACTIVITY_STATUS_LABELS[a.status],
      };
    });
  }, [data, filters, today]);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "companyName",
        header: "Firma",
        cell: ({ row }) => (
          <Link
            href={`/leads/${row.original.leadId}`}
            className="font-medium text-slate-900 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.companyName}
          </Link>
        ),
      },
      { accessorKey: "salespersonName", header: "Handlowiec" },
      {
        accessorKey: "type",
        header: "Typ",
        cell: ({ getValue }) =>
          ACTIVITY_TYPE_LABELS[getValue() as keyof typeof ACTIVITY_TYPE_LABELS],
      },
      {
        accessorKey: "analytic",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span>{row.original.analytic}</span>
            <CrmLink href={row.original.crmUrl} label="Aktywność w CRM" />
          </div>
        ),
      },
      {
        accessorKey: "currentPlannedAt",
        header: "Termin",
        cell: ({ getValue }) => formatPlDateTime(getValue<string>()),
      },
      {
        accessorKey: "completedAt",
        header: "Wykonano",
        cell: ({ getValue }) => formatPlDateTime(getValue<string | null>()),
      },
      {
        accessorKey: "result",
        header: "Wynik",
        cell: ({ getValue }) => {
          const v = getValue<string | null>();
          if (!v) return "—";
          return ACTIVITY_RESULT_LABELS[v as keyof typeof ACTIVITY_RESULT_LABELS] ?? v;
        },
      },
      { accessorKey: "rescheduleCount", header: "Przełożenia" },
    ],
    [],
  );

  const csvRows = rows.map((r) => ({
    Firma: r.companyName,
    Handlowiec: r.salespersonName,
    Typ: ACTIVITY_TYPE_LABELS[r.type],
    Status: r.analytic,
    Termin: r.currentPlannedAt,
    Wykonano: r.completedAt ?? "",
    Wynik: r.result ?? "",
    Przełożenia: r.rescheduleCount,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Aktywności</h1>
          <p className="page-subtitle">
            Pełna lista działań w zakresie filtrów ({rows.length} rekordów).
          </p>
        </div>
        <ExportCsvButton filename="aktywnosci.csv" rows={csvRows} />
      </div>
      <DataTable data={rows} columns={columns} />
    </div>
  );
}
