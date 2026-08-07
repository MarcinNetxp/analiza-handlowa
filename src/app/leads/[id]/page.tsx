import { notFound } from "next/navigation";
import { LeadDetailView } from "@/components/views/LeadDetailView";
import { loadAppData } from "@/lib/data/load";
import { leadsService } from "@/services";

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, lead] = await Promise.all([loadAppData(), leadsService.getById(id)]);
  if (!lead) notFound();
  return <LeadDetailView data={data} lead={lead} />;
}
