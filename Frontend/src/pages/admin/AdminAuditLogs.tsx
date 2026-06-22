import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminTableSkeleton,
} from "@/components/admin/AdminListStates";
import AdminPageHeader from "@/features/admin/shell/AdminPageHeader";
import { useAdminPagination } from "@/hooks/useAdminPagination";
import { adminService } from "@/services/adminService";
import type { AuditLogEntry, PaginatedMeta } from "@/types/admin";
import { getApiErrorMessage } from "@/lib/apiError";

const EMPTY_META: PaginatedMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

export default function AdminAuditLogs() {
  const { page, limit, setPage, setLimit } = useAdminPagination();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { logs: list, meta: m } = await adminService.listAuditLogs({ page, limit });
      setLogs(list);
      setMeta(m);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Audit logs" description="Platform activity and admin actions" />

      {loading ? (
        <AdminTableSkeleton rows={limit} cols={4} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={load} />
      ) : logs.length === 0 ? (
        <AdminEmptyState title="No audit logs" description="Admin actions will appear here." />
      ) : (
        <>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">Target</TableHead>
                    <TableHead className="hidden lg:table-cell">Meta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.action}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {log.targetType}
                        <span className="text-muted-foreground"> · {log.targetId.slice(-8)}</span>
                      </TableCell>
                      <TableCell className="hidden max-w-xs truncate text-xs text-muted-foreground lg:table-cell">
                        {log.meta ? JSON.stringify(log.meta) : "—"}
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
