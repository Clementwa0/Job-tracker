import { AuthProvider, useAuth } from "@/hooks/AuthContext";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getDashboardForRole } from "@/lib/auth/redirects";

/** Redirect authenticated users away from auth pages to their dashboard. */
function GuestOnly({ children, portal }: { children: ReactNode; portal: "user" | "employer" | "admin" }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated && user?.role) {
    if (portal === "user" && user.role === "user") {
      return <Navigate to={getDashboardForRole("user")} replace />;
    }
    if (portal === "employer" && user.role === "employer") {
      return <Navigate to={getDashboardForRole("employer")} replace />;
    }
    if (portal === "admin" && user.role === "admin") {
      return <Navigate to={getDashboardForRole("admin")} replace />;
    }
    if (user.role !== portal) {
      return <Navigate to={getDashboardForRole(user.role)} replace />;
    }
  }
  return <>{children}</>;
}

export function UserAuthPage({ children }: { children: ReactNode }) {
  return <GuestOnly portal="user">{children}</GuestOnly>;
}

export function EmployerAuthPage({ children }: { children: ReactNode }) {
  return <GuestOnly portal="employer">{children}</GuestOnly>;
}

export function AdminAuthPage({ children }: { children: ReactNode }) {
  return <GuestOnly portal="admin">{children}</GuestOnly>;
}

// re-export provider for pages that need it standalone
export { AuthProvider };
