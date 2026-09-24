"use client";

import { BriefcaseBusiness, CircleDollarSign, Eye, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { JOB_TYPES, WORK_MODES } from "@/lib/jobPostings/options";
import type { EmployerJobPayload } from "@/types/employer";

interface JobPostingPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: EmployerJobPayload;
}

function label(list: [string, string][], v: string) {
  return list.find(([value]) => value === v)?.[1] ?? v;
}

function formatSalary(value: EmployerJobPayload) {
  const currency = value.salaryCurrency || "KES";
  if (value.salaryMin && value.salaryMax) {
    return `${currency} ${value.salaryMin.toLocaleString()} – ${value.salaryMax.toLocaleString()}`;
  }
  if (value.salaryMin) return `${currency} ${value.salaryMin.toLocaleString()}+`;
  if (value.salaryMax) return `Up to ${currency} ${value.salaryMax.toLocaleString()}`;
  return null;
}

/**
 * Renders the in-memory draft exactly as job seekers will see it on the
 * public job board, without requiring a save first.
 */
export default function JobPostingPreviewDialog({
  open,
  onOpenChange,
  value,
}: JobPostingPreviewDialogProps) {
  const salary = formatSalary(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium uppercase tracking-wide">Preview - not yet published</span>
          </div>
          <p className="text-sm font-medium text-primary">{value.companyName || "Your company"}</p>
          <DialogTitle className="text-2xl">{value.title || "Untitled role"}</DialogTitle>
          <DialogDescription className="sr-only">Preview of this job posting</DialogDescription>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {value.location || "Location not set"}
            </span>
            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness className="h-4 w-4" />
              {label(JOB_TYPES, value.jobType)} · {label(WORK_MODES, value.workMode)}
            </span>
            {salary && (
              <span className="flex items-center gap-1.5">
                <CircleDollarSign className="h-4 w-4" />
                {salary}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {value.category && <Badge variant="secondary">{value.category}</Badge>}
            {value.experienceLevel && <Badge variant="secondary">{value.experienceLevel}</Badge>}
            {value.educationLevel && <Badge variant="secondary">{value.educationLevel}</Badge>}
          </div>
        </DialogHeader>

        <div className="space-y-6 text-sm leading-6">
          <PreviewSection title="About the role" text={value.description} />
          <PreviewSection title="Responsibilities" text={value.responsibilities} />
          <PreviewSection title="Qualifications" text={value.requirements} />
          {value.tags && value.tags.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {value.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          {value.certifications && <PreviewSection title="Certifications" text={value.certifications} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewSection({ title, text }: { title: string; text?: string }) {
  if (!text?.trim()) return null;
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-foreground">{title}</h4>
      <p className="whitespace-pre-wrap text-muted-foreground">{text}</p>
    </div>
  );
}
