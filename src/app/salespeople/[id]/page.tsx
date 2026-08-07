import { notFound } from "next/navigation";
import { SalespersonDetailView } from "@/components/views/SalespersonDetailView";
import { loadAppData } from "@/lib/data/load";
import { salespeopleService } from "@/services";

export default async function SalespersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, salesperson] = await Promise.all([
    loadAppData(),
    salespeopleService.getById(id),
  ]);
  if (!salesperson) notFound();
  return <SalespersonDetailView data={data} salesperson={salesperson} />;
}
