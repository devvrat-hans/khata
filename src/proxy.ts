import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

/**
 * A cheap first gate for signed-in pages: without a session cookie, go to
 * sign in and come back afterwards. It only checks that a cookie exists; every
 * page and action still validates the session against the database.
 */
export default function proxy(request: NextRequest) {
  if (getSessionCookie(request)) {
    // Pages read this to send first-time visitors back here after onboarding.
    const headers = new Headers(request.headers);
    headers.set("x-khata-path", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.next({ request: { headers } });
  }
  const url = request.nextUrl.clone();
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/sign-in";
  url.search = "";
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/people/:path*",
    "/expenses/:path*",
    "/settle/:path*",
    "/activity/:path*",
    "/settings/:path*",
    "/welcome",
    "/join/:path*",
  ],
};
