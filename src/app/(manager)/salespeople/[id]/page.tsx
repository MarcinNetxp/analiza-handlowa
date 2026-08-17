import { notFound } from "next/navigation";
import { SalespersonDetailView } from "@/components/views/SalespersonDetailView";
import { loadAppData } from "@/lib/data/load";
import { decodeRouteId } from "@/lib/paths";

export default async function SalespersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = decodeRouteId(rawId);
  const data = await loadAppData();
  const salesperson = data.salespeople.find((s) => s.id === id);
  if (!salesperson) notFound();
  return <SalespersonDetailView data={data} salesperson={salesperson} />;
}
