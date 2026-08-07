import { DashboardView } from "@/components/views/DashboardView";
import { loadAppData } from "@/lib/data/load";

export default async function HomePage() {
  const data = await loadAppData();
  return <DashboardView data={data} />;
}
