"use client";

import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import type { ApplicationStatus } from "@/types/job";

const FUNNEL_STAGES: { key: ApplicationStatus; label: string; dot: string }[] = [
  { key: "applied", label: "Applied", dot: "bg-blue-500" },
  { key: "interviewing", label: "Interviewing", dot: "bg-primary" },
  { key: "offer", label: "Offer", dot: "bg-emerald-500" },
];

const ApplicationPipeline = () => {
  const { jobs } = useJobs();

  const counts = useMemo(() => {
    const acc: Partial<Record<ApplicationStatus, number>> = {};
    for (const job of jobs) {
      const status = job.applicationStatus as ApplicationStatus;
      acc[status] = (acc[status] ?? 0) + 1;
    }
    return acc;
  }, [jobs]);

  const total = jobs.length;
  const rejected = counts.rejected ?? 0;

  return (
    <Card className="border-border p-4 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold tracking-tight">
            Application Pipeline
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Where your applications stand right now
          </p>
        </div>
        {total > 0 && rejected > 0 && (
          <span className="shrink-0 rounded-md bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
            {rejected} rejected
          </span>
        )}
      </div>

      {total === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-xs text-muted-foreground">No applications yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
          {FUNNEL_STAGES.map((stage, i) => {
            const count = counts[stage.key] ?? 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            const isLast = i === FUNNEL_STAGES.length - 1;
            return (
              <div key={stage.key} className="flex flex-1 items-stretch">
                <div
                  className={cn(
                    "flex flex-1 flex-col gap-1.5 rounded-lg border border-border bg-muted/20 px-3.5 py-3",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", stage.dot)} />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {stage.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-lg font-semibold leading-none text-foreground">
                      {count}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {percentage}%
                    </span>
                  </div>
                </div>
                {!isLast && (
                  <div className="hidden shrink-0 items-center px-1.5 sm:flex">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ApplicationPipeline;