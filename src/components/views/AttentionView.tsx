"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import {
  attentionBuckets,
  type AttentionLeadRow,
} from "@/lib/analytics/kpi";
import { DataTable } from "@/components/DataTable";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { formatPlDate } from "@/lib/dates";
import { LEAD_STATUS_LABELS } from "@/types/enums";
import { cn } from "@/lib/utils";

export function AttentionView({ data }: { data: AppData }) {
  const { filters, today } = useFilters();
  const buckets = useMemo(
    () =>
      attentionBuckets(
        data.leads,
        data.activities,
        data.salespeople,
        filters,
        today,
      ),
    [data, filters, today],
  );
  const categories = Object.keys(buckets);
  const [active, setActive] = useState(categories[0] ?? "");
  const rows = buckets[active] ?? [];

  const columns = useMemo<ColumnDef<AttentionLeadRow>[]>(
    () => [
      {
        id: "company",
        accessorFn: (r) => r.lead.companyName,
        header: "Firma",
        cell: ({ row }) => (
          <Link
            href={`/leads/${row.original.lead.id}`}
            className="font-medium hover:underline"
          >
            {row.original.lead.companyName}
          </Link>
        ),
      },
      { accessorKey: "salespersonName", header: "Handlowiec" },
      {
        id: "status",
        accessorFn: (r) => r.lead.status,
        header: "Status leada",
        cell: ({ getValue }) =>
          LEAD_STATUS_LABELS[getValue() as keyof typeof LEAD_STATUS_LABELS],
      },
      {
        accessorKey: "lastActivityType",
        header: "Ostatnia aktywność",
        cell: ({ getValue }) => getValue<string | null>() ?? "—",
      },
      {
        accessorKey: "lastActivityAt",
        header: "Data ost. aktywności",
        cell: ({ getValue }) => formatPlDate(getValue<string | null>()),
      },
      {
        accessorKey: "daysWithoutContact",
        header: "Dni bez kontaktu",
        cell: ({ getValue }) => {
          const v = getValue<number | null>();
          return v == null ? "—" : String(v);
        },
      },
      {
        accessorKey: "nextPlannedAt",
        header: "Planowana kolejna",
        cell: ({ getValue }) => formatPlDate(getValue<string | null>()),
      },
      { accessorKey: "rescheduleCount", header: "Przełożenia" },
    ],
    [],
  );

  const csvRows = rows.map((r) => ({
    Firma: r.lead.companyName,
    Handlowiec: r.salespersonName,
    Status: LEAD_STATUS_LABELS[r.lead.status],
    "Ostatnia aktywność": r.lastActivityType ?? "",
    Data: r.lastActivityAt ?? "",
    "Dni bez kontaktu": r.daysWithoutContact ?? "",
    "Kolejna aktywność": r.nextPlannedAt ?? "",
    Przełożenia: r.rescheduleCount,
    Kategoria: r.category,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Klienci wymagający uwagi</h1>
          <p className="page-subtitle">
            Konkretne firmy z problemami procesowymi — nie same statystyki.
          </p>
        </div>
        <ExportCsvButton filename="uwaga-klienci.csv" rows={csvRows} />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium",
              active === cat
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            {cat} ({buckets[cat]?.length ?? 0})
          </button>
        ))}
      </div>

      <DataTable data={rows} columns={columns} />
    </div>
  );
}
