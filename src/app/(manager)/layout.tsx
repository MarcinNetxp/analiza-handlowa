import { AppShell } from "@/components/AppShell";
import { loadAppData } from "@/lib/data/load";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await loadAppData();

  return (
    <AppShell
      mode="manager"
      salespeople={data.salespeople}
      today={data.today}
      dataSource={data.dataSource}
      loadError={data.loadError}
    >
      {children}
    </AppShell>
  );
}
