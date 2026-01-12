import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard and analytics routes
  if (pathname === "/" || pathname.startsWith("/analytics")) {
    const authCookie = request.cookies.get("dashboard_access");

    if (!authCookie || authCookie.value !== "true") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/analytics/:path*"],
};
