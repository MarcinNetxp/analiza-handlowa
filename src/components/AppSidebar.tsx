"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DataSource } from "@/config/dataSource";
import { joinAppPath } from "@/lib/paths";

const MANAGER_NAV = [
  { href: "/", label: "Pulpit" },
  { href: "/salespeople", label: "Handlowcy" },
  { href: "/potencjalni", label: "Potencjalni klienci" },
  { href: "/szanse", label: "Szanse sprzedaży" },
  { href: "/activities", label: "Aktywności" },
  { href: "/attention", label: "Klienci wymagający uwagi" },
  { href: "/quality", label: "Jakość obsługi" },
  { href: "/effectiveness", label: "Skuteczność" },
];

const PORTAL_NAV = [
  { href: "/", label: "Pulpit" },
  { href: "/handlowcy", label: "Handlowcy" },
  { href: "/potencjalni", label: "Potencjalni klienci" },
  { href: "/szanse", label: "Szanse sprzedaży" },
  { href: "/activities", label: "Aktywności" },
  { href: "/attention", label: "Klienci wymagający uwagi" },
  { href: "/effectiveness", label: "Skuteczność" },
];

export function AppSidebar({
  dataSource,
  mode = "manager",
  basePath = "",
  portalTitle,
}: {
  dataSource: DataSource;
  mode?: "manager" | "portal";
  basePath?: string;
  portalTitle?: string;
}) {
  const pathname = usePathname();
  const nav = mode === "portal" ? PORTAL_NAV : MANAGER_NAV;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
          Analiza handlowa
        </div>
        <div className="mt-1 text-lg font-semibold leading-tight">
          {mode === "portal" ? "Mój panel" : "Aktywności CRM"}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {mode === "portal"
            ? (portalTitle ?? "Widok handlowca — tylko Twoje dane")
            : "Warstwa managerska — monitoring procesu sprzedaży"}
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => {
          const href = joinAppPath(basePath, item.href);
          const active =
            item.href === "/"
              ? pathname === href || pathname === `${href}/`
              : pathname.startsWith(href);
          return (
            <Link
              key={item.href}
              href={href}
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
      {mode === "manager" ? (
        <div className="border-t border-slate-800 px-4 py-3">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="text-xs text-slate-400 hover:text-white"
              onClick={async (e) => {
                e.preventDefault();
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
            >
              Wyloguj
            </button>
          </form>
        </div>
      ) : null}
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
