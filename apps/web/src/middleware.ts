import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Path prefixes that require `sessionToken`. */
const protectedPrefixes = ["/webtrading"] as const;

function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get("sessionToken");
  if (!session?.value) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/webtrading/:path*"],
};
