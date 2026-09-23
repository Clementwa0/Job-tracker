import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken } from "@/lib/auth/jwt";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/cookies";
import { LOGIN_PATHS, DASHBOARD_PATHS, type UserRole } from "@/lib/auth/redirects";

// Note: Proxy (the renamed "middleware" convention) always runs on the
// Node.js runtime in Next.js 16+, so no explicit runtime export is needed
// (and is in fact disallowed) — this is what lets us use jsonwebtoken here.

function roleRequiredFor(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") return "admin";
  if (pathname.startsWith("/employer/dashboard")) return "employer";
  if (pathname.startsWith("/jobseeker")) return "user";
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requiredRole = roleRequiredFor(pathname);
  if (!requiredRole) return NextResponse.next();

  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  function redirectToLogin() {
    const loginUrl = new URL(LOGIN_PATHS[requiredRole as UserRole], request.url);
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (!refreshToken) {
    return redirectToLogin();
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    // Wrong role for this area — send them to their own dashboard rather
    // than looping them back through a login page they're already past.
    if (payload.role !== requiredRole) {
      const dashboardUrl = new URL(DASHBOARD_PATHS[payload.role] ?? DASHBOARD_PATHS.user, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  } catch {
    return redirectToLogin();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/employer/dashboard/:path*", "/jobseeker/:path*"],
};
