export type UserRole = "user" | "employer" | "admin";

export const LOGIN_PATHS: Record<UserRole, string> = {
  user: "/login",
  employer: "/employer/login",
  admin: "/admin/login",
};

export const DASHBOARD_PATHS: Record<UserRole, string> = {
  user: "/dashboard",
  employer: "/employer/dashboard",
  admin: "/admin/dashboard",
};

export function getDashboardForRole(role?: string | null): string {
  if (role === "admin") return DASHBOARD_PATHS.admin;
  if (role === "employer") return DASHBOARD_PATHS.employer;
  return DASHBOARD_PATHS.user;
}

export function getLoginForRole(role?: string | null): string {
  if (role === "admin") return LOGIN_PATHS.admin;
  if (role === "employer") return LOGIN_PATHS.employer;
  return LOGIN_PATHS.user;
}

/** Prefer explicit deep-link redirect; otherwise route by role. */
export function resolvePostLoginRedirect(
  role: string,
  explicitRedirect?: string | null,
): string {
  const dashboard = getDashboardForRole(role);
  if (!explicitRedirect || !explicitRedirect.startsWith("/")) return dashboard;

  if (role === "admin" && explicitRedirect.startsWith("/admin")) return explicitRedirect;
  if (role === "employer" && explicitRedirect.startsWith("/employer")) return explicitRedirect;
  if (role === "user" && !explicitRedirect.startsWith("/admin") && !explicitRedirect.startsWith("/employer")) {
    return explicitRedirect;
  }

  return dashboard;
}

export function isAuthPublicPath(pathname: string): boolean {
  const publicPrefixes = [
    "/login",
    "/register",
    "/forget-password",
    "/reset-password",
    "/employer/login",
    "/employer/register",
    "/employer/forgot-password",
    "/employer/reset-password",
    "/admin/login",
    "/",
    "/jobs",
    "/terms",
    "/oauth",
    "/verify-email",
  ];
  return publicPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function getLoginPathForLocation(pathname: string): string {
  if (pathname.startsWith("/admin")) return LOGIN_PATHS.admin;
  if (pathname.startsWith("/employer")) return LOGIN_PATHS.employer;
  return LOGIN_PATHS.user;
}
