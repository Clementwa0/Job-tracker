import { Link, useLocation } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ADMIN_MAIN_NAV } from "@/features/admin/config/nav";

interface AdminNavContentProps {
  onNavigate?: () => void;
}

export default function AdminNavContent({ onNavigate }: AdminNavContentProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">JobTrail Admin</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {ADMIN_MAIN_NAV.map(({ path, label, icon: Icon, exact }) => {
          const active = exact
            ? location.pathname === path
            : location.pathname === path || location.pathname.startsWith(`${path}/`);
          return (
            <Link
              key={path}
              to={path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Separator />
      <div className="space-y-2 p-3">
        <Button asChild variant="outline" size="sm" className="w-full justify-start">
          <Link to="/" onClick={onNavigate}>
            Public site
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={async () => {
            await logout();
            window.location.href = "/admin/login";
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
