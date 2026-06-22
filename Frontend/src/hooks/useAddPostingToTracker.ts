import { useCallback, useState } from "react";
import { jobService } from "@/services/jobService";
import type { JobPayload } from "@/types/job";
import type { PublicJobDetail } from "@/types/jobPosting";
import { getApiErrorMessage } from "@/lib/apiError";

const JOB_TYPE_MAP: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

function salaryRangeLabel(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string,
): string {
  if (min != null && max != null) return `${currency} ${min} – ${max}`;
  if (min != null) return `${currency} ${min}+`;
  if (max != null) return `Up to ${currency} ${max}`;
  return "";
}

export function buildTrackerPayloadFromPosting(job: PublicJobDetail): JobPayload {
  const currency = job.salaryCurrency || "USD";
  return {
    jobTitle: job.title,
    companyName: job.company?.name || "",
    companyLogo: job.company?.logo || "",
    location: job.location || "",
    jobType: JOB_TYPE_MAP[job.jobType] || job.jobType,
    workMode: job.workMode,
    applicationDate: new Date().toISOString(),
    applicationDeadline: job.applicationDeadline || "",
    applicationStatus: "applied",
    source: "manual",
    jobPostingId: job.id,
    jobPostingUrl: `/jobs/${job.slug}`,
    jobDescription: job.description,
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    salaryCurrency: currency,
    salaryRange: salaryRangeLabel(job.salaryMin, job.salaryMax, currency),
    tags: job.tags ?? [],
    priority: "low",
    resumeFile: null,
    coverLetterFile: null,
    attachments: [],
    contactEmail: "",
    contactPhone: "",
    contactPerson: "",
    recruiterLinkedIn: "",
    matchScore: null,
    matchAnalysis: null,
    notes: "",
    reminders: [],
    isArchived: false,
  };
}

export function useAddPostingToTracker() {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToTracker = useCallback(async (job: PublicJobDetail) => {
    try {
      setIsAdding(true);
      setError(null);
      const created = await jobService.createJob(buildTrackerPayloadFromPosting(job));
      return created;
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setIsAdding(false);
    }
  }, []);

  return { addToTracker, isAdding, error };
}
