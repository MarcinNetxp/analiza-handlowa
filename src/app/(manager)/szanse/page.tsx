import { OpportunitiesPipelineView } from "@/components/views/OpportunitiesPipelineView";
import { loadAppData } from "@/lib/data/load";

export default async function ManagerOpportunitiesPage() {
  const data = await loadAppData();
  return <OpportunitiesPipelineView data={data} showSalespersonColumn />;
}
