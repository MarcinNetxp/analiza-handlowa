import { notFound } from "next/navigation";
import { LeadDetailView } from "@/components/views/LeadDetailView";
import { decodeRouteId } from "@/lib/paths";
import { resolvePortalRoute } from "@/lib/portal/route";

export default async function PortalLeadPage({
  params,
}: {
  params: Promise<{ slug: string; token: string; id: string }>;
}) {
  const { slug, token, id: rawId } = await params;
  const { ctx, basePath } = await resolvePortalRoute(
    Promise.resolve({ slug, token }),
  );
  const id = decodeRouteId(rawId);
  const lead = ctx.data.leads.find((l) => l.id === id);
  if (!lead) notFound();
  return <LeadDetailView data={ctx.data} lead={lead} basePath={basePath} />;
}
