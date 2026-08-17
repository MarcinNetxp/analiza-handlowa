import { DashboardView } from "@/components/views/DashboardView";
import { resolvePortalRoute } from "@/lib/portal/route";

export default async function PortalHomePage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { ctx, basePath } = await resolvePortalRoute(params);
  return <DashboardView data={ctx.data} basePath={basePath} />;
}
