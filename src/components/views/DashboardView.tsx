"use client";

import { useMemo } from "react";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import {
  buildAlerts,
  computeDashboardKpis,
  firstResponseMetrics,
} from "@/lib/analytics/kpi";
import { AlertPanel } from "@/components/AlertPanel";
import { KpiCard } from "@/components/KpiCard";
import { formatPercent } from "@/lib/utils";

export function DashboardView({ data }: { data: AppData }) {
  const { filters, today } = useFilters();

  const kpis = useMemo(
    () =>
      computeDashboardKpis(data.leads, data.activities, filters, today),
    [data, filters, today],
  );
  const alerts = useMemo(
    () =>
      buildAlerts(
        data.leads,
        data.activities,
        data.salespeople,
        filters,
        today,
      ),
    [data, filters, today],
  );
  const first = useMemo(
    () => firstResponseMetrics(data.leads, data.activities, filters),
    [data, filters],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Pulpit</h1>
        <p className="page-subtitle">
          Czy zespół realizuje zaplanowaną pracę i regularnie obsługuje leady?
        </p>
      </div>

      <AlertPanel alerts={alerts} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Aktywne leady"
          value={kpis.activeLeads}
          href="/drilldown?type=active_leads"
        />
        <KpiCard
          label="Zaplanowane aktywności"
          value={kpis.planned}
          href="/drilldown?type=planned"
        />
        <KpiCard
          label="Wykonane aktywności"
          value={kpis.completed}
          href="/drilldown?type=completed"
          tone="ok"
        />
        <KpiCard
          label="Terminowość"
          value={kpis.timeliness}
          format="percent"
          tone={kpis.timeliness >= 0.8 ? "ok" : kpis.timeliness >= 0.65 ? "warn" : "danger"}
        />
        <KpiCard
          label="Po terminie"
          value={kpis.overdue}
          href="/drilldown?type=overdue"
          tone={kpis.overdue > 0 ? "danger" : "ok"}
        />
        <KpiCard
          label="Przełożone"
          value={kpis.rescheduled}
          href="/drilldown?type=rescheduled"
          tone={kpis.rescheduled > 20 ? "warn" : "neutral"}
        />
        <KpiCard
          label="Anulowane"
          value={kpis.cancelled}
          href="/drilldown?type=cancelled"
        />
        <KpiCard
          label="Leady bez kolejnego kroku"
          value={kpis.noNextStep}
          href="/drilldown?type=no_next_step"
          tone={kpis.noNextStep > 0 ? "danger" : "ok"}
          hint="Kluczowy KPI procesu"
        />
      </div>

      <div>
        <h2 className="section-title mb-3">Leady bez kontaktu</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            label="Ponad 7 dni"
            value={kpis.noContact7}
            href="/drilldown?type=no_contact_7"
            tone="warn"
          />
          <KpiCard
            label="Ponad 14 dni"
            value={kpis.noContact14}
            href="/drilldown?type=no_contact_14"
            tone="warn"
          />
          <KpiCard
            label="Ponad 30 dni"
            value={kpis.noContact30}
            href="/drilldown?type=no_contact_30"
            tone="danger"
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="section-title">Czas pierwszego kontaktu</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Mini
            label="Średnia"
            value={
              first.averageHours != null
                ? `${first.averageHours.toFixed(1)} h`
                : "—"
            }
          />
          <Mini
            label="Mediana"
            value={
              first.medianHours != null
                ? `${first.medianHours.toFixed(1)} h`
                : "—"
            }
          />
          <Mini label="≤ 24h" value={formatPercent(first.pct24h)} />
          <Mini label="≤ 48h" value={formatPercent(first.pct48h)} />
          <Mini
            label="Bez pierwszego kontaktu"
            value={String(first.noFirstContact)}
            href="/drilldown?type=no_first_contact"
          />
        </div>
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block hover:opacity-90">
        {inner}
      </a>
    );
  }
  return inner;
}
