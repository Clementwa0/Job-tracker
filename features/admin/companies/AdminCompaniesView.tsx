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
import { useAdminCompanies } from "@/features/admin/dummy/adminDummyStore";
import AdminCompanyActions from "@/features/admin/companies/AdminCompanyActions";
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

export default function AdminCompaniesView() {
  const allCompanies = useAdminCompanies();
  const { page, limit, setPage, setLimit } = useAdminPagination();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return allCompanies.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [allCompanies, statusFilter, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * limit, currentPage * limit);

  const pendingCount = allCompanies.filter((c) => c.status === "pending").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
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

      {paged.length === 0 ? (
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
                {paged.map((company) => (
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
                      <AdminCompanyActions company={company} />
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
    </div>
  );
}
