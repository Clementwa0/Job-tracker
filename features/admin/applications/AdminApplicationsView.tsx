"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AdminPageHeader from "@/features/admin/shell/PageHeader";
import AdminPagination from "@/features/admin/components/AdminPagination";
import { AdminEmptyState } from "@/features/admin/components/AdminListStates";
import { useAdminPagination } from "@/features/admin/hooks/useAdminPagination";
import { useAdminApplications } from "@/features/admin/dummy/adminDummyStore";
import type { AdminApplicationStatus } from "@/types/admin";

const STATUS_STYLES: Record<AdminApplicationStatus, string> = {
  submitted: "bg-muted text-muted-foreground",
  under_review: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  shortlisted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
};

const STATUS_LABELS: Record<AdminApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
];

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function AdminApplicationsView() {
  const allApplications = useAdminApplications();
  const { page, limit, setPage, setLimit } = useAdminPagination();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return allApplications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (
        q &&
        !a.applicantName.toLowerCase().includes(q.toLowerCase()) &&
        !a.jobTitle.toLowerCase().includes(q.toLowerCase()) &&
        !a.companyName.toLowerCase().includes(q.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [allApplications, statusFilter, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="space-y-6">
      <AdminPageHeader
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

      {paged.length === 0 ? (
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
                {paged.map((application) => (
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
                        {STATUS_LABELS[application.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(application.appliedAt)}</td>
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
    </div>
  );
}
