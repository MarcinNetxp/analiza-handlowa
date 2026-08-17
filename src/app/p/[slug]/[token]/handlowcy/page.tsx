import { notFound } from "next/navigation";
import { SalespersonDetailView } from "@/components/views/SalespersonDetailView";
import { resolvePortalRoute } from "@/lib/portal/route";

export default async function PortalHandlowcyPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { ctx, basePath } = await resolvePortalRoute(params);
  if (!ctx.salesperson) notFound();
  return (
    <SalespersonDetailView
      data={ctx.data}
      salesperson={ctx.salesperson}
      basePath={basePath}
    />
  );
}
