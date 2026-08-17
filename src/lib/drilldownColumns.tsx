"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { CrmLink } from "@/components/CrmLink";
import { formatPlDateTime } from "@/lib/dates";
import { leadHref } from "@/lib/paths";
import type { Activity, DrilldownType, Lead, Salesperson } from "@/types/domain";
import {
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
  LEAD_STATUS_LABELS,
} from "@/types/enums";

const LEAD_WITH_CRM: DrilldownType[] = [
  "active_leads",
  "no_next_step",
  "no_contact_7",
  "no_contact_14",
  "no_contact_30",
  "no_first_contact",
];

const ACTIVITY_WITH_SALESPERSON: DrilldownType[] = [
  "planned",
  "completed",
  "overdue",
  "rescheduled",
  "cancelled",
  "no_result",
  "meetings",
  "next_contacts",
  "multi_reschedule",
];

const ACTIVITY_WITH_CRM: DrilldownType[] = [
  "overdue",
  "rescheduled",
  "cancelled",
  "no_result",
  "meetings",
  "next_contacts",
  "multi_reschedule",
];

function spName(salespeople: Salesperson[], id: string): string {
  const sp = salespeople.find((s) => s.id === id);
  return sp ? `${sp.firstName} ${sp.lastName}` : "—";
}

export function buildLeadDrilldownColumns(
  type: DrilldownType,
  salespeople: Salesperson[],
  basePath = "",
): ColumnDef<Lead>[] {
  const cols: ColumnDef<Lead>[] = [
    {
      accessorKey: "companyName",
      header: "Kontakt",
      cell: ({ row }) => (
        <Link href={leadHref(row.original.id, basePath)} className="font-medium hover:underline">
          {row.original.companyName}
        </Link>
      ),
    },
    {
      id: "sp",
      header: "Handlowiec",
      accessorFn: (l) => spName(salespeople, l.salespersonId),
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
  ];
  if (LEAD_WITH_CRM.includes(type)) {
    cols.push({
      id: "crm",
      header: "CRM",
      cell: ({ row }) => <CrmLink href={row.original.crmUrl} label="Rekord w CRM" />,
    });
  }
  return cols;
}

export function buildActivityDrilldownColumns(
  type: DrilldownType,
  leads: Lead[],
  salespeople: Salesperson[],
  basePath = "",
): ColumnDef<Activity>[] {
  const cols: ColumnDef<Activity>[] = [
    {
      id: "company",
      header: "Kontakt",
      accessorFn: (a) => leads.find((l) => l.id === a.leadId)?.companyName ?? "—",
      cell: ({ row }) => (
        <Link href={leadHref(row.original.leadId, basePath)} className="font-medium hover:underline">
          {leads.find((l) => l.id === row.original.leadId)?.companyName ?? "—"}
        </Link>
      ),
    },
  ];

  if (ACTIVITY_WITH_SALESPERSON.includes(type)) {
    cols.push({
      id: "sp",
      header: "Handlowiec",
      accessorFn: (a) => spName(salespeople, a.salespersonId),
    });
  }

  cols.push(
    {
      accessorKey: "type",
      header: "Typ",
      cell: ({ getValue }) =>
        ACTIVITY_TYPE_LABELS[getValue() as keyof typeof ACTIVITY_TYPE_LABELS],
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) =>
        ACTIVITY_STATUS_LABELS[getValue() as keyof typeof ACTIVITY_STATUS_LABELS],
    },
    {
      accessorKey: "currentPlannedAt",
      header: "Termin",
      cell: ({ getValue }) => formatPlDateTime(getValue<string>()),
    },
    { accessorKey: "rescheduleCount", header: "Przełożenia" },
  );

  if (ACTIVITY_WITH_CRM.includes(type)) {
    cols.push({
      id: "crm",
      header: "CRM",
      cell: ({ row }) => (
        <CrmLink href={row.original.crmUrl} label="Aktywność w CRM" />
      ),
    });
  }

  return cols;
}

export function leadDrilldownCsvRows(
  type: DrilldownType,
  leads: Lead[],
  salespeople: Salesperson[],
) {
  return leads.map((l) => {
    const row: Record<string, string | number | null | undefined> = {
      Kontakt: l.companyName,
      Handlowiec: spName(salespeople, l.salespersonId),
      Status: LEAD_STATUS_LABELS[l.status],
      "Ostatni kontakt": l.lastContactAt ?? "",
    };
    if (LEAD_WITH_CRM.includes(type)) row.CRM = l.crmUrl ?? "";
    return row;
  });
}

export function activityDrilldownCsvRows(
  type: DrilldownType,
  activities: Activity[],
  leads: Lead[],
  salespeople: Salesperson[],
) {
  return activities.map((a) => {
    const row: Record<string, string | number | null | undefined> = {
      Kontakt: leads.find((l) => l.id === a.leadId)?.companyName ?? "",
      Typ: ACTIVITY_TYPE_LABELS[a.type],
      Status: ACTIVITY_STATUS_LABELS[a.status],
      Termin: a.currentPlannedAt,
      Przełożenia: a.rescheduleCount,
    };
    if (ACTIVITY_WITH_SALESPERSON.includes(type)) {
      row.Handlowiec = spName(salespeople, a.salespersonId);
    }
    if (ACTIVITY_WITH_CRM.includes(type)) row.CRM = a.crmUrl ?? "";
    return row;
  });
}
