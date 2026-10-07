"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/dashboard/PageHeader";
import AdminPagination from "@/features/admin/components/AdminPagination";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminTableSkeleton,
} from "@/features/admin/components/AdminListStates";
import { JobStatusBadge, JobTypeBadge } from "@/features/admin/components/JobBadges";
import { useAdminList, type AdminListQuery } from "@/features/admin/hooks/useAdminList";
import AdminJobActions from "@/features/admin/jobs/AdminJobActions";
import AdminJobDetailsDialog from "@/features/admin/jobs/AdminJobDetailsDialog";
import { adminService } from "@/features/admin/services/admin.client";
import type { AdminJobPosting } from "@/types/admin";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending_review", label: "Pending review" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "closed", label: "Closed" },
];

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const EMPTY_SUMMARY: { pendingReview?: number } = {};

async function fetchJobs({ page, limit, q, status }: AdminListQuery) {
  const { jobs, meta, summary } = await adminService.listJobs({ page, limit, q, status });
  return { items: jobs, meta, summary };
}

export default function AdminJobsView() {
  const list = useAdminList<AdminJobPosting, { pendingReview?: number }>(fetchJobs, EMPTY_SUMMARY);
  const { items, meta, loading, error, reload, q, setQ, statusFilter, setStatusFilter } = list;
  const [viewingJob, setViewingJob] = useState<AdminJobPosting | null>(null);

  const pendingCount = list.summary.pendingReview ?? 0;
  const initialLoad = loading && items.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description={
          pendingCount > 0
            ? `${pendingCount} ${pendingCount === 1 ? "posting" : "postings"} awaiting review.`
            : "Review, approve and close job postings across the platform."
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Search title or company…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && items.length === 0 ? (
        <AdminErrorState message={error} onRetry={reload} />
      ) : initialLoad ? (
        <AdminTableSkeleton cols={6} />
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="No jobs match your filters"
          description="Try a different search term or status."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Posted</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((job) => (
                  <tr key={job.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewingJob(job)}
                        className="text-left font-medium hover:underline"
                      >
                        {job.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{job.company?.name ?? "-"}</td>
                    <td className="px-4 py-3">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3">
                      <JobTypeBadge type={job.jobType} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(job.publishedAt ?? job.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <AdminJobActions job={job} onView={setViewingJob} onChanged={reload} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            meta={meta}
            page={list.page}
            limit={list.limit as 10 | 20 | 50 | 100}
            onPageChange={list.setPage}
            onLimitChange={list.setLimit}
            loading={loading}
          />
        </>
      )}

      <AdminJobDetailsDialog job={viewingJob} onOpenChange={(open) => !open && setViewingJob(null)} />
    </div>
  );
}
