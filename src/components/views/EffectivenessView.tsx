"use client";

import { useMemo } from "react";
import { useFilters } from "@/contexts/FilterContext";
import type { AppData } from "@/lib/data/load";
import {
  effectivenessMetrics,
  firstResponseMetrics,
} from "@/lib/analytics/kpi";
import { firstContactAt } from "@/lib/analytics/rules";
import { filterLeads } from "@/lib/analytics/filters";
import { hoursBetween } from "@/lib/dates";
import { formatPercent } from "@/lib/utils";
import { KpiCard } from "@/components/KpiCard";

export function EffectivenessView({ data }: { data: AppData }) {
  const { filters } = useFilters();
  const { today } = useFilters();
  const eff = useMemo(
    () =>
      effectivenessMetrics(data.activities, data.leads, filters, today),
    [data, filters, today],
  );
  const first = useMemo(
    () => firstResponseMetrics(data.leads, data.activities, filters),
    [data, filters],
  );

  const bySp = useMemo(() => {
    return data.salespeople
      .filter((s) => s.status === "active")
      .map((sp) => {
        const spFilters = { ...filters, salespersonId: sp.id };
        const m = firstResponseMetrics(data.leads, data.activities, spFilters);
        const leads = filterLeads(data.leads, spFilters);
        let sum = 0;
        let n = 0;
        for (const lead of leads) {
          const firstAt = firstContactAt(lead.id, data.activities);
          if (!firstAt) continue;
          sum += hoursBetween(lead.createdAt, firstAt);
          n += 1;
        }
        return {
          name: `${sp.firstName} ${sp.lastName}`,
          avg: n ? sum / n : null,
          pct24: m.pct24h,
          pct48: m.pct48h,
          noFirst: m.noFirstContact,
        };
      });
  }, [data, filters]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Skuteczność</h1>
        <p className="page-subtitle">
          Rezultaty działań kontaktowych — Contact Rate i jakość follow-upów.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="section-title">Telefon</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard label="Wykonane telefony" value={eff.phone.completed} />
          <KpiCard label="Kontakt nawiązany" value={eff.phone.contactMade} tone="ok" />
          <KpiCard label="Brak odpowiedzi" value={eff.phone.noResponse} tone="warn" />
          <KpiCard label="Umówione spotkania" value={eff.phone.meetingsScheduled} />
          <KpiCard
            label="Contact Rate"
            value={eff.phone.contactRate}
            format="percent"
            tone={eff.phone.contactRate >= 0.35 ? "ok" : "warn"}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="section-title">Spotkania</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <KpiCard label="Liczba spotkań" value={eff.meetings.count} />
          <KpiCard
            label="Zakończone przygotowaniem oferty"
            value={eff.meetings.offerPrep}
            tone="ok"
          />
          <KpiCard label="Kolejne kroki" value={eff.meetings.nextSteps} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="section-title">Follow-up</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Liczba follow-upów" value={eff.followUp.count} />
          <KpiCard label="Kolejne kontakty" value={eff.followUp.nextContacts} tone="ok" />
          <KpiCard label="Brak zainteresowania" value={eff.followUp.noInterest} />
          <KpiCard label="Brak odpowiedzi" value={eff.followUp.noResponse} tone="warn" />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="section-title">Tempo pierwszej reakcji</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            label="Średnia (h)"
            value={first.averageHours ?? 0}
            hint={first.averageHours == null ? "brak danych" : undefined}
          />
          <Mini label="Mediana" value={first.medianHours != null ? `${first.medianHours.toFixed(1)} h` : "—"} />
          <Mini label="% ≤24h" value={formatPercent(first.pct24h)} />
          <Mini label="% ≤48h" value={formatPercent(first.pct48h)} />
          <KpiCard
            label="Bez pierwszego kontaktu"
            value={first.noFirstContact}
            href="/drilldown?type=no_first_contact"
            tone={first.noFirstContact > 0 ? "danger" : "ok"}
          />
        </div>

        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Handlowiec</th>
                <th className="px-3 py-2 text-left">Śr. czas (h)</th>
                <th className="px-3 py-2 text-left">≤24h</th>
                <th className="px-3 py-2 text-left">≤48h</th>
                <th className="px-3 py-2 text-left">Bez 1. kontaktu</th>
              </tr>
            </thead>
            <tbody>
              {bySp.map((r) => (
                <tr key={r.name} className="border-t border-slate-100">
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">
                    {r.avg != null ? r.avg.toFixed(1) : "—"}
                  </td>
                  <td className="px-3 py-2">{formatPercent(r.pct24)}</td>
                  <td className="px-3 py-2">{formatPercent(r.pct48)}</td>
                  <td className="px-3 py-2">{r.noFirst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
