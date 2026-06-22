import { Link, useLocation } from "react-router-dom";
import { Briefcase, Building2, LayoutDashboard, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/AuthContext";
import { Button } from "@/components/ui/button";

const links = [
  { path: "/employer/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/employer/jobs", name: "Job postings", icon: Briefcase },
  { path: "/employer/jobs/create", name: "Create job", icon: Plus },
];

export default function EmployerSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-full flex-col border-r border-border bg-card md:w-64 md:min-h-screen">
      <div className="border-b border-border p-4">
        <Link to="/employer/dashboard" className="flex items-center gap-2 font-semibold">
          <Building2 className="h-5 w-5 text-primary" />
          Employer
        </Link>
        <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email}</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ path, name, icon: Icon }) => {
          const active = location.pathname === path || location.pathname.startsWith(`${path}/`);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {name}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-border p-3">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/jobs">View public board</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link to="/">Back to home</Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={async () => {
            await logout();
            window.location.href = "/employer/login";
          }}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
