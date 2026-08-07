import type { Activity, Lead } from "@/types/domain";
import {
  firstContactAt,
  isActiveLead,
  isLeadWithoutNextStep,
  isMissingResult,
  isOnTimeCompletion,
  isOverdue,
} from "./rules";
import { hoursBetween } from "@/lib/dates";

export interface DisciplineBreakdown {
  timeliness: number;
  nextStepCoverage: number;
  noOverdue: number;
  resultCompleteness: number;
  firstResponseSpeed: number;
  total: number;
  explanations: string[];
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function computeDisciplineScore(
  salespersonId: string,
  leads: Lead[],
  activities: Activity[],
  today: string,
): DisciplineBreakdown {
  const myLeads = leads.filter((l) => l.salespersonId === salespersonId);
  const myActs = activities.filter((a) => a.salespersonId === salespersonId);
  const completed = myActs.filter((a) => a.status === "completed");
  const onTime = completed.filter(isOnTimeCompletion).length;
  const timeliness = completed.length ? onTime / completed.length : 0.5;

  const active = myLeads.filter(isActiveLead);
  const withNext = active.filter((l) => !isLeadWithoutNextStep(l, myActs, today));
  const nextStepCoverage = active.length ? withNext.length / active.length : 0.5;

  const overdue = myActs.filter((a) => isOverdue(a, today)).length;
  const plannedLike = myActs.filter(
    (a) => a.status === "planned" || isOverdue(a, today),
  ).length;
  const noOverdue =
    plannedLike + overdue === 0
      ? 1
      : clamp01(1 - overdue / Math.max(plannedLike, overdue, 1));

  const missing = completed.filter(isMissingResult).length;
  const resultCompleteness = completed.length
    ? 1 - missing / completed.length
    : 0.5;

  let fast48 = 0;
  let measured = 0;
  for (const lead of myLeads) {
    const first = firstContactAt(lead.id, myActs);
    if (!first) continue;
    measured += 1;
    if (hoursBetween(lead.createdAt, first) <= 48) fast48 += 1;
  }
  const firstResponseSpeed = measured ? fast48 / measured : 0.5;

  const total = Math.round(
    100 *
      (0.3 * timeliness +
        0.25 * nextStepCoverage +
        0.2 * noOverdue +
        0.15 * resultCompleteness +
        0.1 * firstResponseSpeed),
  );

  const explanations: string[] = [];
  if (timeliness >= 0.85) explanations.push("Dobra terminowość realizacji");
  else if (timeliness < 0.65)
    explanations.push("Niska terminowość — dużo działań po planowanym terminie");

  if (nextStepCoverage < 0.7)
    explanations.push(
      `Zbyt dużo leadów bez kolejnego kroku (${active.length - withNext.length})`,
    );
  else explanations.push("Większość aktywnych leadów ma zaplanowany kolejny krok");

  if (overdue > 0) explanations.push(`${overdue} zaległych wydarzeń po terminie`);
  else explanations.push("Brak zaległych aktywności po terminie");

  if (missing > 0)
    explanations.push(`${missing} wykonanych aktywności bez wpisanego wyniku`);
  else explanations.push("Wyniki aktywności uzupełniane kompletnie");

  if (firstResponseSpeed >= 0.7)
    explanations.push("Szybka pierwsza reakcja (duży udział ≤48h)");
  else if (measured > 0)
    explanations.push("Pierwsza reakcja często dłuższa niż 48h");

  return {
    timeliness,
    nextStepCoverage,
    noOverdue,
    resultCompleteness,
    firstResponseSpeed,
    total,
    explanations,
  };
}
