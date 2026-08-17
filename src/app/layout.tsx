import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analiza handlowa — Aktywności CRM",
  description:
    "Warstwa managersko-analityczna nad aktywnościami handlowców (nxp_aktualnosci).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
