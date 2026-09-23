"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { isResponseStatus } from "@/lib/jobs/status";

const DAY_MS = 24 * 60 * 60 * 1000;

const CareerInsightCard = () => {
  const { jobs } = useJobs();

  const insight = useMemo(() => {
    const now = Date.now();
    const recent = jobs.filter(
      (j) => now - new Date(j.applicationDate).getTime() <= 3 * DAY_MS
    ).length;
    // A response counts once it has happened, even if the application has moved on since.
    const responded = jobs.filter((j) => j.respondedAt || isResponseStatus(j.applicationStatus)).length;

    if (jobs.length === 0) {
      return "Add your first application to start seeing personalized insights about your job search.";
    }
    if (responded > 0 && recent > 0) {
      return `You're getting the most responses from applications submitted within ${3} days of a job being posted.`;
    }
    if (recent === 0) {
      return "You haven't applied to anything in the last few days — a steady pace keeps momentum going.";
    }
    return `You've submitted ${recent} application${recent === 1 ? "" : "s"} this week. Keep the pace up.`;
  }, [jobs]);

  return (
    <Card className="border-border p-4 shadow-none">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-gold" />
          <h2 className="font-display text-sm font-semibold tracking-tight">Career Insight</h2>
        </div>
        <Link
          href="/jobseeker/analytics"
          className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
        >
          Full analytics
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">{insight}</p>
    </Card>
  );
};

export default CareerInsightCard;
