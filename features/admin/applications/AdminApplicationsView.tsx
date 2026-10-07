"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/dashboard/PageHeader";
import AdminPagination from "@/features/admin/components/AdminPagination";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminTableSkeleton,
} from "@/features/admin/components/AdminListStates";
import { useAdminList, type AdminListQuery } from "@/features/admin/hooks/useAdminList";
import { adminService } from "@/features/admin/services/admin.client";
import type { AdminApplication, AdminApplicationStatus } from "@/types/admin";

// Statuses are the jobseeker-side application statuses: each application here is a
// jobseeker's own tracked application to a job-board posting, so the status is
// whatever the applicant has recorded - admins can't change it.
const STATUS_STYLES: Record<AdminApplicationStatus, string> = {
  applied: "bg-muted text-muted-foreground",
  waiting_response: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  interviewing: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  offer: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  ghosted: "bg-muted text-muted-foreground",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

const STATUS_LABELS: Record<AdminApplicationStatus, string> = {
  applied: "Applied",
  waiting_response: "Waiting response",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
  completed: "Completed",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...(Object.keys(STATUS_LABELS) as AdminApplicationStatus[]).map((value) => ({
    value,
    label: STATUS_LABELS[value],
  })),
];

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const EMPTY_SUMMARY = {};

async function fetchApplications({ page, limit, q, status }: AdminListQuery) {
  const { applications, meta } = await adminService.listApplications({ page, limit, q, status });
  return { items: applications, meta, summary: EMPTY_SUMMARY };
}

export default function AdminApplicationsView() {
  const list = useAdminList<AdminApplication, typeof EMPTY_SUMMARY>(fetchApplications, EMPTY_SUMMARY);
  const { items, meta, loading, error, reload, q, setQ, statusFilter, setStatusFilter } = list;
  const initialLoad = loading && items.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Browse applications across the platform. Reviewing and status changes are handled by employers."
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Search applicant, job or company…"
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
        <AdminTableSkeleton cols={5} />
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="No applications match your filters"
          description="Try a different search term or status."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                </tr>
              </thead>
              <tbody>
                {items.map((application) => (
                  <tr key={application.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <p className="font-medium">{application.applicantName}</p>
                      <p className="text-xs text-muted-foreground">{application.applicantEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{application.jobTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{application.companyName}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={cn("font-normal", STATUS_STYLES[application.status])}
                      >
                        {STATUS_LABELS[application.status] ?? application.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(application.appliedAt)}</td>
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
    </div>
  );
}
