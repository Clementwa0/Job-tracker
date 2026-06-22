import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminTableSkeleton,
} from "@/components/admin/AdminListStates";
import { useAdminPagination } from "@/hooks/useAdminPagination";
import { adminService } from "@/services/adminService";
import type { AdminUser, PaginatedMeta } from "@/types/admin";
import { getApiErrorMessage } from "@/lib/apiError";

const EMPTY_META: PaginatedMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

interface AdminUserListProps {
  fixedRole?: "employer";
  showRoleFilter?: boolean;
}

export default function AdminUserList({
  fixedRole,
  showRoleFilter = true,
}: AdminUserListProps) {
  const { page, limit, setPage, setLimit, resetPage } = useAdminPagination();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [roleFilter, setRoleFilter] = useState(fixedRole || "");
  const [actionId, setActionId] = useState<string | null>(null);

  const prevFilters = useRef({ q: debouncedQ, role: roleFilter });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (prevFilters.current.q !== debouncedQ || prevFilters.current.role !== roleFilter) {
      resetPage();
      prevFilters.current = { q: debouncedQ, role: roleFilter };
    }
  }, [debouncedQ, roleFilter, resetPage]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { users: list, meta: m } = await adminService.listUsers({
        q: debouncedQ || undefined,
        role: fixedRole || roleFilter || undefined,
        page,
        limit,
      });
      setUsers(list);
      setMeta(m);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, roleFilter, fixedRole, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (id: string, fn: () => Promise<unknown>, msg: string) => {
    try {
      setActionId(id);
      await fn();
      toast.success(msg);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
        {showRoleFilter && !fixedRole && (
          <Select value={roleFilter || "all"} onValueChange={(v) => setRoleFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="user">Job seeker</SelectItem>
              <SelectItem value="employer">Employer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <AdminTableSkeleton rows={limit} cols={4} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={load} />
      ) : users.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3 capitalize">{user.accountStatus}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        {user.accountStatus === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionId === user.id}
                            onClick={() =>
                              run(user.id, () => adminService.updateUserStatus(user.id, "suspended"), "User suspended")
                            }
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionId === user.id}
                            onClick={() =>
                              run(user.id, () => adminService.updateUserStatus(user.id, "active"), "User activated")
                            }
                          >
                            Activate
                          </Button>
                        )}
                        {user.role === "employer" && (
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/admin/jobs?createdBy=${user.id}`}>View jobs</Link>
                          </Button>
                        )}
                        {user.role !== "employer" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={actionId === user.id}
                            onClick={() =>
                              run(user.id, () => adminService.updateUserRole(user.id, "employer"), "Role → employer")
                            }
                          >
                            Make employer
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
