"use client";

import { downloadCsv } from "@/lib/export/csv";
import { Button } from "./ui/button";

export function ExportCsvButton({
  filename,
  rows,
}: {
  filename: string;
  rows: Record<string, string | number | null | undefined>[];
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(filename, rows)}
      disabled={rows.length === 0}
    >
      Eksport CSV
    </Button>
  );
}
