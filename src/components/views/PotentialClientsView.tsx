"use client";

import { useMemo, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import { CrmLink } from "@/components/CrmLink";
import { DataTable } from "@/components/DataTable";
import { KpiCard } from "@/components/KpiCard";
import { formatPlDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import {
  potentialClientStats,
  potentialClientStatusLabel,
  resolveStatusGroup,
  type PotentialClient,
} from "@/types/pipeline";
import type { ColumnDef } from "@tanstack/react-table";

type Chip =
  | "all"
  | "handling"
  | "rejected"
  | "recontact"
  | "inactive"
  | "cold"
  | "warm"
  | "contact"
  | "no_contact";

export function PotentialClientsView({
  data,
  showSalespersonColumn = false,
}: {
  data: AppData;
  showSalespersonColumn?: boolean;
}) {
  const { filters } = useFilters();
  const [chip, setChip] = useState<Chip>("all");

  const assigned = useMemo(() => {
    let rows = (data.potentialClients ?? []).filter((r) => !r.converted);
    if (filters.salespersonId !== "all") {
      rows = rows.filter((r) => r.salespersonId === filters.salespersonId);
    }
    return rows;
  }, [data.potentialClients, filters.salespersonId]);

  const stats = useMemo(() => potentialClientStats(assigned), [assigned]);

  const rows = useMemo(() => {
    switch (chip) {
      case "handling":
        return assigned.filter((r) => r.inHandling);
      case "rejected":
        return assigned.filter((r) => resolveStatusGroup(r) === "rejected");
      case "recontact":
        return assigned.filter((r) => resolveStatusGroup(r) === "recontact");
      case "inactive":
        return assigned.filter((r) => resolveStatusGroup(r) === "inactive");
      case "cold":
        return assigned.filter((r) => r.inHandling && r.temperature === "cold");
      case "warm":
        return assigned.filter((r) => r.inHandling && r.temperature === "warm");
      case "contact":
        return assigned.filter((r) => r.inHandling && r.hasContact);
      case "no_contact":
        return assigned.filter((r) => r.inHandling && !r.hasContact);
      default:
        return assigned;
    }
  }, [assigned, chip]);

  const columns = useMemo<ColumnDef<PotentialClient>[]>(
    () => [
      {
        accessorKey: "companyName",
        header: "Potencjalny klient",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-900">{row.original.companyName}</div>
            <div className="text-xs text-slate-500">{row.original.contactPerson}</div>
            <CrmLink href={row.original.crmUrl} label="Rekord w CRM" className="mt-1" />
          </div>
        ),
      },
      ...(showSalespersonColumn
        ? [
            {
              accessorKey: "salespersonName",
              header: "Handlowiec",
            } satisfies ColumnDef<PotentialClient>,
          ]
        : []),
      {
        accessorKey: "temperature",
        header: "Rodzaj",
        cell: ({ getValue }) =>
          getValue() === "warm" ? "Ciepły" : "Zimny",
      },
      {
        accessorKey: "status",
        header: "Status CRM",
        cell: ({ row }) => potentialClientStatusLabel(row.original),
      },
      {
        accessorKey: "hasContact",
        header: "Kontakt (aktywność)",
        cell: ({ getValue }) =>
          getValue() ? (
            <span className="text-emerald-700">Wykonany</span>
          ) : (
            <span className="font-medium text-rose-700">Brak kontaktu</span>
          ),
      },
      {
        accessorKey: "source",
        header: "Źródło",
      },
      {
        accessorKey: "createdAt",
        header: "Utworzono",
        cell: ({ getValue }) => formatPlDate(getValue<string | null>()),
      },
    ],
    [showSalespersonColumn],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Potencjalni klienci</h1>
        <p className="page-subtitle">
          Nowy, W trakcie obsługi, Odrzucony, Do ponownego kontaktu i Nieaktywny.
          Po konwersji na Kontakt znikają z tej listy.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Do obsługi" value={stats.assigned} />
        <KpiCard label="Odrzucony" value={stats.rejected} />
        <KpiCard label="Do ponownego kontaktu" value={stats.recontact} />
        <KpiCard label="Nieaktywny" value={stats.inactive} />
        <KpiCard label="Zimni" value={stats.cold} />
        <KpiCard label="Ciepli" value={stats.warm} tone="ok" />
        <KpiCard label="Z kontaktem" value={stats.withContact} tone="ok" />
        <KpiCard
          label="Bez kontaktu"
          value={stats.withoutContact}
          tone={stats.withoutContact > 0 ? "danger" : "ok"}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", `Wszyscy (${stats.visible})`],
            ["handling", `Do obsługi (${stats.assigned})`],
            ["rejected", `Odrzucony (${stats.rejected})`],
            ["recontact", `Do ponownego kontaktu (${stats.recontact})`],
            ["inactive", `Nieaktywny (${stats.inactive})`],
            ["cold", `Zimni (${stats.cold})`],
            ["warm", `Ciepli (${stats.warm})`],
            ["contact", `Z kontaktem (${stats.withContact})`],
            ["no_contact", `Bez kontaktu (${stats.withoutContact})`],
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

      <DataTable data={rows} columns={columns} />
    </div>
  );
}
