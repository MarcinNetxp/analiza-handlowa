import { PotentialClientsView } from "@/components/views/PotentialClientsView";
import { loadAppData } from "@/lib/data/load";

export default async function ManagerPotentialClientsPage() {
  const data = await loadAppData();
  return <PotentialClientsView data={data} />;
}
