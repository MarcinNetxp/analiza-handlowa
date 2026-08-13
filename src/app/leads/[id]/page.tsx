import { notFound } from "next/navigation";
import { LeadDetailView } from "@/components/views/LeadDetailView";
import { loadAppData } from "@/lib/data/load";

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadAppData();
  const lead = data.leads.find((l) => l.id === id);
  if (!lead) notFound();
  return <LeadDetailView data={data} lead={lead} />;
}
