import { AttentionView } from "@/components/views/AttentionView";
import { loadAppData } from "@/lib/data/load";

export default async function AttentionPage() {
  const data = await loadAppData();
  return <AttentionView data={data} />;
}
