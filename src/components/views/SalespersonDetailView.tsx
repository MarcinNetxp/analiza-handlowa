"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import { computeDisciplineScore } from "@/lib/analytics/disciplineScore";
import {
  activityTypeStructure,
  computeDashboardKpis,
  resultStructure,
  weeklyActivityTrend,
} from "@/lib/analytics/kpi";
import { KpiCard } from "@/components/KpiCard";
import { ACTIVITY_RESULT_LABELS } from "@/types/enums";
import { formatPercent } from "@/lib/utils";
import type { Salesperson } from "@/types/domain";

import { drilldownHref, joinAppPath } from "@/lib/paths";

export function SalespersonDetailView({
  data,
  salesperson,
  basePath = "",
}: {
  data: AppData;
  salesperson: Salesperson;
  basePath?: string;
}) {
  const { filters, today } = useFilters();
  const spFilters = useMemo(
    () => ({ ...filters, salespersonId: salesperson.id }),
    [filters, salesperson.id],
  );

  const kpis = useMemo(
    () =>
      computeDashboardKpis(data.leads, data.activities, spFilters, today),
    [data, spFilters, today],
  );
  const discipline = useMemo(
    () =>
      computeDisciplineScore(
        salesperson.id,
        data.leads,
        data.activities,
        today,
      ),
    [salesperson.id, data, today],
  );
  const trend = useMemo(
    () => weeklyActivityTrend(data.activities, salesperson.id, today),
    [data.activities, salesperson.id, today],
  );
  const structure = useMemo(
    () => activityTypeStructure(data.activities, salesperson.id),
    [data.activities, salesperson.id],
  );
  const results = useMemo(
    () => resultStructure(data.activities, salesperson.id),
    [data.activities, salesperson.id],
  );

  const problems = [
    {
      label: `${kpis.noNextStep} leadów bez kolejnego kroku`,
      href: drilldownHref("no_next_step", basePath, salesperson.id),
      show: kpis.noNextStep > 0,
    },
    {
      label: `${kpis.overdue} wydarzeń po terminie`,
      href: drilldownHref("overdue", basePath, salesperson.id),
      show: kpis.overdue > 0,
    },
    {
      label: `${kpis.noContact30} leadów bez kontaktu od ponad 30 dni`,
      href: drilldownHref("no_contact_30", basePath, salesperson.id),
      show: kpis.noContact30 > 0,
    },
    {
      label: `${
        data.activities.filter(
          (a) =>
            a.salespersonId === salesperson.id &&
            a.status === "completed" &&
            !a.result,
        ).length
      } wykonanych aktywności bez wyniku`,
      href: drilldownHref("no_result", basePath, salesperson.id),
      show: true,
    },
  ].filter((p) => p.show && !p.label.startsWith("0 "));

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={basePath ? joinAppPath(basePath, "/") : "/salespeople"}
          className="text-xs text-slate-500 hover:underline"
        >
          ← {basePath ? "Pulpit" : "Handlowcy"}
        </Link>
        <h1 className="page-title mt-1">
          {salesperson.firstName} {salesperson.lastName}
        </h1>
        <p className="page-subtitle">
          {salesperson.team} · {salesperson.email}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Aktywne leady" value={kpis.activeLeads} />
        <KpiCard label="Wykonane aktywności" value={kpis.completed} tone="ok" />
        <KpiCard
          label="Terminowość"
          value={kpis.timeliness}
          format="percent"
          tone={kpis.timeliness >= 0.8 ? "ok" : "warn"}
        />
        <KpiCard
          label="Zaległe aktywności"
          value={kpis.overdue}
          href={drilldownHref("overdue", basePath, salesperson.id)}
          tone={kpis.overdue > 0 ? "danger" : "ok"}
        />
        <KpiCard
          label="Leady bez kolejnego kroku"
          value={kpis.noNextStep}
          href={drilldownHref("no_next_step", basePath, salesperson.id)}
          tone={kpis.noNextStep > 0 ? "danger" : "ok"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Dyscyplina procesu
          </div>
          <div className="mt-1 text-3xl font-semibold text-slate-900">
            {discipline.total}
            <span className="text-lg text-slate-400">/100</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            To nie jest ocena wyników sprzedażowych — tylko jakość prowadzenia
            procesu.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {discipline.explanations.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div>Terminowość: {formatPercent(discipline.timeliness)}</div>
            <div>Kolejny krok: {formatPercent(discipline.nextStepCoverage)}</div>
            <div>Brak zaległości: {formatPercent(discipline.noOverdue)}</div>
            <div>Wyniki: {formatPercent(discipline.resultCompleteness)}</div>
            <div>1. reakcja ≤48h: {formatPercent(discipline.firstResponseSpeed)}</div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="section-title">Aktywność (wolumen)</div>
          <p className="mt-1 text-xs text-slate-500">
            Osobna oś: ile działań wykonuje handlowiec — nie mylić z dyscypliną.
          </p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f172a" name="Aktywności" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="section-title">Struktura aktywności</div>
          <ul className="mt-3 space-y-1 text-sm">
            {structure.map((s) => (
              <li key={s.type} className="flex justify-between border-b border-slate-50 py-1">
                <span>{s.label}</span>
                <span className="font-medium">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="section-title">Wyniki działań</div>
          <ul className="mt-3 space-y-1 text-sm">
            {results.slice(0, 8).map((r) => (
              <li
                key={r.result}
                className="flex justify-between border-b border-slate-50 py-1"
              >
                <span>
                  {ACTIVITY_RESULT_LABELS[
                    r.result as keyof typeof ACTIVITY_RESULT_LABELS
                  ] ?? r.result}
                </span>
                <span className="font-medium">{r.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="section-title">Problemy</div>
        <ul className="mt-3 space-y-2">
          {problems.length === 0 ? (
            <li className="text-sm text-emerald-700">Brak istotnych problemów procesowych.</li>
          ) : (
            problems.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="block rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-800 hover:bg-rose-50"
                >
                  {p.label}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
