// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_TOKEN_COOKIE = "firebaseIdToken"; // Example, adjust if using a different cookie name

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ["/", "/signin", "/signup", "/api/auth"]; // Landing page and auth pages are public
  const isPublicPath = publicPaths.some(path => pathname === path || (path.endsWith('/') && pathname.startsWith(path)) || pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname.includes('.'));


  // Check for auth token (this is a simplified check, Firebase Admin SDK would be better for server-side verification)
  const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value; // This cookie needs to be set upon successful Firebase sign-in

  if (!isPublicPath && !authToken) {
    // If trying to access a protected route without a token, redirect to signin
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/signin" || pathname === "/signup") && authToken) {
    // If on signin/signup page but already authenticated, redirect to dashboard
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - though some API routes might need protection
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|images).*)', // Original matcher
    // Simplified matcher for now. Middleware needs careful tuning based on actual auth cookie handling.
     "/dashboard/:path*",
     "/profile/:path*",
     "/users/:path*",
     "/chat/:path*",
     "/signin",
     "/signup",
  ],
};
