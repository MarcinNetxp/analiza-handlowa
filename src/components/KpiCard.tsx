"use client";

import Link from "next/link";
import { cn, formatNumber, formatPercent } from "@/lib/utils";

type Tone = "neutral" | "ok" | "warn" | "danger";

export function KpiCard({
  label,
  value,
  href,
  tone = "neutral",
  format = "number",
  hint,
}: {
  label: string;
  value: number;
  href?: string;
  tone?: Tone;
  format?: "number" | "percent";
  hint?: string;
}) {
  const display =
    format === "percent" ? formatPercent(value, 0) : formatNumber(value);

  const content = (
    <div
      className={cn(
        "rounded-lg border bg-white p-4 transition-colors",
        href && "cursor-pointer hover:border-slate-400",
        tone === "ok" && "border-emerald-200",
        tone === "warn" && "border-amber-300",
        tone === "danger" && "border-rose-300",
        tone === "neutral" && "border-slate-200",
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums",
          tone === "ok" && "text-emerald-700",
          tone === "warn" && "text-amber-700",
          tone === "danger" && "text-rose-700",
          tone === "neutral" && "text-slate-900",
        )}
      >
        {display}
      </div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
