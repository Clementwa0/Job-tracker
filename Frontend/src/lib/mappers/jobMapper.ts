import type { BackendJob, Job, JobAttachment, JobActivity, JobReminder } from "@/types/job";

function toIso(value?: string | Date | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/**
 * Normalize backend job → frontend job (no field loss)
 */
export function mapBackendJobToFrontend(job: BackendJob): Job {
  return {
    id: job._id,
    jobTitle: job.jobTitle ?? "",
    companyName: job.companyName ?? "",
    companyLogo: job.companyLogo ?? "",
    location: job.location ?? "",
    jobType: job.jobType ?? "",
    workMode: job.workMode ?? "",
    salaryRange: job.salaryRange ?? "",
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    salaryCurrency: job.salaryCurrency ?? "USD",
    applicationDate: toIso(job.applicationDate),
    applicationDeadline: toIso(job.applicationDeadline),
    applicationStatus: (job.applicationStatus ?? "applied").toLowerCase(),
    priority: job.priority ?? "medium",
    tags: job.tags ?? [],
    resumeFile: job.resumeFile ?? null,
    coverLetterFile: job.coverLetterFile ?? null,
    attachments: (job.attachments ?? []) as JobAttachment[],
    contactEmail: job.contactEmail ?? "",
    contactPhone: job.contactPhone ?? "",
    contactPerson: job.contactPerson ?? "",
    recruiterLinkedIn: job.recruiterLinkedIn ?? "",
    jobPostingUrl: job.jobPostingUrl ?? "",
    jobDescription: job.jobDescription ?? "",
    matchScore: job.matchScore ?? null,
    matchAnalysis: job.matchAnalysis ?? null,
    notes: job.notes ?? "",
    source: job.source ?? "",
    activity: (job.activity ?? []) as JobActivity[],
    reminders: (job.reminders ?? []).map((r) => ({
      ...r,
      dueAt: r.dueAt ? toIso(r.dueAt) : "",
    })) as JobReminder[],
    isArchived: job.isArchived ?? false,
    interviews: job.interviews ?? [],
    jobPostingId: job.jobPostingId ? String(job.jobPostingId) : undefined,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

function validateDateRange(start?: string, end?: string) {
  if (!start || !end) return;
  const from = new Date(start);
  const to = new Date(end);
  if (to < from) {
    throw new Error("Application deadline cannot be earlier than application date");
  }
}

/**
 * Frontend job → backend payload (full field coverage)
 */
export function mapFrontendJobToBackend(
  job: Omit<Job, "id"> | Partial<Job>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const stringFields = [
    "jobTitle", "companyName", "companyLogo", "location", "jobType", "workMode",
    "source", "salaryRange", "salaryCurrency",
    "contactPerson", "contactEmail", "contactPhone", "recruiterLinkedIn",
    "jobPostingUrl", "jobDescription", "notes",
  ] as const;

  for (const key of stringFields) {
    if (job[key] !== undefined) payload[key] = job[key];
  }

  if (job.applicationDate) {
    payload.applicationDate = new Date(job.applicationDate).toISOString();
  }
  if (job.applicationDeadline) {
    payload.applicationDeadline = new Date(job.applicationDeadline).toISOString();
  }

  validateDateRange(job.applicationDate, job.applicationDeadline);

  if (job.applicationStatus !== undefined) {
    payload.applicationStatus = job.applicationStatus.toLowerCase();
  }
  if (job.priority !== undefined) payload.priority = job.priority;
  if (job.tags !== undefined) payload.tags = job.tags;
  if (job.salaryMin !== undefined) payload.salaryMin = job.salaryMin;
  if (job.salaryMax !== undefined) payload.salaryMax = job.salaryMax;
  if (job.isArchived !== undefined) payload.isArchived = job.isArchived;

  if (job.resumeFile !== undefined && typeof job.resumeFile === "string") {
    payload.resumeFile = job.resumeFile;
  }
  if (job.coverLetterFile !== undefined && typeof job.coverLetterFile === "string") {
    payload.coverLetterFile = job.coverLetterFile;
  }
  if (job.attachments !== undefined) payload.attachments = job.attachments;

  if (job.matchScore !== undefined) payload.matchScore = job.matchScore;
  if (job.matchAnalysis !== undefined) payload.matchAnalysis = job.matchAnalysis;
  if (job.reminders !== undefined) payload.reminders = job.reminders;
  if (job.activity !== undefined) payload.activity = job.activity;
  if (job.interviews !== undefined) payload.interviews = job.interviews;
  if (job.jobPostingId !== undefined) payload.jobPostingId = job.jobPostingId;

  return payload;
}
