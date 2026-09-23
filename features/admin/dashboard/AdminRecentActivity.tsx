"use client";

import {
  Activity,
  Briefcase,
  Building2,
  FileStack,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AuditLogEntry } from "@/types/admin";

const MAX_ITEMS = 8;

const TARGET_ICONS: { match: RegExp; icon: LucideIcon; label: string }[] = [
  { match: /user|account/i, icon: Users, label: "User" },
  { match: /compan|employer|organi/i, icon: Building2, label: "Company" },
  { match: /job/i, icon: Briefcase, label: "Job" },
  { match: /application/i, icon: FileStack, label: "Application" },
];

function targetMeta(targetType: string) {
  const found = TARGET_ICONS.find(({ match }) => match.test(targetType));
  return {
    icon: found?.icon ?? Activity,
    label: found?.label ?? humanize(targetType),
  };
}

function humanize(value: string) {
  const text = value.replace(/[._-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Green for approvals/creations, red for removals/suspensions, neutral otherwise. */
function actionTone(action: string) {
  if (/approve|activate|publish|create|verif/i.test(action)) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }
  if (/reject|suspend|delete|remove|close|ban/i.test(action)) {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-400";
  }
  return "bg-muted text-muted-foreground";
}

function relativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function shortId(id: string) {
  return id.length > 10 ? `${id.slice(0, 8)}…` : id;
}

interface AdminRecentActivityProps {
  logs: AuditLogEntry[] | null;
  loading: boolean;
  unavailable?: boolean;
}

export default function AdminRecentActivity({ logs, loading, unavailable }: AdminRecentActivityProps) {
  const items = (logs ?? []).slice(0, MAX_ITEMS);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
            <Activity className="mx-auto size-6 text-muted-foreground/60" aria-hidden />
            <p className="mt-2 text-sm font-medium">
              {unavailable ? "Activity log unavailable" : "No recent activity"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {unavailable
                ? "The platform activity log could not be loaded."
                : "Administrative actions on users, companies and jobs will appear here."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((log) => {
              const { icon: Icon, label } = targetMeta(log.targetType);
              return (
                <li key={log.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                  >
                    <Icon className="size-3.5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-xs font-medium",
                          actionTone(log.action),
                        )}
                      >
                        {humanize(log.action)}
                      </span>
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      <span className="font-mono">{shortId(log.targetId)}</span>
                      {log.actorId && <> · by {shortId(log.actorId)}</>}
                    </p>
                  </div>

                  <time
                    dateTime={log.createdAt}
                    className="shrink-0 text-xs tabular-nums text-muted-foreground"
                  >
                    {relativeTime(log.createdAt)}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
