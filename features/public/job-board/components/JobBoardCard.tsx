"use client";

import Link from "next/link";
import { Bookmark, BriefcaseBusiness, CircleDollarSign, MapPin } from "lucide-react";
import { useSavedJobs } from "@/lib/savedJobs";
import type { PublicJobListItem } from "@/types/jobPosting";
import AddToTrackerButton from "./AddToTrackerButton";

export default function JobBoardCard({ job }: { job: PublicJobListItem }) {
  const { has, toggle } = useSavedJobs();
  const saved = has(job.slug);

  return (
    <article className="group flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-3 shadow-xs transition hover:border-primary/40 hover:shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-primary/10 text-[17px] font-bold tracking-tight text-primary">
        {job.company?.name.slice(0, 1).toUpperCase() || "J"}
      </span>

      <Link href={`/job-board/${job.slug}`} className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">{job.title}</h2>
        <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          {job.company?.name || "Company"}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          <Meta Icon={MapPin} label={job.location || "Location flexible"} />
          <Meta Icon={BriefcaseBusiness} label={job.jobType.replace("-", " ")} />
          {(job.salaryMin || job.salaryMax) && <Meta Icon={CircleDollarSign} label={salary(job)} />}
          <span className="hidden text-border sm:inline">·</span>
          <span>{posted(job.publishedAt)}</span>
        </div>
        {(job.category || job.experienceLevel) && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {job.category && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {job.category}
              </span>
            )}
            {job.experienceLevel && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {job.experienceLevel}
              </span>
            )}
          </div>
        )}
      </Link>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        <AddToTrackerButton job={job} />
        <button
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
          className={`rounded-md border p-1.5 transition ${
            saved
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}
        >
          <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>
    </article>
  );
}

function salary(job: PublicJobListItem) {
  const currency = job.salaryCurrency || "KES";
  if (job.salaryMin && job.salaryMax) return `${currency} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`;
  if (job.salaryMin) return `${currency} ${job.salaryMin.toLocaleString()}+`;
  return `Up to ${currency} ${(job.salaryMax || 0).toLocaleString()}`;
}

function posted(value?: string) {
  if (!value) return "Recently posted";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  return days === 0 ? "Posted today" : `Posted ${days}d ago`;
}

function Meta({ Icon, label }: { Icon: typeof MapPin; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
