import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/features/admin/shell/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminTableSkeleton,
} from "@/components/admin/AdminListStates";
import { useAdminPagination } from "@/hooks/useAdminPagination";
import { adminService } from "@/services/adminService";
import type { AdminCompany, PaginatedMeta } from "@/types/admin";
import { getApiErrorMessage } from "@/lib/apiError";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700",
  approved: "bg-emerald-500/15 text-emerald-700",
  suspended: "bg-rose-500/15 text-rose-700",
};

const EMPTY_META: PaginatedMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

export default function AdminCompanies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, limit, setPage, setLimit, resetPage } = useAdminPagination();
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [actionId, setActionId] = useState<string | null>(null);

  const onStatusChange = (v: string) => {
    const next = v === "all" ? "" : v;
    setStatusFilter(next);
    resetPage();
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next) p.set("status", next);
        else p.delete("status");
        p.delete("page");
        return p;
      },
      { replace: true },
    );
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { companies: list, meta: m } = await adminService.listCompanies({
        status: statusFilter || undefined,
        page,
        limit,
      });
      setCompanies(list);
      setMeta(m);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (id: string, status: "pending" | "approved" | "suspended", msg: string) => {
    try {
      setActionId(id);
      await adminService.updateCompanyStatus(id, status);
      toast.success(msg);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Companies" description="Approve or suspend employer companies" />

      <Select value={statusFilter || "all"} onValueChange={onStatusChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <AdminTableSkeleton rows={limit} cols={4} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={load} />
      ) : companies.length === 0 ? (
        <AdminEmptyState title="No companies" description="No companies match the current filter." />
      ) : (
        <>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden sm:table-cell">Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.location || c.slug}</p>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {c.industry || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATUS_STYLE[c.status]}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-1">
                          {c.status !== "approved" && (
                            <Button
                              size="sm"
                              disabled={actionId === c.id}
                              onClick={() => run(c.id, "approved", "Company approved")}
                            >
                              Approve
                            </Button>
                          )}
                          {c.status !== "suspended" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionId === c.id}
                              onClick={() => run(c.id, "suspended", "Company suspended")}
                            >
                              Suspend
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <AdminPagination
            meta={meta}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}
