"use client";

import { Eye, MapPin, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import PostingStatusBadge from "@/features/employer/components/PostingStatusBadge";
import type { EmployerJobPosting } from "@/types/employer";

interface JobDetailsDialogProps {
  job: EmployerJobPosting | null;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/**
 * Read-only detail view for a job posting. Deliberately not an editor —
 * changing posting details goes through the job postings workspace at
 * /employer/dashboard/jobs.
 */
export default function JobDetailsDialog({ job, onOpenChange }: JobDetailsDialogProps) {
  return (
    <Dialog open={!!job} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {job && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wide">
                  Job posting
                </span>
              </div>
              <DialogTitle>{job.title}</DialogTitle>
              <DialogDescription>Posting details (read-only)</DialogDescription>
              <div className="flex flex-wrap items-center gap-2">
                <PostingStatusBadge status={job.status} />
                {job.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                )}
              </div>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              {job.category && (
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{job.category}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Job type</dt>
                <dd className="mt-0.5 font-medium text-foreground">{job.jobType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Work mode</dt>
                <dd className="mt-0.5 font-medium text-foreground">{job.workMode}</dd>
              </div>
              {job.experienceLevel && (
                <div>
                  <dt className="text-muted-foreground">Experience level</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{job.experienceLevel}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Views</dt>
                <dd className="mt-0.5 font-medium text-foreground">{job.viewCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {job.publishedAt ? "Published" : "Created"}
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {formatDate(job.publishedAt ?? job.createdAt)}
                </dd>
              </div>
            </dl>

            {job.tags.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
