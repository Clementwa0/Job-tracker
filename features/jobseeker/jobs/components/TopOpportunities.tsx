"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  ChevronRight,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  Wifi,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRecommendations } from "@/features/jobseeker/profile/hooks/useRecommendations";
import { labelize } from "@/lib/profile/options";
import { useSavedJobs } from "@/lib/savedJobs";
import type { RecommendedJob } from "@/types/profile";
import SavedJobsCard from "./SavedJobsCard";

const EMPTY_JOBS: RecommendedJob[] = [];

const deadlineLabel = (d: number | null) =>
  d === null
    ? "Open"
    : d === 0
      ? "Closes today"
      : `${d} ${d === 1 ? "day" : "days"} left`;

const experienceLevel = (title: string) => {
  const n = title.toLowerCase();
  if (/intern|graduate|entry.level|junior|associate/.test(n)) return "entry";
  if (/senior|lead|principal|staff|director|head of/.test(n)) return "senior";
  return "mid";
};

const formatSalary = (job: RecommendedJob) => {
  if (job.salaryMin === null && job.salaryMax === null) return "";
  const currency = job.salaryCurrency || "";
  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, {
      notation: n >= 100_000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(n);
  if (job.salaryMin !== null && job.salaryMax !== null)
    return `${currency} ${fmt(job.salaryMin)} - ${fmt(job.salaryMax)}`;
  return `${currency} ${fmt(job.salaryMin ?? job.salaryMax!)}`;
};

const selectClass =
  "h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring";

const TopOpportunities = ({
  variant = "compact",
}: {
  variant?: "compact" | "page";
}) => {
  const isPage = variant === "page";
  const { data, isLoading } = useRecommendations(isPage ? 20 : 4);
  const { jobs: savedJobs, has, toggle } = useSavedJobs();
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [experience, setExperience] = useState("any");
  const [sort, setSort] = useState("recent");
  const [activeTab, setActiveTab] = useState<"recommended" | "saved">(
    "recommended",
  );
  const jobs = data?.jobs ?? EMPTY_JOBS;
  const categories = useMemo(
    () => [...new Set(jobs.map((j) => j.jobType).filter(Boolean))],
    [jobs],
  );
  const locations = useMemo(
    () => [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort(),
    [jobs],
  );
  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter(
      (j) =>
        (category === "all" || j.jobType === category) &&
        (location === "all" || j.location === location) &&
        (experience === "any" || experienceLevel(j.title) === experience),
    );
    return filtered.sort((a, b) =>
      sort === "match"
        ? b.matchScore - a.matchScore
        : sort === "deadline"
          ? (a.daysLeft ?? Number.MAX_SAFE_INTEGER) -
            (b.daysLeft ?? Number.MAX_SAFE_INTEGER)
          : (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) -
            (a.publishedAt ? new Date(a.publishedAt).getTime() : 0),
    );
  }, [jobs, category, location, experience, sort]);

  if (isPage) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-5 lg:px-6">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                Recommended Jobs
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Discover opportunities that match your skills and career goals.
              </p>
            </div>
          </div>
          <div
            role="tablist"
            aria-label="Job views"
            className="grid w-full grid-cols-2 rounded-lg border border-border bg-card p-1 xl:w-[340px]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "recommended"}
              onClick={() => setActiveTab("recommended")}
              className={`flex h-8 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors ${activeTab === "recommended" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Sparkles className="size-3.5" /> Recommended
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "saved"}
              onClick={() => setActiveTab("saved")}
              className={`flex h-8 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors ${activeTab === "saved" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Bookmark className="size-3.5" /> Saved{" "}
              <span className="rounded-full bg-background/20 px-1.5 text-[10px]">
                {savedJobs.length}
              </span>
            </button>
          </div>
        </div>

        <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]">
          <main className="min-w-0 space-y-2">
            <Card className="grid grid-cols-2 gap-2 border-border p-2 shadow-none sm:grid-cols-4">
              <label className="sr-only" htmlFor="recommended-category">
                Job category
              </label>
              <select
                id="recommended-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectClass}
              >
                <option value="all">All Categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {labelize(item)}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="recommended-location">
                Job location
              </label>
              <select
                id="recommended-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={selectClass}
              >
                <option value="all">All Locations</option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="recommended-experience">
                Experience level
              </label>
              <select
                id="recommended-experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={selectClass}
              >
                <option value="any">Any Experience</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
              <label className="sr-only" htmlFor="recommended-sort">
                Sort jobs
              </label>
              <select
                id="recommended-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={selectClass}
              >
                <option value="recent">Most Recent</option>
                <option value="match">Best Match</option>
                <option value="deadline">Closing Soon</option>
              </select>
            </Card>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg border border-border bg-card"
                  />
                ))}
              </div>
            ) : activeTab === "saved" ? (
              savedJobs.length ? (
                <ul className="space-y-1.5">
                  {savedJobs.map((job) => (
                    <li
                      key={job.slug}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary/30"
                    >
                      <Link
                        href={`/job-board/${job.slug}`}
                        className="flex min-w-0 flex-1 items-center gap-2.5"
                      >
                        <Avatar className="size-8 rounded-lg">
                          <AvatarFallback className="rounded-lg bg-primary/10 text-[10px] font-semibold text-primary">
                            {job.company.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {job.title}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {job.company} ·{" "}
                            {job.location || "Location not listed"}
                          </span>
                        </span>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${job.title} from saved jobs`}
                        title="Remove saved job"
                        onClick={() => void toggle(job)}
                        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <Card className="p-6 text-center shadow-none">
                  <Bookmark className="mx-auto mb-2 size-5 text-muted-foreground" />
                  <p className="text-sm font-medium">No saved jobs yet</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Bookmark a recommendation to keep it here.
                  </p>
                </Card>
              )
            ) : !jobs.length ? (
              <Card className="p-6 text-center shadow-none">
                <p className="text-sm font-medium">
                  {data?.ready === false
                    ? "Build your profile to get recommendations"
                    : "No recommendations right now"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {data?.ready === false
                    ? "Add skills or target roles to see jobs matched to you."
                    : "Check back soon for new opportunities."}
                </p>
                {data?.ready === false && (
                  <Button
                    render={<Link href="/jobseeker/settings" />}
                    size="sm"
                    className="mt-3"
                  >
                    Update profile
                  </Button>
                )}
              </Card>
            ) : filteredJobs.length ? (
              <ul className="space-y-1.5">
                {filteredJobs.map((job) => {
                  const saved = has(job.slug);
                  const saveInput = {
                    slug: job.slug,
                    title: job.title,
                    company: job.company.name,
                    location: job.location,
                    salary: formatSalary(job),
                  };
                  return (
                    <li
                      key={job.id}
                      className="rounded-lg border border-border bg-card p-2.5 shadow-xs transition-all hover:border-primary/25 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-2.5">
                        <Avatar className="size-9 shrink-0 rounded-lg">
                          <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {job.company.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                href={`/job-board/${job.slug}`}
                                className="block truncate text-sm font-semibold hover:text-primary"
                              >
                                {job.title}
                              </Link>
                              <p className="truncate text-xs text-muted-foreground">
                                {job.company.name}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 text-[11px] font-medium ${job.daysLeft !== null && job.daysLeft <= 7 ? "text-destructive" : "text-muted-foreground"}`}
                            >
                              {deadlineLabel(job.daysLeft)}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
                            {job.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-3" />
                                {job.location}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              {job.workMode.toLowerCase() === "remote" ? (
                                <Wifi className="size-3" />
                              ) : (
                                <BriefcaseBusiness className="size-3" />
                              )}
                              {labelize(job.workMode)}
                            </span>
                            {formatSalary(job) && (
                              <span>{formatSalary(job)}</span>
                            )}
                            <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
                              <Sparkles className="size-3" />
                              {job.matchScore}%
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <Badge className="rounded-full bg-primary/10 px-1.5 py-0 text-[10px] text-primary hover:bg-primary/10">
                              {labelize(job.jobType)}
                            </Badge>
                            {job.matchedSkills.slice(0, 2).map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="rounded-full px-1.5 py-0 text-[10px]"
                              >
                                {s}
                              </Badge>
                            ))}
                            <div className="ml-auto flex items-center gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                aria-label={
                                  saved ? "Remove saved job" : "Save job"
                                }
                                title={saved ? "Remove saved job" : "Save job"}
                                onClick={() => void toggle(saveInput)}
                                className="size-7"
                              >
                                {saved ? (
                                  <BookmarkCheck className="size-3.5 fill-primary/15 text-primary" />
                                ) : (
                                  <Bookmark className="size-3.5" />
                                )}
                              </Button>
                              <Button
                              nativeButton={false}
                                render={
                                  <Link href={`/job-board/${job.slug}`} />
                                }
                                size="sm"
                                className="h-7 px-2.5 text-xs"
                              >
                                View Job
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Card className="p-6 text-center shadow-none">
                <SlidersHorizontal className="mx-auto mb-2 size-4 text-muted-foreground" />
                <p className="text-sm font-medium">
                  No jobs match these filters
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setCategory("all");
                    setLocation("all");
                    setExperience("any");
                  }}
                >
                  Clear filters
                </Button>
              </Card>
            )}
          </main>
          <aside className="min-w-0 xl:sticky xl:top-3">
            <SavedJobsCard variant="panel" />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border p-3.5 shadow-none">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold tracking-tight">
          Top Job Opportunities
        </h2>
        <Link
          href="/job-board"
          className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-lg bg-muted/40" />
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center">
          <p className="text-[11px] text-muted-foreground">
            {data?.ready === false
              ? "Add your skills and target roles to get jobs matched to you."
              : "No open jobs match your profile right now. Check back soon."}
          </p>
          {data?.ready === false && (
            <Link
              href="/jobseeker/settings"
              className="mt-1.5 inline-block text-[11px] font-medium text-primary hover:underline"
            >
              Update profile
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {jobs.map((o) => (
            <li key={o.id}>
              <Link
                href={`/job-board/${o.slug}`}
                title={o.reasons.join(" · ")}
                className="-mx-1 flex items-center gap-2.5 rounded-md px-1 py-2 transition-colors hover:bg-muted/40"
              >
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarFallback className="rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
                    {o.company.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {o.title}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {o.company.name} · {o.location}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-primary">
                      {o.matchScore}% match
                    </span>
                    <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                      {labelize(o.jobType)}
                    </Badge>
                  </div>
                  <span
                    className={`text-[10px] font-medium ${o.daysLeft !== null && o.daysLeft <= 7 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {deadlineLabel(o.daysLeft)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default TopOpportunities;
