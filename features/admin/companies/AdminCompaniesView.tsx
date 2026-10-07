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
import AdminCompanyActions from "@/features/admin/companies/AdminCompanyActions";
import { adminService } from "@/features/admin/services/admin.client";
import type { AdminCompany } from "@/types/admin";

const STATUS_STYLES: Record<AdminCompany["status"], string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  suspended: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
};

function CompanyStatusBadge({ status }: { status: AdminCompany["status"] }) {
  return (
    <Badge variant="secondary" className={cn("capitalize font-normal", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "suspended", label: "Suspended" },
];

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const EMPTY_SUMMARY: { pending?: number } = {};

async function fetchCompanies({ page, limit, q, status }: AdminListQuery) {
  const { companies, meta, summary } = await adminService.listCompanies({ page, limit, q, status });
  return { items: companies, meta, summary };
}

export default function AdminCompaniesView() {
  const list = useAdminList<AdminCompany, { pending?: number }>(fetchCompanies, EMPTY_SUMMARY);
  const { items, meta, loading, error, reload, q, setQ, statusFilter, setStatusFilter } = list;

  const pendingCount = list.summary.pending ?? 0;
  const initialLoad = loading && items.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description={
          pendingCount > 0
            ? `${pendingCount} ${pendingCount === 1 ? "company" : "companies"} awaiting approval.`
            : "Approve and manage employer companies on the platform."
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Search companies…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="sm:w-44">
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
          title="No companies match your filters"
          description="Try a different search term or status."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Industry</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((company) => (
                  <tr key={company.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <p className="font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.location}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{company.industry ?? "-"}</td>
                    <td className="px-4 py-3">
                      <CompanyStatusBadge status={company.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(company.createdAt)}</td>
                    <td className="px-4 py-3">
                      <AdminCompanyActions company={company} onChanged={reload} />
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
    </div>
  );
}
