"use client";

import { useMemo } from "react";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import { qualityMetrics } from "@/lib/analytics/kpi";
import {
  isLeadWithoutFirstContact,
  isLeadWithoutNextStep,
  isMissingResult,
  isOverdue,
} from "@/lib/analytics/rules";
import { filterActivitiesForDashboard, filterLeads } from "@/lib/analytics/filters";
import { formatPercent } from "@/lib/utils";
import { ACTIVE_LEAD_STATUSES } from "@/types/enums";

export function QualityView({ data }: { data: AppData }) {
  const { filters, today } = useFilters();
  const metrics = useMemo(
    () => qualityMetrics(data.leads, data.activities, filters, today),
    [data, filters, today],
  );

  const rankings = useMemo(() => {
    return data.salespeople
      .filter((s) => s.status === "active")
      .map((sp) => {
        const spFilters = { ...filters, salespersonId: sp.id };
        const leads = filterLeads(data.leads, spFilters);
        const acts = filterActivitiesForDashboard(
          data.activities,
          data.leads,
          spFilters,
          today,
        );
        const active = leads.filter((l) =>
          ACTIVE_LEAD_STATUSES.includes(l.status),
        );
        const completed = acts.filter((a) => a.status === "completed");
        return {
          name: `${sp.firstName} ${sp.lastName}`,
          noFirst: leads.length
            ? leads.filter((l) => isLeadWithoutFirstContact(l, data.activities))
                .length / leads.length
            : 0,
          noNext: active.length
            ? active.filter((l) =>
                isLeadWithoutNextStep(l, data.activities, today),
              ).length / active.length
            : 0,
          overdue: acts.length
            ? acts.filter((a) => isOverdue(a, today)).length / acts.length
            : 0,
          noResult: completed.length
            ? completed.filter(isMissingResult).length / completed.length
            : 0,
          cancelled: acts.length
            ? acts.filter((a) => a.status === "cancelled").length / acts.length
            : 0,
          rescheduled: acts.length
            ? acts.filter((a) => a.rescheduleCount > 0).length / acts.length
            : 0,
        };
      });
  }, [data, filters, today]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Jakość obsługi</h1>
        <p className="page-subtitle">
          Błędy procesu — nie wolumen aktywności. Rankingi per parametr problemu.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="% leadów bez pierwszego kontaktu" value={formatPercent(metrics.pctNoFirstContact)} danger={metrics.pctNoFirstContact > 0.1} />
        <Metric label="% leadów bez kolejnego kroku" value={formatPercent(metrics.pctNoNextStep)} danger={metrics.pctNoNextStep > 0.2} />
        <Metric label="% działań po terminie" value={formatPercent(metrics.pctOverdue)} danger={metrics.pctOverdue > 0.1} />
        <Metric label="% działań przełożonych" value={formatPercent(metrics.pctRescheduled)} />
        <Metric label="% wykonanych bez wyniku" value={formatPercent(metrics.pctNoResult)} danger={metrics.pctNoResult > 0.1} />
        <Metric label="% anulowanych" value={formatPercent(metrics.pctCancelled)} />
        <Metric
          label="Śr. czas 1. kontaktu"
          value={
            metrics.avgFirstContactDays != null
              ? `${metrics.avgFirstContactDays.toFixed(1)} dni`
              : "—"
          }
        />
        <Metric
          label="Śr. czas między aktywnościami"
          value={
            metrics.avgGapDays != null
              ? `${metrics.avgGapDays.toFixed(1)} dni`
              : "—"
          }
        />
      </div>

      <Ranking
        title="Ranking: % leadów bez pierwszego kontaktu"
        rows={[...rankings].sort((a, b) => b.noFirst - a.noFirst)}
        value={(r) => formatPercent(r.noFirst)}
      />
      <Ranking
        title="Ranking: % leadów bez kolejnego kroku"
        rows={[...rankings].sort((a, b) => b.noNext - a.noNext)}
        value={(r) => formatPercent(r.noNext)}
      />
      <Ranking
        title="Ranking: % działań po terminie"
        rows={[...rankings].sort((a, b) => b.overdue - a.overdue)}
        value={(r) => formatPercent(r.overdue)}
      />
      <Ranking
        title="Ranking: % działań przełożonych"
        rows={[...rankings].sort((a, b) => b.rescheduled - a.rescheduled)}
        value={(r) => formatPercent(r.rescheduled)}
      />
      <Ranking
        title="Ranking: % wykonanych bez wyniku"
        rows={[...rankings].sort((a, b) => b.noResult - a.noResult)}
        value={(r) => formatPercent(r.noResult)}
      />
      <Ranking
        title="Ranking: % anulowanych działań"
        rows={[...rankings].sort((a, b) => b.cancelled - a.cancelled)}
        value={(r) => formatPercent(r.cancelled)}
      />
    </div>
  );
}

function Metric({
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
      className={`rounded-lg border bg-white p-4 ${
        danger ? "border-rose-300" : "border-slate-200"
      }`}
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div
        className={`mt-2 text-2xl font-semibold ${
          danger ? "text-rose-700" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Ranking({
  title,
  rows,
  value,
}: {
  title: string;
  rows: { name: string }[];
  value: (row: { name: string } & Record<string, number>) => string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="section-title">{title}</div>
      <ol className="mt-3 space-y-1 text-sm">
        {rows.map((r, i) => (
          <li
            key={r.name}
            className="flex items-center justify-between border-b border-slate-50 py-1.5"
          >
            <span>
              <span className="mr-2 text-slate-400">{i + 1}.</span>
              {r.name}
            </span>
            <span className="font-medium text-slate-800">
              {value(r as { name: string } & Record<string, number>)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
