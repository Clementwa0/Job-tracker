"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  ClipboardList,
  Globe,
  MapPin,
  Plus,
  Send,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import PostingStatusBadge from "@/features/employer/components/PostingStatusBadge";
import {
  EmployerDashboardError,
  EmployerDashboardSkeleton,
  EmployerJobsEmptyState,
  EmployerQuickActions,
  JobDetailsDialog,
  JobRowActions,
  useEmployerDashboardData,
} from "@/features/employer/dashboard";
import type { EmployerJobPosting } from "@/types/employer";

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { status, company, jobs, retry } = useEmployerDashboardData();
  const [viewingJob, setViewingJob] = useState<EmployerJobPosting | null>(null);
  const openWorkspace = () => router.push("/employer/dashboard/jobs");
  const openNewPosting = () => router.push("/employer/dashboard/jobs?new=1");

  // Derived from the dummy jobs — not hardcoded.
  const jobStats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((job) => job.status === "published").length;
    const draftJobs = jobs.filter((job) => job.status === "draft").length;
    return { totalJobs, activeJobs, draftJobs };
  }, [jobs]);

  const companyInitials = useMemo(() => {
    const source = company?.name || "Company";
    return source
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [company?.name]);

  if (status === "loading") {
    return <EmployerDashboardSkeleton />;
  }

  if (status === "error") {
    return <EmployerDashboardError onRetry={retry} />;
  }

  // Dashboard shows a short preview; the full sortable/filterable list lives
  // on its own route.
  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* ------------------------------------------------------------- */}
      {/* Welcome / Company Context                                    */}
      {/* ------------------------------------------------------------- */}
      <Card className="border-border p-4 shadow-none sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 rounded-lg" size="lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                {companyInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Welcome back{user?.name ? `, ${user.name}` : ""}
              </h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {company?.name ?? "No company set up yet"}
                </span>
                {company?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {company.location}
                  </span>
                )}
                {company?.website && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    {company.website.replace(/^https?:\/\//, "")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button size="sm" className="shrink-0" onClick={openNewPosting}>
            <Plus />
            Post a Job
          </Button>
        </div>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* Job Statistics                                                */}
      {/* ------------------------------------------------------------- */}
      <section>
        <div className="mb-3 flex items-center gap-1.5">
          <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
            Job Statistics
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <OverviewStat
            icon={<Briefcase className="h-4 w-4" />}
            iconClass="bg-primary/10 text-primary"
            label="Total Jobs"
            value={jobStats.totalJobs}
          />
          <OverviewStat
            icon={<Send className="h-4 w-4" />}
            iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            label="Active Jobs"
            value={jobStats.activeJobs}
          />
          <OverviewStat
            icon={<ClipboardList className="h-4 w-4" />}
            iconClass="bg-slate-500/10 text-slate-600 dark:text-slate-300"
            label="Draft Jobs"
            value={jobStats.draftJobs}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* My Job Postings                                               */}
      {/* ------------------------------------------------------------- */}
      <Card className="border-border p-4 shadow-none">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              My Job Postings
            </h2>
          </div>
          {jobs.length > 0 && (
            <button
              onClick={() => router.push("/employer/dashboard/jobs")}
              className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
            >
              View all
            </button>
          )}
        </div>

        {jobs.length === 0 ? (
          <EmployerJobsEmptyState onPostJob={openNewPosting} />
        ) : (
          <>
            {/* Table layout — sm and up */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Job Title
                    </TableHead>
                    <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-8 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Posted Date
                    </TableHead>
                    <TableHead className="h-8 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.map((job) => (
                    <TableRow key={job.id} className="h-11">
                      <TableCell className="max-w-[220px] py-2">
                        <button
                          onClick={() => setViewingJob(job)}
                          className="truncate text-left text-xs font-medium text-foreground hover:underline"
                        >
                          {job.title}
                        </button>
                      </TableCell>
                      <TableCell className="py-2">
                        <PostingStatusBadge status={job.status} />
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">
                        {formatDate(job.publishedAt ?? job.createdAt)}
                      </TableCell>
                      <TableCell className="py-2">
                        <JobRowActions job={job} onView={setViewingJob} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Card layout — mobile only, no horizontal scrolling */}
            <ul className="divide-y divide-border sm:hidden">
              {recentJobs.map((job) => (
                <li key={job.id} className="flex items-center gap-2 py-2.5">
                  <button
                    onClick={() => setViewingJob(job)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-xs font-medium text-foreground">{job.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <PostingStatusBadge status={job.status} />
                      <span>· {formatDate(job.publishedAt ?? job.createdAt)}</span>
                    </p>
                  </button>
                  <JobRowActions job={job} onView={setViewingJob} compact />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* Quick Actions                                                 */}
      {/* ------------------------------------------------------------- */}
      <EmployerQuickActions
        onPostJob={openNewPosting}
        onViewPostings={() => router.push("/employer/dashboard/jobs")}
      />

      <JobDetailsDialog job={viewingJob} onOpenChange={(open) => !open && setViewingJob(null)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Local presentational helpers
// ---------------------------------------------------------------------------
function OverviewStat({
  icon,
  iconClass,
  label,
  value,
}: {
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: number | string;
}) {
  return (
    <Card className="gap-0 rounded-xl border-border p-4 shadow-none">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
          {icon}
        </div>
        <p className="truncate text-[11px] font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="mt-2.5">
        <span className="font-display text-xl font-semibold leading-none text-foreground">
          {value}
        </span>
      </div>
    </Card>
  );
}
