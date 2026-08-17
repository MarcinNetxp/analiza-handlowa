import { EffectivenessView } from "@/components/views/EffectivenessView";
import { resolvePortalRoute } from "@/lib/portal/route";

export default async function PortalEffectivenessPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { ctx, basePath } = await resolvePortalRoute(params);
  return <EffectivenessView data={ctx.data} basePath={basePath} />;
}
