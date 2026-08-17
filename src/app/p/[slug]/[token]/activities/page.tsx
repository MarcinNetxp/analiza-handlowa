import { ActivitiesView } from "@/components/views/ActivitiesView";
import { resolvePortalRoute } from "@/lib/portal/route";

export default async function PortalActivitiesPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { ctx, basePath } = await resolvePortalRoute(params);
  return <ActivitiesView data={ctx.data} basePath={basePath} />;
}
