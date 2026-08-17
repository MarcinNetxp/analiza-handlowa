import { notFound } from "next/navigation";
import { portalBasePath } from "./config";
import { loadPortalContext } from "./loadPortal";

export async function resolvePortalRoute(
  params: Promise<{ slug: string; token: string }>,
) {
  const { slug, token } = await params;
  const ctx = await loadPortalContext(slug, token);
  if (!ctx) notFound();
  return {
    ctx,
    basePath: portalBasePath(slug, token),
    slug,
    token,
  };
}
