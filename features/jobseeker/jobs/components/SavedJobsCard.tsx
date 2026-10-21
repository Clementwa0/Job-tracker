"use client";

import Link from "next/link";
import { ChevronRight, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSavedJobs } from "@/lib/savedJobs";

const SavedJobsCard = () => {
  const { jobs } = useSavedJobs();

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight">Saved Jobs</h2>
        <Link
          href="/job-board"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Bookmark jobs from the job board to see them here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {jobs.slice(0, 5).map((job) => (
            <li key={job.slug}>
              <Link
                href={`/job-board/${job.slug}`}
                className="flex items-center gap-2 text-xs hover:text-primary"
              >
                <Heart className="h-3.5 w-3.5 shrink-0 fill-destructive/15 text-destructive" />
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium text-foreground">{job.title}</span>
                  <span className="text-muted-foreground"> - {job.company}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default SavedJobsCard;
