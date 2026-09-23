"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarCheck2, ChevronRight, FileSearch, MailQuestion, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";
import { useResumesIndex } from "@/features/jobseeker/resumes/hooks/useResumes";
import { isPopulatedJobId } from "@/types/interview";

const DAY_MS = 24 * 60 * 60 * 1000;

type Tile = {
  key: string;
  icon: React.ElementType;
  iconClass: string;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
};

const TodayFocusCard = () => {
  const { jobs } = useJobs();
  const { interviews } = useInterviews();
  const { items: resumes } = useResumesIndex();

  const tiles = useMemo<Tile[]>(() => {
    const now = Date.now();

    const staleApplied = jobs
      .filter((j) => (j.applicationStatus || "").toLowerCase() === "applied")
      .filter((j) => now - new Date(j.applicationDate).getTime() >= 7 * DAY_MS)
      .sort((a, b) => new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime());

    const nextInterview = interviews
      .filter((i) => i.status === "scheduled" && new Date(i.interviewDate).getTime() >= now)
      .sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime())[0];

    const out: Tile[] = [];

    if (staleApplied.length > 0) {
      const job = staleApplied[0];
      out.push({
        key: "follow-up",
        icon: MailQuestion,
        iconClass: "bg-destructive/10 text-destructive",
        title: `Follow up with ${job.companyName}`,
        subtitle: `Applied ${Math.round((now - new Date(job.applicationDate).getTime()) / DAY_MS)} days ago`,
        href: `/jobseeker/applications/edit/${job.id}`,
        cta: "Send Follow-up",
      });
    }

    if (nextInterview) {
      const job = isPopulatedJobId(nextInterview.jobId) ? nextInterview.jobId : null;
      out.push({
        key: "interview",
        icon: CalendarCheck2,
        iconClass: "bg-primary/10 text-primary",
        title: `Prepare for ${job?.companyName ?? "your"} interview`,
        subtitle: new Date(nextInterview.interviewDate).toLocaleString("en-US", {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        }),
        href: "/jobseeker/interviews",
        cta: "View Details",
      });
    }

    out.push({
      key: "opportunities",
      icon: FileSearch,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      title: "New matching jobs",
      subtitle: "Based on your profile",
      href: "/job-board",
      cta: "View Jobs",
    });

    if (resumes.length === 0) {
      out.push({
        key: "cv",
        icon: Sparkles,
        iconClass: "bg-gold/15 text-gold-foreground dark:text-gold",
        title: "Build your CV",
        subtitle: "Get an ATS-ready resume",
        href: "/jobseeker/resumes",
        cta: "Build CV",
      });
    } else {
      out.push({
        key: "cv",
        icon: Sparkles,
        iconClass: "bg-gold/15 text-gold-foreground dark:text-gold",
        title: "Check your CV health",
        subtitle: "Improve your ATS score",
        href: "/jobseeker/cv-review",
        cta: "Improve CV",
      });
    }

    return out.slice(0, 4);
  }, [jobs, interviews, resumes]);

  return (
    <Card className="border-border p-4 shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold tracking-tight">Today&apos;s Focus</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {tiles.length} task{tiles.length === 1 ? "" : "s"} to keep your search moving
          </p>
        </div>
        <Link
          href="/jobseeker/applications"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.key}
              className="flex flex-col gap-2.5 rounded-lg border border-border bg-muted/20 p-3"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tile.iconClass}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{tile.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{tile.subtitle}</p>
              </div>
              <Link
                href={tile.href}
                className="mt-auto flex items-center justify-center rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {tile.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TodayFocusCard;
