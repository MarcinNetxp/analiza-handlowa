import { ActivitiesView } from "@/components/views/ActivitiesView";
import { loadAppData } from "@/lib/data/load";

export default async function ActivitiesPage() {
  const data = await loadAppData();
  return <ActivitiesView data={data} />;
}
