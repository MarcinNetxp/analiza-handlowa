import { DrilldownView } from "@/components/views/DrilldownView";
import { resolvePortalRoute } from "@/lib/portal/route";
import type { DrilldownType } from "@/types/domain";

const VALID: DrilldownType[] = [
  "planned",
  "completed",
  "overdue",
  "rescheduled",
  "cancelled",
  "no_result",
  "no_next_step",
  "no_contact_7",
  "no_contact_14",
  "no_contact_30",
  "no_first_contact",
  "multi_reschedule",
  "active_leads",
  "meetings",
  "next_contacts",
];

export default async function PortalDrilldownPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; token: string }>;
  searchParams: Promise<{ type?: string; salespersonId?: string }>;
}) {
  const { ctx, basePath } = await resolvePortalRoute(params);
  const sp = await searchParams;
  const type = (VALID.includes(sp.type as DrilldownType)
    ? sp.type
    : "no_next_step") as DrilldownType;

  return (
    <DrilldownView
      data={ctx.data}
      type={type}
      salespersonId={sp.salespersonId ?? ctx.salesperson?.id}
      basePath={basePath}
    />
  );
}
