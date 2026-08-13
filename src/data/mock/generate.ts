import { addDays, addHours, subDays, subMonths } from "date-fns";
import type { Activity, Lead, MockDataset, Salesperson } from "@/types/domain";
import {
  ACTIVITY_RESULTS,
  ACTIVITY_TYPES,
  CANCELLATION_REASONS,
  INTEREST_AREAS,
  LEAD_SOURCES,
  type ActivityResult,
  type ActivityStatus,
  type ActivityType,
  type LeadStatus,
} from "@/types/enums";

/** Deterministic PRNG (mulberry32). */
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function chance(rng: () => number, p: number): boolean {
  return rng() < p;
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

const FIRST_NAMES = [
  "Anna",
  "Piotr",
  "Marek",
  "Katarzyna",
  "Tomasz",
  "Magdalena",
  "Jakub",
  "Aleksandra",
  "Paweł",
  "Natalia",
];
const LAST_NAMES = [
  "Kowalski",
  "Nowak",
  "Wiśniewski",
  "Wójcik",
  "Kamiński",
  "Lewandowski",
  "Zieliński",
  "Szymański",
  "Woźniak",
  "Dąbrowski",
];
const COMPANY_PREFIX = [
  "Net",
  "Tech",
  "Cyber",
  "Data",
  "Cloud",
  "Secure",
  "Smart",
  "Pro",
  "Alpha",
  "Nova",
  "Prime",
  "Logic",
  "Byte",
  "Fiber",
  "Signal",
];
const COMPANY_SUFFIX = [
  "Systems",
  "Solutions",
  "Group",
  "Sp. z o.o.",
  "Poland",
  "Services",
  "Partners",
  "Labs",
  "Consulting",
  "Networks",
];

function companyName(rng: () => number, i: number): string {
  return `${pick(rng, COMPANY_PREFIX)}${pick(rng, COMPANY_SUFFIX)} ${i + 1}`;
}

function salespersonList(): Salesperson[] {
  return [
    {
      id: "sp-01",
      firstName: "Marta",
      lastName: "Kowalska",
      email: "marta.kowalska@example.com",
      team: "Zespół Enterprise",
      status: "active",
      archetype: "top_discipline",
    },
    {
      id: "sp-02",
      firstName: "Adam",
      lastName: "Nowak",
      email: "adam.nowak@example.com",
      team: "Zespół SMB",
      status: "active",
      archetype: "high_volume_low_result",
    },
    {
      id: "sp-03",
      firstName: "Paweł",
      lastName: "Wiśniewski",
      email: "pawel.wisniewski@example.com",
      team: "Zespół Enterprise",
      status: "active",
      archetype: "overdue_heavy",
    },
    {
      id: "sp-04",
      firstName: "Karolina",
      lastName: "Zielińska",
      email: "karolina.zielinska@example.com",
      team: "Zespół SMB",
      status: "active",
      archetype: "reschedule_heavy",
    },
    {
      id: "sp-05",
      firstName: "Tomasz",
      lastName: "Lewandowski",
      email: "tomasz.lewandowski@example.com",
      team: "Zespół Partner",
      status: "active",
      archetype: "average",
    },
    {
      id: "sp-06",
      firstName: "Ewa",
      lastName: "Kamińska",
      email: "ewa.kaminska@example.com",
      team: "Zespół Partner",
      status: "active",
      archetype: "average",
    },
    {
      id: "sp-07",
      firstName: "Michał",
      lastName: "Szymański",
      email: "michal.szymanski@example.com",
      team: "Zespół SMB",
      status: "active",
      archetype: "average",
    },
    {
      id: "sp-08",
      firstName: "Joanna",
      lastName: "Dąbrowska",
      email: "joanna.dabrowska@example.com",
      team: "Zespół Enterprise",
      status: "inactive",
      archetype: "inactive",
    },
  ];
}

function weightedType(rng: () => number, archetype: Salesperson["archetype"]): ActivityType {
  if (archetype === "high_volume_low_result") {
    return chance(rng, 0.65) ? "phone" : pick(rng, ACTIVITY_TYPES);
  }
  if (archetype === "reschedule_heavy") {
    return chance(rng, 0.45)
      ? pick(rng, ["meeting_online", "meeting_in_person"] as const)
      : pick(rng, ACTIVITY_TYPES);
  }
  const weights: ActivityType[] = [
    "phone",
    "phone",
    "phone",
    "email",
    "email",
    "follow_up",
    "follow_up",
    "meeting_online",
    "meeting_in_person",
    "offer_prep",
    "other",
  ];
  return pick(rng, weights);
}

function resultFor(
  rng: () => number,
  archetype: Salesperson["archetype"],
  type: ActivityType,
): ActivityResult | null {
  if (archetype === "high_volume_low_result") {
    return pick(rng, ["no_response", "no_response", "no_interest", "contact_made", "wrong_contact"] as const);
  }
  if (type === "phone" || type === "email") {
    return pick(rng, [
      "contact_made",
      "no_response",
      "next_contact_scheduled",
      "meeting_scheduled",
      "materials_sent",
      "no_interest",
    ] as const);
  }
  if (type === "meeting_online" || type === "meeting_in_person") {
    return pick(rng, ["offer_agreed", "next_contact_scheduled", "no_interest", "materials_sent"] as const);
  }
  if (type === "follow_up") {
    return pick(rng, ["next_contact_scheduled", "no_response", "no_interest", "contact_made"] as const);
  }
  return pick(rng, ACTIVITY_RESULTS);
}

export function generateMockDataset(seed = 20260807): MockDataset {
  const rng = createRng(seed);
  const referenceDate = new Date("2026-08-07T12:00:00.000Z");
  const windowStart = subMonths(referenceDate, 6);
  const salespeople = salespersonList();
  const activeSalespeople = salespeople.filter((s) => s.status === "active");

  const leads: Lead[] = [];
  const leadCount = 260;

  for (let i = 0; i < leadCount; i++) {
    const sp = pick(rng, activeSalespeople);
    const createdAt = addDays(windowStart, randInt(rng, 0, 180));
    let status: LeadStatus = pick(rng, [
      "new",
      "in_progress",
      "in_progress",
      "qualified",
      "proposal",
      "won",
      "lost",
      "disqualified",
    ] as const);

    // Newer leads more often "new"
    if (daysFrom(createdAt, referenceDate) < 14 && chance(rng, 0.5)) status = "new";

    leads.push({
      id: `lead-${String(i + 1).padStart(4, "0")}`,
      relatedType: "lead",
      companyName: companyName(rng, i),
      contactPerson: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
      salespersonId: sp.id,
      createdAt: createdAt.toISOString(),
      status,
      source: pick(rng, LEAD_SOURCES),
      interestArea: pick(rng, INTEREST_AREAS),
      lastActivityId: null,
      lastContactAt: null,
    });
  }

  // Ensure inactive salesperson still has a few historical leads
  const inactive = salespeople.find((s) => s.id === "sp-08")!;
  for (let i = 0; i < 8; i++) {
    const createdAt = addDays(windowStart, randInt(rng, 0, 60));
    leads.push({
      id: `lead-inact-${i + 1}`,
      relatedType: "lead",
      companyName: companyName(rng, 900 + i),
      contactPerson: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
      salespersonId: inactive.id,
      createdAt: createdAt.toISOString(),
      status: pick(rng, ["lost", "disqualified", "won"] as const),
      source: pick(rng, LEAD_SOURCES),
      interestArea: pick(rng, INTEREST_AREAS),
      lastActivityId: null,
      lastContactAt: null,
    });
  }

  const activities: Activity[] = [];
  let activitySeq = 1;

type ActivityInput = Omit<
  Activity,
  | "id"
  | "crmId"
  | "crmUrl"
  | "relatedType"
  | "relatedCrmId"
  | "relatedLabel"
  | "relatedCrmUrl"
>;

  const pushActivity = (a: ActivityInput) => {
    const id = `act-${String(activitySeq++).padStart(5, "0")}`;
    activities.push({
      id,
      crmId: id,
      crmUrl: null,
      relatedType: "lead",
      relatedCrmId: a.leadId,
      relatedLabel: "—",
      relatedCrmUrl: null,
      ...a,
    });
    return id;
  };

  // Leads without any activity (~8%)
  const noActivityLeadIds = new Set(
    leads
      .filter((l) => l.status === "new" || chance(rng, 0.08))
      .slice(0, 22)
      .map((l) => l.id),
  );

  for (const lead of leads) {
    if (noActivityLeadIds.has(lead.id)) continue;

    const sp = salespeople.find((s) => s.id === lead.salespersonId)!;
    const archetype = sp.archetype ?? "average";
    const leadCreated = new Date(lead.createdAt);

    let activityCount = randInt(rng, 3, 9);
    if (archetype === "high_volume_low_result") activityCount = randInt(rng, 8, 14);
    if (archetype === "top_discipline") activityCount = randInt(rng, 5, 10);
    if (archetype === "inactive") activityCount = randInt(rng, 1, 3);
    if (chance(rng, 0.12)) activityCount = randInt(rng, 10, 18); // long history

    let cursor = addDays(leadCreated, randInt(rng, 0, archetype === "top_discipline" ? 1 : 5));
    let lastCompletedId: string | null = null;
    let lastContactAt: string | null = null;
    let leaveWithoutNextStep = false;

    // Force some no-next-step / overdue patterns by archetype
    if (archetype === "overdue_heavy") leaveWithoutNextStep = chance(rng, 0.45);
    else if (archetype === "top_discipline") leaveWithoutNextStep = chance(rng, 0.08);
    else leaveWithoutNextStep = chance(rng, 0.28);

    for (let step = 0; step < activityCount; step++) {
      const type = weightedType(rng, archetype);
      const createdAt = cursor;
      let plannedAt = addHours(createdAt, randInt(rng, 2, 72));
      if (plannedAt > referenceDate && step < activityCount - 2) {
        plannedAt = subDays(referenceDate, randInt(rng, 1, 40));
      }

      let status: ActivityStatus = "completed";
      let completedAt: string | null = null;
      let result: ActivityResult | null = null;
      let rescheduleCount = 0;
      let originalPlannedAt = plannedAt;
      let currentPlannedAt = plannedAt;
      let cancellationReason = null as Activity["cancellationReason"];

      const isLast = step === activityCount - 1;
      const isFuture = plannedAt > referenceDate;

      if (isLast && !leaveWithoutNextStep && chance(rng, 0.55)) {
        status = "planned";
        currentPlannedAt = addDays(referenceDate, randInt(rng, 1, 14));
        plannedAt = currentPlannedAt;
        originalPlannedAt = currentPlannedAt;
      } else if (archetype === "overdue_heavy" && chance(rng, 0.35)) {
        status = "planned";
        currentPlannedAt = subDays(referenceDate, randInt(rng, 1, 25));
        plannedAt = currentPlannedAt;
        originalPlannedAt = subDays(currentPlannedAt, randInt(rng, 0, 5));
      } else if (archetype === "reschedule_heavy" && chance(rng, 0.4)) {
        status = chance(rng, 0.5) ? "rescheduled" : "planned";
        rescheduleCount = randInt(rng, 2, 5);
        originalPlannedAt = subDays(referenceDate, randInt(rng, 20, 60));
        currentPlannedAt =
          status === "planned" && chance(rng, 0.4)
            ? subDays(referenceDate, randInt(rng, 1, 10))
            : addDays(referenceDate, randInt(rng, 1, 20));
        plannedAt = currentPlannedAt;
        if (status === "rescheduled") {
          // keep as rescheduled record (term changed, not yet done)
        }
      } else if (chance(rng, 0.06)) {
        status = "cancelled";
        cancellationReason = pick(rng, CANCELLATION_REASONS);
        currentPlannedAt = plannedAt;
      } else if (chance(rng, 0.05)) {
        status = "not_done";
        currentPlannedAt = subDays(referenceDate, randInt(rng, 1, 20));
        plannedAt = currentPlannedAt;
      } else if (isFuture) {
        status = "planned";
        currentPlannedAt = plannedAt;
      } else {
        status = "completed";
        const onTime = archetype === "top_discipline" ? chance(rng, 0.92) : chance(rng, 0.7);
        completedAt = onTime
          ? addHours(plannedAt, -randInt(rng, 0, 8)).toISOString()
          : addHours(plannedAt, randInt(rng, 4, 72)).toISOString();
        if (new Date(completedAt) > referenceDate) {
          completedAt = subDays(referenceDate, randInt(rng, 0, 3)).toISOString();
        }
        // Missing result quality issue
        const missingResult =
          archetype === "high_volume_low_result"
            ? chance(rng, 0.28)
            : chance(rng, 0.12);
        result = missingResult ? null : resultFor(rng, archetype, type);
        lastContactAt = completedAt;
      }

      // Extra multi-reschedule meetings for reschedule_heavy
      if (
        archetype === "reschedule_heavy" &&
        (type === "meeting_online" || type === "meeting_in_person") &&
        chance(rng, 0.5)
      ) {
        rescheduleCount = Math.max(rescheduleCount, randInt(rng, 2, 4));
      }

      const id = pushActivity({
        leadId: lead.id,
        salespersonId: lead.salespersonId,
        type,
        createdAt: createdAt.toISOString(),
        plannedAt: plannedAt.toISOString(),
        completedAt,
        status,
        result,
        note:
          status === "completed"
            ? pick(rng, [
                "Rozmowa wstępna",
                "Ustalono potrzeby",
                "Klient prosi o kontakt później",
                "Wysłano brief",
                null,
              ])
            : null,
        rescheduleCount,
        originalPlannedAt: originalPlannedAt.toISOString(),
        currentPlannedAt: currentPlannedAt.toISOString(),
        cancellationReason,
        hasNextStep: false,
      });

      if (status === "completed") {
        lastCompletedId = id;
      }

      cursor = addDays(new Date(currentPlannedAt), randInt(rng, 2, 12));
    }

    // Mark hasNextStep on completed activities when a later planned exists
    const leadActs = activities.filter((a) => a.leadId === lead.id);
    const hasFuturePlanned = leadActs.some(
      (a) => a.status === "planned" && new Date(a.currentPlannedAt) >= referenceDate,
    );
    for (const a of leadActs) {
      if (a.status === "completed") {
        a.hasNextStep = hasFuturePlanned || !leaveWithoutNextStep;
      }
    }
    // Force no-next-step: clear future planned for some leads
    if (leaveWithoutNextStep) {
      for (const a of leadActs) {
        if (a.status === "planned" && new Date(a.currentPlannedAt) >= referenceDate) {
          a.status = "completed";
          a.completedAt = subDays(referenceDate, randInt(rng, 1, 10)).toISOString();
          a.result = chance(rng, 0.15) ? null : resultFor(rng, archetype, a.type);
          a.hasNextStep = false;
          lastContactAt = a.completedAt;
          lastCompletedId = a.id;
        } else if (a.status === "completed") {
          a.hasNextStep = false;
        }
      }
    }

    lead.lastActivityId = lastCompletedId ?? leadActs[leadActs.length - 1]?.id ?? null;
    lead.lastContactAt = lastContactAt;
  }

  // Ensure minimum volumes with extra filler activities
  while (activities.length < 1500) {
    const lead = pick(
      rng,
      leads.filter((l) => !noActivityLeadIds.has(l.id)),
    );
    const sp = salespeople.find((s) => s.id === lead.salespersonId)!;
    const plannedAt = addDays(windowStart, randInt(rng, 0, 170));
    const completed = plannedAt < referenceDate;
    pushActivity({
      leadId: lead.id,
      salespersonId: lead.salespersonId,
      type: weightedType(rng, sp.archetype),
      createdAt: subDays(plannedAt, 1).toISOString(),
      plannedAt: plannedAt.toISOString(),
      completedAt: completed ? addHours(plannedAt, randInt(rng, -4, 24)).toISOString() : null,
      status: completed ? "completed" : "planned",
      result: completed
        ? chance(rng, 0.1)
          ? null
          : resultFor(rng, sp.archetype, "phone")
        : null,
      note: null,
      rescheduleCount: 0,
      originalPlannedAt: plannedAt.toISOString(),
      currentPlannedAt: plannedAt.toISOString(),
      cancellationReason: null,
      hasNextStep: false,
    });
  }

  for (const lead of leads) {
    lead.relatedType = "lead";
    lead.crmId = lead.id;
    lead.crmUrl = null;
  }

  const leadById = new Map(leads.map((l) => [l.id, l]));
  for (const a of activities) {
    const lead = leadById.get(a.leadId);
    a.relatedType = "lead";
    a.relatedCrmId = a.leadId;
    a.relatedLabel = lead?.companyName ?? "—";
    a.relatedCrmUrl = null;
    a.crmId = a.id;
    a.crmUrl = null;
  }

  return {
    generatedAt: new Date().toISOString(),
    referenceDate: referenceDate.toISOString(),
    salespeople,
    leads,
    activities,
  };
}

function daysFrom(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default generateMockDataset;
