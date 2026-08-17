import { notFound } from "next/navigation";
import { LeadDetailView } from "@/components/views/LeadDetailView";
import { loadAppData } from "@/lib/data/load";
import { decodeRouteId } from "@/lib/paths";

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = decodeRouteId(rawId);
  const data = await loadAppData();
  const lead = data.leads.find((l) => l.id === id);
  if (!lead) notFound();
  return <LeadDetailView data={data} lead={lead} />;
}
