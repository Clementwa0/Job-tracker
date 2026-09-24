"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_MAIN_NAV } from "@/features/admin/config/nav";

/** Reuses the existing admin navigation - no new routes are introduced here. */
const ACTION_DESCRIPTIONS: Record<string, string> = {
  "/admin/jobs": "Review, approve and close job postings",
  "/admin/companies": "Approve and manage employer companies",
  "/admin/applications": "Browse applications across the platform",
  "/admin/analytics": "Dig into platform trends and reports",
  "/admin/settings": "Update your admin account settings",
};

const ACTIONS = ADMIN_MAIN_NAV.filter((item) => item.path !== "/admin/dashboard");

export default function AdminQuickActions() {
  if (ACTIONS.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Quick actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {ACTIONS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 ring-1 ring-foreground/10 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{label}</span>
                {ACTION_DESCRIPTIONS[path] && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {ACTION_DESCRIPTIONS[path]}
                  </span>
                )}
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
