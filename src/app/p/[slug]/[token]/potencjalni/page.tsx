import { PotentialClientsView } from "@/components/views/PotentialClientsView";
import { resolvePortalRoute } from "@/lib/portal/route";

export default async function PortalPotentialClientsPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { ctx } = await resolvePortalRoute(params);
  return <PotentialClientsView data={ctx.data} />;
}
