"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, ClipboardCheck, ShieldAlert, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AdminAnalytics, AdminAnalyticsOverview } from "@/types/admin";

interface AttentionItem {
  label: string;
  count: number;
  icon: LucideIcon;
  href?: string;
}

interface AdminAttentionPanelProps {
  overview: AdminAnalyticsOverview | null;
  analytics: AdminAnalytics | null;
  loading: boolean;
}

export default function AdminAttentionPanel({
  overview,
  analytics,
  loading,
}: AdminAttentionPanelProps) {
  const pendingJobs = overview?.pendingJobs ?? analytics?.jobPostings.pendingReview;
  const pendingCompanies = analytics?.companies.pending;
  const suspendedUsers = analytics?.users.suspended;

  const items: AttentionItem[] = [
    ...(pendingJobs === undefined
      ? []
      : [{ label: "Jobs pending review", count: pendingJobs, icon: ClipboardCheck, href: "/admin/jobs" }]),
    ...(pendingCompanies === undefined
      ? []
      : [{ label: "Companies pending approval", count: pendingCompanies, icon: Building2, href: "/admin/companies" }]),
    ...(suspendedUsers === undefined
      ? []
      : [{ label: "Suspended accounts", count: suspendedUsers, icon: ShieldAlert }]),
  ];

  const needsAttention = items.some((item) => item.count > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Needs attention</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">Moderation data is unavailable.</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {items.map(({ label, count, icon: Icon, href }) => {
              const active = count > 0;
              const row = (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    href && "hover:bg-muted",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg",
                      active ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
                  <span className={cn("text-sm font-semibold tabular-nums", !active && "text-muted-foreground")}>
                    {count.toLocaleString()}
                  </span>
                  {href && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
                </div>
              );

              return (
                <li key={label}>
                  {href ? (
                    <Link href={href} className="block rounded-lg focus-visible:ring-2 focus-visible:ring-ring">
                      {row}
                    </Link>
                  ) : (
                    row
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {!loading && items.length > 0 && !needsAttention && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Nothing is waiting on you right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
