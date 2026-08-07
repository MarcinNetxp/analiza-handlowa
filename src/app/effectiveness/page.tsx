import { EffectivenessView } from "@/components/views/EffectivenessView";
import { loadAppData } from "@/lib/data/load";

export default async function EffectivenessPage() {
  const data = await loadAppData();
  return <EffectivenessView data={data} />;
}
