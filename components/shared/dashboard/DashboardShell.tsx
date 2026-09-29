"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/hooks/AuthContext";

import AppSidebar from "./Sidebar";
import Header from "./Header";
import { MobileBottomNav } from "./MobileNav";
import type { DashboardConfig } from "./types";

/**
 * One layout for every signed-in area (job seeker, employer, admin).
 * Role-specific behaviour lives entirely in `config`.
 */
export default function DashboardShell({
  config,
  children,
}: {
  config: DashboardConfig;
  children: ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const allowed = isAuthenticated && user?.role === config.role;

  // proxy.ts is the server-side gate; this covers a session expiring while the user is already here.
  useEffect(() => {
    if (isLoading) return;
    if (!allowed) router.replace(config.loginPath);
  }, [isLoading, allowed, router, config.loginPath]);

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <Loader2
          className="size-5 animate-spin text-muted-foreground"
          aria-label="Verifying session"
        />
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <SidebarProvider>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
        <a
          href="#dashboard-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-[13px] focus:font-medium focus:text-background focus:shadow-lg"
        >
          Skip to content
        </a>

        {/* Sidebar (desktop rail / mobile sheet) */}
        <AppSidebar config={config} />

        {/* Main application */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Fixed header */}
          <div className="sticky top-0 z-50 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <Header config={config} />
          </div>

          {/* Scrollable content */}
          <main
            id="dashboard-main"
            tabIndex={-1}
            className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto focus:outline-none"
          >
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-5 xl:px-10">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <MobileBottomNav config={config} />
      </div>
    </SidebarProvider>
  );
}
