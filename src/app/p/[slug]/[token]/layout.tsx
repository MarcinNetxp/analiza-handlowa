import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { loadPortalContext } from "@/lib/portal/loadPortal";
import { portalBasePath } from "@/lib/portal/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const ctx = await loadPortalContext(slug, token);
  if (!ctx) notFound();

  const basePath = portalBasePath(slug, token);
  const title = ctx.salesperson
    ? `${ctx.salesperson.firstName} ${ctx.salesperson.lastName}`
    : undefined;

  return (
    <AppShell
      mode="portal"
      basePath={basePath}
      lockedSalespersonId={ctx.salesperson?.id}
      portalTitle={title}
      salespeople={ctx.data.salespeople}
      today={ctx.data.today}
      dataSource={ctx.data.dataSource}
      loadError={ctx.loadError ?? undefined}
    >
      {!ctx.salesperson && !ctx.loadError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Nie znaleziono Twojego profilu w danych CRM. Skontaktuj się z administratorem —
          aktywności muszą być przypisane do Twojego konta SuiteCRM.
        </div>
      ) : null}
      {children}
    </AppShell>
  );
}
