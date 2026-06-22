import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Loader2, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PostingStatusBadge from "@/features/employer/PostingStatusBadge";
import { employerService } from "@/services/employerService";
import type { EmployerJobPosting, PostingStatus } from "@/types/employer";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { label: string; value: PostingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Pending", value: "pending_review" },
  { label: "Closed", value: "closed" },
];

export default function EmployerJobsList() {
  const [jobs, setJobs] = useState<EmployerJobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PostingStatus | "all">("all");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params: { limit: number; status?: string } = { limit: 50 };
      if (statusFilter !== "all") params.status = statusFilter;
      const { jobs: list } = await employerService.listJobs(params);
      setJobs(list);
    } catch (err) {
      toast.error("Failed to load jobs", { description: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (id: string, action: () => Promise<unknown>, successMsg: string) => {
    try {
      setActionId(id);
      await action();
      toast.success(successMsg);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job postings</h1>
          <p className="text-muted-foreground">Manage listings on the public job board</p>
        </div>
        <Button asChild>
          <Link to="/employer/jobs/create">
            <Plus className="mr-2 h-4 w-4" />
            Create job
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              statusFilter === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No job postings yet.</p>
          <Button asChild className="mt-4">
            <Link to="/employer/jobs/create">Create your first job</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Deadline</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Views</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      to={`/employer/jobs/edit/${job.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground sm:hidden">
                      <PostingStatusBadge status={job.status} />
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <PostingStatusBadge status={job.status} />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {job.applicationDeadline
                      ? new Date(job.applicationDeadline).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{job.viewCount}</td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={actionId === job.id}>
                          {actionId === job.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/employer/jobs/edit/${job.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        {(job.status === "published" || job.status === "closed") && (
                          <DropdownMenuItem asChild>
                            <a href={`/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View public page
                            </a>
                          </DropdownMenuItem>
                        )}
                        {(job.status === "draft" || job.status === "closed") && (
                          <DropdownMenuItem
                            onClick={() =>
                              runAction(job.id, () => employerService.publishJob(job.id), "Job published")
                            }
                          >
                            Publish
                          </DropdownMenuItem>
                        )}
                        {(job.status === "published" || job.status === "pending_review") && (
                          <DropdownMenuItem
                            onClick={() =>
                              runAction(job.id, () => employerService.unpublishJob(job.id), "Job unpublished")
                            }
                          >
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        {job.status === "published" && (
                          <DropdownMenuItem
                            onClick={() =>
                              runAction(job.id, () => employerService.closeJob(job.id), "Job closed")
                            }
                          >
                            Close listing
                          </DropdownMenuItem>
                        )}
                        {job.status === "draft" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                runAction(job.id, () => employerService.deleteJob(job.id), "Job deleted")
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete draft
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
