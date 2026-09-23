"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";

const DAY_MS = 24 * 60 * 60 * 1000;

const FollowUpsCard = () => {
  const { jobs } = useJobs();

  const dueJobs = useMemo(() => {
    const now = Date.now();
    return jobs
      .filter((j) => (j.applicationStatus || "").toLowerCase() === "applied")
      .filter((j) => now - new Date(j.applicationDate).getTime() >= 5 * DAY_MS)
      .sort((a, b) => new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime())
      .slice(0, 3);
  }, [jobs]);

  return (
    <Card className="border-border p-4 shadow-none">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="font-display text-sm font-semibold tracking-tight">Follow-ups Due</h2>
        </div>
        <Link
          href="/jobseeker/applications"
          className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {dueJobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-xs font-medium text-foreground">You&apos;re all caught up</p>
          <p className="mt-1 text-[11px] text-muted-foreground">No follow-ups due right now.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {dueJobs.map((job) => {
            const daysAgo = Math.round((Date.now() - new Date(job.applicationDate).getTime()) / DAY_MS);
            return (
              <li key={job.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[11px] font-semibold">
                    {job.companyName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{job.companyName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {job.jobTitle} · Applied {daysAgo}d ago
                  </p>
                </div>
                <Link
                  href={`/jobseeker/applications/edit/${job.id}`}
                  className="shrink-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted"
                >
                  Follow Up
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default FollowUpsCard;
