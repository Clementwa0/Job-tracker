"use client";

import Link from "next/link";
import {
  Bookmark,
  BriefcaseBusiness,
  CircleDollarSign,
  MapPin,
} from "lucide-react";
import { useSavedJobs } from "@/lib/savedJobs";
import type { PublicJobListItem } from "@/types/jobPosting";
import AddToTrackerButton from "./AddToTrackerButton";
import { cn } from "@/lib/utils";

export default function JobBoardCard({ job }: { job: PublicJobListItem }) {
  const { has, toggle } = useSavedJobs();
  const saved = has(job.slug);
  const showSalary = Boolean(job.salaryMin || job.salaryMax);

  return (
    <article className="group min-w-0 rounded-lg border border-border bg-card px-3.5 py-3 shadow-xs transition hover:border-primary/40 hover:shadow-sm sm:flex sm:items-center sm:gap-3">
      <Link
        href={`/job-board/${job.slug}`}
        className="flex min-w-0 items-start gap-3 sm:flex-1"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-primary/10 text-[15px] font-bold tracking-tight text-primary sm:h-11 sm:w-11 sm:text-[17px]">
          {job.company?.name.slice(0, 1).toUpperCase() || "J"}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[13.5px] font-semibold leading-tight tracking-tight text-foreground sm:text-sm">
            {job.title}
          </h2>
          <p className="mt-0.5 truncate text-[11.5px] font-medium text-muted-foreground sm:text-xs">
            {job.company?.name || "Company"}
          </p>

          {/* Single compact meta line on mobile; wraps on sm+ */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
            <Meta Icon={MapPin} label={job.location || "Flexible"} />
            <Dot />
            <Meta
              Icon={BriefcaseBusiness}
              label={job.jobType.replace("-", " ")}
            />
            {showSalary && (
              <>
                <Dot />
                <Meta Icon={CircleDollarSign} label={salary(job)} />
              </>
            )}
            <Dot />
            <span>{posted(job.publishedAt)}</span>
          </div>
        </div>
      </Link>

      {/* Actions — desktop only, hidden on mobile */}
      <div className="hidden sm:ml-auto sm:flex sm:shrink-0 sm:items-center sm:gap-2">
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
          className={cn(
            "flex items-center justify-center rounded-md border p-1.5 transition",
            saved
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
          )}
        >
          <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
        </button>
      </div>
    </article>
  );
}

function Dot() {
  return <span className="text-border">·</span>;
}

function salary(job: PublicJobListItem) {
  const currency = job.salaryCurrency || "KES";
  const min = job.salaryMin?.toLocaleString();
  const max = job.salaryMax?.toLocaleString();
  if (min && max) return `${currency} ${min}–${max}`;
  if (min) return `${currency} ${min}+`;
  return `Up to ${currency} ${max}`;
}

function posted(value?: string) {
  if (!value) return "New";
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000),
  );
  return days === 0 ? "Today" : `${days}d ago`;
}

function Meta({
  Icon,
  label,
}: {
  Icon: typeof MapPin;
  label: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}