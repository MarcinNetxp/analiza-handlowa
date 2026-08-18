"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import { CrmLink } from "@/components/CrmLink";
import { DataTable } from "@/components/DataTable";
import { KpiCard } from "@/components/KpiCard";
import { formatPlDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { opportunityStats, type SalesOpportunity } from "@/types/pipeline";

type Chip = "open" | "overdue" | "on_track";

function truncate(text: string, max = 48): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function OpportunitiesPipelineView({
  data,
  showSalespersonColumn = false,
}: {
  data: AppData;
  showSalespersonColumn?: boolean;
}) {
  const { filters } = useFilters();
  const [chip, setChip] = useState<Chip>("open");

  const scoped = useMemo(() => {
    let rows = data.opportunities ?? [];
    if (filters.salespersonId !== "all") {
      rows = rows.filter((r) => r.salespersonId === filters.salespersonId);
    }
    return rows;
  }, [data.opportunities, filters.salespersonId]);

  const stats = useMemo(() => opportunityStats(scoped), [scoped]);

  const rows = useMemo(() => {
    switch (chip) {
      case "overdue":
        return scoped.filter((r) => !r.closed && r.overdue);
      case "on_track":
        return scoped.filter((r) => !r.closed && !r.overdue);
      default:
        return scoped.filter((r) => !r.closed);
    }
  }, [scoped, chip]);

  const columns = useMemo<ColumnDef<SalesOpportunity>[]>(
    () => [
      {
        accessorKey: "accountName",
        header: "Kontrahent",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-900">{row.original.accountName}</div>
            <CrmLink
              href={row.original.accountCrmUrl}
              label="Kontrahent w CRM"
              className="mt-1"
            />
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Nazwa szansy",
        cell: ({ row }) => (
          <div>
            <div className="max-w-[18rem] font-medium text-slate-900" title={row.original.name}>
              {truncate(row.original.name)}
            </div>
            <CrmLink href={row.original.crmUrl} label="Szansa w CRM" className="mt-1" />
          </div>
        ),
      },
      ...(showSalespersonColumn
        ? [
            {
              accessorKey: "salespersonName",
              header: "Handlowiec",
            } satisfies ColumnDef<SalesOpportunity>,
          ]
        : []),
      {
        accessorKey: "createdAt",
        header: "Data utworzenia",
        cell: ({ getValue }) => formatPlDate(getValue<string | null>()),
      },
      {
        accessorKey: "technology",
        header: "Technologia",
      },
      {
        id: "stage",
        header: "Etap sprzedaży",
        accessorFn: (r) => r.probability,
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.probability}%</div>
            <div className="text-xs text-slate-500">{row.original.salesStage}</div>
          </div>
        ),
      },
      {
        accessorKey: "expectedCloseAt",
        header: "Oczekiwane zamknięcie",
        cell: ({ row }) => (
          <span className={row.original.overdue ? "font-semibold text-rose-700" : ""}>
            {formatPlDate(row.original.expectedCloseAt)}
            {row.original.overdue ? " · po terminie" : ""}
          </span>
        ),
      },
    ],
    [showSalespersonColumn],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Szanse sprzedaży</h1>
        <p className="page-subtitle">
          Tylko otwarte szanse (bez Closed Won / Closed Lost). Po terminie oczekiwanej daty
          zamknięcia — czerwone, do pilnego działania.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Otwarte szanse" value={stats.open} />
        <KpiCard label="W terminie" value={stats.onTrack} tone="ok" />
        <KpiCard
          label="Po terminie zamknięcia"
          value={stats.overdue}
          tone={stats.overdue > 0 ? "danger" : "ok"}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["open", `Otwarte (${stats.open})`],
            ["overdue", `Po terminie (${stats.overdue})`],
            ["on_track", `W terminie (${stats.onTrack})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setChip(id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium",
              chip === id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowClassName={(r) =>
          r.overdue ? "bg-rose-50 hover:bg-rose-100/70" : undefined
        }
      />
    </div>
  );
}
