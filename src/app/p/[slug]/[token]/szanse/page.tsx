import { OpportunitiesPipelineView } from "@/components/views/OpportunitiesPipelineView";
import { resolvePortalRoute } from "@/lib/portal/route";

export default async function PortalOpportunitiesPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { ctx } = await resolvePortalRoute(params);
  return <OpportunitiesPipelineView data={ctx.data} />;
}
