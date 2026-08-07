export function downloadCsv(
  filename: string,
  rows: Record<string, string | number | null | undefined>[],
) {
  if (rows.length === 0) {
    const blob = new Blob(["\uFEFF"], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, filename);
    return;
  }
  const headers = Object.keys(rows[0]!);
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(";"),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(";")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
