"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useSavedJobs } from "@/lib/savedJobs";
import { JOB_TYPES, WORK_MODES } from "@/lib/jobPostings/options";
import type { PublicJobListItem } from "@/types/jobPosting";
import AddToTrackerButton from "./AddToTrackerButton";
import { cn } from "@/lib/utils";

export default function JobBoardCard({ job }: { job: PublicJobListItem }) {
  const { has, toggle } = useSavedJobs();
  const saved = has(job.slug);
  const hasSalary = Boolean(job.salaryMin || job.salaryMax);

  const meta = [
    label(JOB_TYPES, job.jobType),
    label(WORK_MODES, job.workMode),
    hasSalary ? salary(job) : null,
  ].filter(Boolean);

  return (
    <article className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40 sm:px-4">
      <Link
        href={`/job-board/${job.slug}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        {/* Company logo / initial */}
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground/70"
        >
          {job.company?.name?.charAt(0).toUpperCase() || "J"}
        </span>

        <div className="min-w-0 flex-1">
          {/* Job title + posted date */}
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="truncate text-[13.5px] font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
              {job.title}
            </h2>

            <span className="shrink-0 text-[11px] text-muted-foreground">
              {posted(job.publishedAt)}
            </span>
          </div>

          {/* Company + location */}
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {[job.company?.name || "Company", job.location || "Flexible"].join(
              " · ",
            )}
          </p>

          {/* Job metadata */}
          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground/80">
            {meta.join(" · ")}
          </p>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="hidden sm:block">
          <AddToTrackerButton job={job} />
        </span>

        <button
          type="button"
          onClick={() =>
            toggle({
              slug: job.slug,
              title: job.title,
              company: job.company?.name || "Company",
              location: job.location,
              salary: salary(job),
            })
          }
          aria-label={saved ? "Unsave job" : "Save job"}
          aria-pressed={saved}
          className={cn(
            "flex size-8 items-center justify-center rounded-md transition-colors",
            saved
              ? "text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Bookmark
            className={cn("size-4", saved && "fill-current")}
          />
        </button>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function label(
  options: readonly (readonly [string, string])[],
  value?: string,
) {
  if (!value) return null;

  return (
    options.find(([key]) => key === value)?.[1] ??
    value
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function salary(job: PublicJobListItem) {
  const currency = job.salaryCurrency || "KES";
  const min = job.salaryMin?.toLocaleString();
  const max = job.salaryMax?.toLocaleString();

  if (min && max) {
    return `${currency} ${min}–${max}`;
  }

  if (min) {
    return `${currency} ${min}+`;
  }

  if (max) {
    return `Up to ${currency} ${max}`;
  }

  return "";
}

function posted(value?: string) {
  if (!value) return "New";

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "New";
  }

  const days = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 86_400_000),
  );

  if (days === 0) return "Today";
  if (days === 1) return "1d ago";

  return `${days}d ago`;
}