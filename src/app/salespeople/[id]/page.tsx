import { notFound } from "next/navigation";
import { SalespersonDetailView } from "@/components/views/SalespersonDetailView";
import { loadAppData } from "@/lib/data/load";

export default async function SalespersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadAppData();
  const salesperson = data.salespeople.find((s) => s.id === id);
  if (!salesperson) notFound();
  return <SalespersonDetailView data={data} salesperson={salesperson} />;
}
