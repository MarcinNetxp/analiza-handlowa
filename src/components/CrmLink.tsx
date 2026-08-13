"use client";

import { ExternalLink } from "lucide-react";

export function CrmLink({
  href,
  label = "Otwórz w CRM",
  className = "",
}: {
  href?: string | null;
  label?: string;
  className?: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <ExternalLink className="h-3 w-3" />
      {label}
    </a>
  );
}
