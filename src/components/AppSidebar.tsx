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

export function AppSidebar({ dataSource }: { dataSource: DataSource }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
          Analiza handlowa
        </div>
        <div className="mt-1 text-lg font-semibold leading-tight">
          Aktywności CRM
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Warstwa managerska — monitoring procesu sprzedaży
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
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
                "rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-500">
        Źródło:{" "}
        <span className="font-medium text-slate-300">
          {dataSource === "ngcrm"
            ? "ngCRM BFF · SuiteCRM"
            : dataSource === "api"
              ? "CRM REST API"
              : "mock (demo)"}
        </span>
      </div>
    </aside>
  );
}
