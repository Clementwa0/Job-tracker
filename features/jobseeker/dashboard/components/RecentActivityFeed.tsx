"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, CalendarClock, Mail, FileText, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";

type Item = {
  id: string;
  icon: React.ElementType;
  iconClass: string;
  title: string;
  subtitle: string;
  date: Date;
};

const timeLabel = (d: Date) =>
  d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const RecentActivityFeed = () => {
  const { jobs } = useJobs();

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];

    for (const job of jobs) {
      if (job.applicationDate) {
        const d = new Date(job.applicationDate);
        if (!isNaN(d.getTime())) {
          out.push({
            id: `${job.id}-submitted`,
            icon: CheckCircle2,
            iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            title: `Application submitted — ${job.companyName}`,
            subtitle: job.jobTitle,
            date: d,
          });
        }
      }

      for (const activity of job.activity ?? []) {
        if (!activity.createdAt) continue;
        const d = new Date(activity.createdAt);
        if (isNaN(d.getTime())) continue;

        const isInterview = activity.type === "reminder" && /interview/i.test(activity.message);
        out.push({
          id: activity._id ?? `${job.id}-${activity.createdAt}-${activity.message}`,
          icon: isInterview ? CalendarClock : activity.type === "status" ? Mail : FileText,
          iconClass: isInterview
            ? "bg-primary/10 text-primary"
            : activity.type === "status"
            ? "bg-primary/10 text-primary"
            : "bg-gold/15 text-gold-foreground dark:text-gold",
          title: activity.message,
          subtitle: `${job.companyName}`,
          date: d,
        });
      }
    }

    return out.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [jobs]);

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Recent Activity
        </h2>
        <Link
          href="/jobseeker/applications"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">No activity yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.subtitle} · {timeLabel(item.date)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default RecentActivityFeed;
