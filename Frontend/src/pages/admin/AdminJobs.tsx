import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { JobStatusBadge, JobTypeBadge } from "@/features/admin/JobBadges";
import AdminPageHeader from "@/features/admin/shell/AdminPageHeader";
import { useAdminPagination } from "@/hooks/useAdminPagination";
import { adminService } from "@/services/adminService";
import type { AdminJobPosting, PaginatedMeta } from "@/types/admin";
import { getApiErrorMessage } from "@/lib/apiError";

const EMPTY_META: PaginatedMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

function JobMobileCard({
  job,
  actionId,
  onAction,
}: {
  job: AdminJobPosting;
  actionId: string | null;
  onAction: (id: string, fn: () => Promise<unknown>, msg: string) => void;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{job.title}</CardTitle>
          <JobStatusBadge status={job.status} />
        </div>
        <p className="text-sm text-muted-foreground">{job.company?.name || "—"}</p>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2 pt-0">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <JobTypeBadge type={job.jobType} />
          <span>{job.viewCount} views</span>
        </div>
        <JobActionsMenu job={job} actionId={actionId} onAction={onAction} />
      </CardContent>
    </Card>
  );
}

function JobActionsMenu({
  job,
  actionId,
  onAction,
}: {
  job: AdminJobPosting;
  actionId: string | null;
  onAction: (id: string, fn: () => Promise<unknown>, msg: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionId === job.id}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {job.status === "published" && (
          <DropdownMenuItem asChild>
            <a href={`/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View public listing
            </a>
          </DropdownMenuItem>
        )}
        {["pending_review", "draft"].includes(job.status) && (
          <DropdownMenuItem onClick={() => onAction(job.id, () => adminService.approveJob(job.id), "Approved")}>
            Approve
          </DropdownMenuItem>
        )}
        {job.status === "pending_review" && (
          <DropdownMenuItem onClick={() => onAction(job.id, () => adminService.rejectJob(job.id), "Rejected")}>
            Reject
          </DropdownMenuItem>
        )}
        {job.status === "published" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onAction(job.id, () => adminService.closeJob(job.id), "Closed")}
            >
              Close listing
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminJobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, limit, setPage, setLimit, resetPage } = useAdminPagination();
  const createdByFilter = searchParams.get("createdBy") || "";
  const [jobs, setJobs] = useState<AdminJobPosting[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [search, setSearch] = useState("");
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
      const { jobs: list, meta: m } = await adminService.listJobs({
        status: statusFilter || undefined,
        createdBy: createdByFilter || undefined,
        page,
        limit,
      });
      setJobs(list);
      setMeta(m);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, createdByFilter, page, limit]);

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

  const filtered = search.trim()
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.company?.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : jobs;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Jobs" description="Moderate and manage all job listings" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search title or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={statusFilter || "all"} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending_review">Pending review</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {createdByFilter && (
        <p className="text-sm text-muted-foreground">
          Filtered by employer ·{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => {
              setSearchParams(
                (prev) => {
                  const p = new URLSearchParams(prev);
                  p.delete("createdBy");
                  p.delete("page");
                  return p;
                },
                { replace: true },
              );
            }}
          >
            Clear
          </button>
        </p>
      )}

      {loading ? (
        <AdminTableSkeleton rows={limit} cols={6} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <AdminEmptyState title="No jobs found" description="Try adjusting your filters." />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((job) => (
              <JobMobileCard key={job.id} job={job} actionId={actionId} onAction={run} />
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden shadow-sm md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <p className="font-medium">{job.title}</p>
                        {job.location && (
                          <p className="text-xs text-muted-foreground">{job.location}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {job.company?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <JobTypeBadge type={job.jobType} />
                      </TableCell>
                      <TableCell>
                        <JobStatusBadge status={job.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{job.viewCount}</TableCell>
                      <TableCell>
                        <JobActionsMenu job={job} actionId={actionId} onAction={run} />
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
