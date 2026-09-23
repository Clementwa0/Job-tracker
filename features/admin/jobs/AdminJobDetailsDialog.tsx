"use client";

import { Eye, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { JobStatusBadge, JobTypeBadge } from "@/features/admin/components/JobBadges";
import type { AdminJobPosting } from "@/types/admin";

interface AdminJobDetailsDialogProps {
  job: AdminJobPosting | null;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function AdminJobDetailsDialog({ job, onOpenChange }: AdminJobDetailsDialogProps) {
  return (
    <Dialog open={!!job} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {job && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wide">Job posting</span>
              </div>
              <DialogTitle>{job.title}</DialogTitle>
              <DialogDescription>{job.company?.name ?? "Unknown company"}</DialogDescription>
              <div className="flex flex-wrap items-center gap-2">
                <JobStatusBadge status={job.status} />
                {job.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                )}
              </div>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <div>
                <dt className="text-muted-foreground">Job type</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  <JobTypeBadge type={job.jobType} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Work mode</dt>
                <dd className="mt-0.5 font-medium text-foreground">{job.workMode ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Views</dt>
                <dd className="mt-0.5 font-medium text-foreground">{job.viewCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{job.publishedAt ? "Published" : "Created"}</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {formatDate(job.publishedAt ?? job.createdAt)}
                </dd>
              </div>
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
