import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/AuthContext";
import { getDashboardForRole, getLoginForRole } from "@/lib/auth/redirects";

interface RoleGuardProps {
  children: ReactNode;
  allowedRole: "user" | "employer" | "admin";
}

function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={getLoginForRole(allowedRole)}
        replace
        state={{ from: window.location.pathname }}
      />
    );
  }

  if (user?.role !== allowedRole) {
    return <Navigate to={getDashboardForRole(user?.role)} replace />;
  }

  return <>{children}</>;
}

export function UserRoute({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRole="user">{children}</RoleGuard>;
}

export function EmployerRoute({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRole="employer">{children}</RoleGuard>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRole="admin">{children}</RoleGuard>;
}
