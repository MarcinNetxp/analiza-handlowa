export type DataSource = "mock" | "api";

function readDataSource(): DataSource {
  const v = process.env.DATA_SOURCE?.trim().toLowerCase();
  if (v === "api") return "api";
  return "mock";
}

/** Ustaw DATA_SOURCE=api na Vercel wraz z credentials CRM. */
export const DATA_SOURCE: DataSource = readDataSource();
