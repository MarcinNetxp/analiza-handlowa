import { QualityView } from "@/components/views/QualityView";
import { loadAppData } from "@/lib/data/load";

export default async function QualityPage() {
  const data = await loadAppData();
  return <QualityView data={data} />;
}
