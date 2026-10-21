"use client";

import Link from "next/link";
import { BookmarkCheck, ChevronRight, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSavedJobs } from "@/lib/savedJobs";
import CompanyLogo from "./CompanyLogo";

const SavedJobsCard = ({ variant = "compact" }: { variant?: "compact" | "panel" }) => {
  const { jobs, toggle } = useSavedJobs();
  const isPanel = variant === "panel";

  return (
    <Card className={`border-border shadow-none ${isPanel ? "p-3.5" : "p-4"}`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold tracking-tight">
          <BookmarkCheck className="size-4 text-primary" />
          Saved Jobs
          <span className="rounded-full bg-primary/10 px-1.5 text-[11px] text-primary">{jobs.length}</span>
        </h2>
        <Link href="/job-board" className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline">
          {isPanel ? "Browse" : "View all"} <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          Bookmark jobs to see them here.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {jobs.slice(0, isPanel ? 8 : 5).map((job) => (
            <li key={job.slug}>
              {isPanel ? (
                <div className="flex items-center gap-2 rounded-lg border border-border/80 px-2.5 py-2">
                  <Link href={`/job-board/${job.slug}`} className="flex min-w-0 flex-1 items-center gap-2">
                    <CompanyLogo name={job.company} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{job.title}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{job.company} · {job.location || "Location not listed"}</span>
                    </span>
                  </Link>
                  <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${job.title} from saved jobs`} title="Remove saved job" onClick={() => void toggle(job)} className="size-7 shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <Link href={`/job-board/${job.slug}`} className="flex items-center gap-2 text-xs hover:text-primary">
                  <Heart className="h-3.5 w-3.5 shrink-0 fill-destructive/15 text-destructive" />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium text-foreground">{job.title}</span>
                    <span className="text-muted-foreground"> - {job.company}</span>
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default SavedJobsCard;