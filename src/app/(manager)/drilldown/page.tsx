import { DrilldownView } from "@/components/views/DrilldownView";
import { loadAppData } from "@/lib/data/load";
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

export default async function DrilldownPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; salespersonId?: string }>;
}) {
  const sp = await searchParams;
  const type = (VALID.includes(sp.type as DrilldownType)
    ? sp.type
    : "no_next_step") as DrilldownType;
  const data = await loadAppData();
  return (
    <DrilldownView
      data={data}
      type={type}
      salespersonId={sp.salespersonId}
    />
  );
}
