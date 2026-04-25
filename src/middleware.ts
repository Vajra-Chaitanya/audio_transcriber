/**
 * Next.js Edge Middleware — Route Protection
 *
 * Runs before every request. Redirects unauthenticated users to "/" (login).
 * Better Auth session cookies are checked server-side without DB access
 * (the cookie itself carries a signed session token).
 */

import { NextRequest, NextResponse } from "next/server";


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const isPublicPath =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for the fast frontend auth cookie
  const session = request.cookies.get("frontend_auth")?.value === "true";

  if (!session) {
    // No session → redirect to login page
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirected", "1"); // optional hint for the login UI
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
