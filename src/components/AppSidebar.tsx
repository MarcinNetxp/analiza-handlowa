"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DataSource } from "@/config/dataSource";

const NAV = [
  { href: "/", label: "Pulpit" },
  { href: "/salespeople", label: "Handlowcy" },
  { href: "/activities", label: "Aktywności" },
  { href: "/attention", label: "Klienci wymagający uwagi" },
  { href: "/quality", label: "Jakość obsługi" },
  { href: "/effectiveness", label: "Skuteczność" },
];

export function AppSidebar({
  dataSource,
}: {
  dataSource: DataSource;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 self-start lg:block">
      <div className="sidebar-card sticky top-24">
        <p className="label-caps px-3 pb-2 text-brand-600/80">Sprzedaż</p>
        <p className="px-3 pb-3 text-xs text-ink-500">
          Analiza aktywności · moduł{" "}
          <span className="font-medium text-ink-700">nxp_aktualnosci</span>
        </p>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  active ? "sidebar-pill sidebar-pill-active" : "sidebar-pill",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-ink-100 px-3 pt-3 text-[11px] text-ink-400">
          Źródło:{" "}
          <span className="font-medium text-ink-600">
            {dataSource === "api" ? "CRM (REST API)" : "mock (demo)"}
          </span>
        </div>
      </div>
    </aside>
  );
}
