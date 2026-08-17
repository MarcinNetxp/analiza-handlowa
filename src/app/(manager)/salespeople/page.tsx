import { SalespeopleView } from "@/components/views/SalespeopleView";
import { loadAppData } from "@/lib/data/load";

export default async function SalespeoplePage() {
  const data = await loadAppData();
  return <SalespeopleView data={data} />;
}
