"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/hooks/AuthContext";

import AppSidebar, {
  MobileBottomNav,
} from "@/components/shared/Dashboard/Sidebar";
import Header from "@/components/shared/Dashboard/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "user") {
      router.replace("/account");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== "user") {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main application */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Fixed Header */}
          <header className="sticky top-0 z-50 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <Header />
          </header>

          {/* Scrollable content */}
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-5 xl:px-10">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile vertical navigation */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}