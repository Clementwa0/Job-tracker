"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminPageHeader from "@/features/admin/shell/PageHeader";
import AdminPagination from "@/features/admin/components/AdminPagination";
import { AdminEmptyState } from "@/features/admin/components/AdminListStates";
import { JobStatusBadge, JobTypeBadge } from "@/features/admin/components/JobBadges";
import { useAdminPagination } from "@/features/admin/hooks/useAdminPagination";
import { useAdminJobs } from "@/features/admin/dummy/adminDummyStore";
import AdminJobActions from "@/features/admin/jobs/AdminJobActions";
import AdminJobDetailsDialog from "@/features/admin/jobs/AdminJobDetailsDialog";
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

export default function AdminJobsView() {
  const allJobs = useAdminJobs();
  const { page, limit, setPage, setLimit } = useAdminPagination();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingJob, setViewingJob] = useState<AdminJobPosting | null>(null);

  const filtered = useMemo(() => {
    return allJobs.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (
        q &&
        !job.title.toLowerCase().includes(q.toLowerCase()) &&
        !job.company?.name.toLowerCase().includes(q.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [allJobs, statusFilter, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * limit, currentPage * limit);

  const pendingCount = allJobs.filter((j) => j.status === "pending_review").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
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

      {paged.length === 0 ? (
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
                {paged.map((job) => (
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
                      <AdminJobActions job={job} onView={setViewingJob} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            meta={{ page: currentPage, limit, total, totalPages }}
            page={currentPage}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </>
      )}

      <AdminJobDetailsDialog job={viewingJob} onOpenChange={(open) => !open && setViewingJob(null)} />
    </div>
  );
}
