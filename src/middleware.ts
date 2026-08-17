import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, isValidManagerSession } from "@/lib/auth/session";
import { validatePortalCredentials } from "@/lib/portal/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const portalMatch = pathname.match(/^\/p\/([^/]+)\/([^/]+)(\/|$)/);
  if (portalMatch) {
    const [, slug, token] = portalMatch;
    if (!validatePortalCredentials(slug, token)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "portal");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const session = request.cookies.get(COOKIE_NAME)?.value;
  if (!isValidManagerSession(session)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
