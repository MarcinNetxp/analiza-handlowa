"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { AppData } from "@/lib/data/load";
import type { Lead } from "@/types/domain";
import {
  daysWithoutContact,
  nextPlannedActivity,
  analyticStatus,
} from "@/lib/analytics/rules";
import { formatPlDate, formatPlDateTime, parseDate } from "@/lib/dates";
import { crmActivitiesListUrl } from "@/lib/crm/config";
import { CrmLink } from "@/components/CrmLink";
import {
  ACTIVITY_RESULT_LABELS,
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
  INTEREST_AREA_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  RELATED_TYPE_LABELS,
} from "@/types/enums";

export function LeadDetailView({
  data,
  lead,
}: {
  data: AppData;
  lead: Lead;
}) {
  const today = data.today;
  const sp = data.salespeople.find((s) => s.id === lead.salespersonId);
  const activities = useMemo(
    () =>
      data.activities
        .filter((a) => a.leadId === lead.id)
        .sort(
          (a, b) =>
            parseDate(a.currentPlannedAt).getTime() -
            parseDate(b.currentPlannedAt).getTime(),
        ),
    [data.activities, lead.id],
  );

  const next = nextPlannedActivity(lead.id, data.activities, today);
  const days = daysWithoutContact(lead, data.activities, today);
  const reschedules = activities.reduce((s, a) => s + a.rescheduleCount, 0);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/attention" className="text-xs text-slate-500 hover:underline">
          ← Klienci wymagający uwagi
        </Link>
        <h1 className="page-title mt-1">{lead.companyName}</h1>
        <p className="page-subtitle">
          {lead.contactPerson} ·{" "}
          {sp ? `${sp.firstName} ${sp.lastName}` : "—"} ·{" "}
          {LEAD_STATUS_LABELS[lead.status]} ·{" "}
          {RELATED_TYPE_LABELS[lead.relatedType]}
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <CrmLink href={lead.crmUrl} label="Rekord w CRM" />
          <CrmLink
            href={crmActivitiesListUrl()}
            label="Wszystkie aktywności"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Meta label="Ostatni kontakt" value={formatPlDate(lead.lastContactAt)} />
        <Meta
          label="Kolejny krok"
          value={
            next
              ? `${ACTIVITY_TYPE_LABELS[next.type]} · ${formatPlDate(next.currentPlannedAt)}`
              : "Brak"
          }
          danger={!next}
        />
        <Meta
          label="Dni bez kontaktu"
          value={days == null ? "—" : String(days)}
          danger={(days ?? 0) > 14}
        />
        <Meta label="Liczba aktywności" value={String(activities.length)} />
        <Meta label="Suma przełożeń" value={String(reschedules)} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <div>
          Źródło: {LEAD_SOURCE_LABELS[lead.source]} · Obszar:{" "}
          {INTEREST_AREA_LABELS[lead.interestArea]} · Utworzono:{" "}
          {formatPlDate(lead.createdAt)}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="section-title">Oś aktywności</h2>
        <ol className="relative mt-4 space-y-4 border-l border-slate-200 pl-5">
          {activities.map((a) => {
            const status = analyticStatus(a, today);
            return (
              <li key={a.id} className="relative">
                <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
                <div className="text-xs font-medium text-slate-500">
                  {formatPlDateTime(a.completedAt ?? a.currentPlannedAt)}
                </div>
                <div className="mt-0.5 font-medium text-slate-900">
                  {ACTIVITY_TYPE_LABELS[a.type]}
                </div>
                <div className="text-sm text-slate-700">
                  {status === "overdue"
                    ? "Po terminie"
                    : ACTIVITY_STATUS_LABELS[a.status]}
                  {a.result
                    ? ` · ${ACTIVITY_RESULT_LABELS[a.result]}`
                    : a.status === "completed"
                      ? " · brak wyniku"
                      : ""}
                </div>
                {a.note ? (
                  <div className="mt-1 text-xs text-slate-500">{a.note}</div>
                ) : null}
                {a.rescheduleCount > 0 ? (
                  <div className="mt-1 text-xs text-amber-700">
                    Przełożono {a.rescheduleCount}×
                  </div>
                ) : null}
                <CrmLink href={a.crmUrl} className="mt-1" />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-3 ${
        danger ? "border-rose-300" : "border-slate-200"
      }`}
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div
        className={`mt-1 text-sm font-semibold ${
          danger ? "text-rose-700" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
