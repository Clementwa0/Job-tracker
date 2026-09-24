"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import AdminHeader from "@/features/admin/shell/Header";
import AdminNavContent from "@/features/admin/shell/Sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isAdmin = isAuthenticated && user?.role === "admin";

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      router.replace("/admin/login");
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="size-5 animate-spin text-slate-400"
            aria-hidden="true"
          />
          <p className="text-[12.5px] font-medium text-slate-500">
            Verifying session…
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Skip link */}
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-[13px] focus:font-medium focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Desktop rail - full height, no scroll */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        <AdminNavContent />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-60 border-slate-200 p-0 dark:border-slate-800 dark:bg-slate-900"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
            <SheetDescription>
              Main navigation links for the JobTrail admin console
            </SheetDescription>
          </SheetHeader>
          <AdminNavContent onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />

        <main
          id="admin-main"
          tabIndex={-1}
          className="flex-1 px-4 py-5 focus:outline-none lg:px-8 lg:py-6"
        >
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}