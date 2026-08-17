import { AttentionView } from "@/components/views/AttentionView";
import { resolvePortalRoute } from "@/lib/portal/route";

export default async function PortalAttentionPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { ctx, basePath } = await resolvePortalRoute(params);
  return <AttentionView data={ctx.data} basePath={basePath} />;
}
