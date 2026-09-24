"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { ADMIN_MAIN_NAV } from "@/features/admin/config/nav";

interface AdminNavContentProps {
  onNavigate?: () => void;
}

export default function AdminNavContent({ onNavigate }: AdminNavContentProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "AD";

  const handleLogout = async () => {
    onNavigate?.();
    await logout();
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-slate-900 dark:bg-slate-100">
          <Shield
            className="size-3.5 text-white dark:text-slate-900"
            strokeWidth={2.25}
            aria-hidden="true"
          />
        </div>
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
            JobTrail
          </span>
          <span className="text-[13px] text-muted-foreground">Admin</span>
        </div>
      </div>

      {/* Nav - no internal scroll */}
      <nav
        className="flex-1 px-2.5 py-3"
        aria-label="Admin navigation"
      >
        <p className="px-2.5 pb-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Workspace
        </p>

        <ul className="space-y-0.5">
          {ADMIN_MAIN_NAV.map(({ path, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === path
              : pathname === path || pathname.startsWith(`${path}/`);

            return (
              <li key={path}>
                <Link
                  href={path}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-slate-900 transition-opacity dark:bg-slate-100",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t">
        <div className="flex items-center gap-2.5 px-3 py-3">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12.5px] font-medium text-foreground">
              {user?.name || "Administrator"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.email || "admin@jobtrail.com"}
            </p>
          </div>
        </div>

        <div className="space-y-1 border-t px-2.5 py-2.5">
          <Link
            href="/"
            onClick={onNavigate}
            className={cn(
              "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground transition-colors",
              "hover:bg-muted/60 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            )}
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            <span>View public site</span>
          </Link>

          
        </div>
      </div>
    </div>
  );
}