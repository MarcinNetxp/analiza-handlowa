import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { loadAppData } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Analiza handlowa — Aktywności CRM",
  description:
    "Warstwa managersko-analityczna nad aktywnościami handlowców (nxp_aktualnosci).",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await loadAppData();

  return (
    <html lang="pl">
      <body>
        <AppShell
          salespeople={data.salespeople}
          today={data.today}
          dataSource={data.dataSource}
          loadError={data.loadError}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
