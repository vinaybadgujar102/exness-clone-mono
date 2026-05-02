import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Path prefixes that require `sessionToken`. */
const protectedPrefixes = ["/webtrading"] as const;
/** Public auth/landing pages that logged-in users should not revisit. */
const redirectToTradingWhenAuthed = ["/", "/login", "/register"] as const;

function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function shouldRedirectAuthedUser(pathname: string): boolean {
  return redirectToTradingWhenAuthed.some((path) => pathname === path);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = request.cookies.get("sessionToken");

  if (!session?.value && isProtectedPath(pathname)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  if (session?.value && shouldRedirectAuthedUser(pathname)) {
    return NextResponse.redirect(new URL("/webtrading", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/webtrading/:path*"],
};
