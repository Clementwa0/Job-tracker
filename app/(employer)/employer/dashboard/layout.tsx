"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import EmployerHeader from "@/features/employer/shell/EmployerHeader";
import EmployerNavContent from "@/features/employer/shell/EmployerNavContent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function EmployerDashboardLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // proxy.ts is the primary, server-side gate for this route; this
  // client-side check only covers a session expiring while already here.
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "employer") {
      router.replace("/employer/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== "employer") {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r lg:block">
        <EmployerNavContent />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Employer navigation</SheetTitle>
            <SheetDescription>Main navigation links for your JobTrail employer dashboard</SheetDescription>
          </SheetHeader>
          <EmployerNavContent onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <EmployerHeader onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
