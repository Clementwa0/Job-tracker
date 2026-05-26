import type { BackendJob, Job } from "@/types/job";

/**
 * Normalize backend job → frontend job
 * RULE: frontend always uses FULL ISO string (no truncation)
 */
export function mapBackendJobToFrontend(job: BackendJob): Job {
  return {
  id: job._id,

  jobTitle: job.jobTitle ?? "",
  companyName: job.companyName ?? "",
  companyLogo: job.companyLogo ?? "",
  location: job.location ?? "",
  jobType: job.jobType ?? "",
  salaryRange: job.salaryRange ?? "",

  applicationDate: job.applicationDate
    ? new Date(job.applicationDate).toISOString()
    : "",

  applicationDeadline: job.applicationDeadline
    ? new Date(job.applicationDeadline).toISOString()
    : "",

  applicationStatus: (job.applicationStatus ?? "applied").toLowerCase(),

  resumeFile: job.resumeFile ?? null,

  contactEmail: job.contactEmail ?? "",
  contactPhone: job.contactPhone ?? "",
  jobPostingUrl: job.jobPostingUrl ?? "",

  notes: job.notes ?? "",
  contactPerson: job.contactPerson ?? "",
  source: job.source ?? "",

  interviews: job.interviews ?? [],
  workMode: "",
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: "",
  priority: "low",
  tags: [],
  coverLetterFile: null,
  attachments: [],
  recruiterLinkedIn: "",
  jobDescription: "",
  matchScore: null,
  matchAnalysis: null,
  activity: [],
  reminders: [],
  isArchived: false,
};
}

/**
 * Validate date range before sending to backend
 */
function validateDateRange(start?: string, end?: string) {
  if (!start || !end) return;

  const from = new Date(start);
  const to = new Date(end);

  if (to < from) {
    throw new Error("Application deadline cannot be earlier than application date");
  }
}

/**
 * Frontend job → backend payload
 * RULE: ALWAYS send ISO strings
 */
export function mapFrontendJobToBackend(
  job: Omit<Job, "id"> | Partial<Job>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (job.jobTitle !== undefined) payload.jobTitle = job.jobTitle;
  if (job.companyName !== undefined) payload.companyName = job.companyName;
  if (job.location !== undefined) payload.location = job.location;
  if (job.jobType !== undefined) payload.jobType = job.jobType;
  if (job.salaryRange !== undefined) payload.salaryRange = job.salaryRange;

  // 🔥 SAFE DATE HANDLING (CRITICAL FIX)
  if (job.applicationDate) {
    payload.applicationDate = new Date(job.applicationDate).toISOString();
  }

  if (job.applicationDeadline) {
    payload.applicationDeadline = new Date(job.applicationDeadline).toISOString();
  }

  // 🔒 VALIDATION GUARD (prevents backend 500)
  validateDateRange(
    job.applicationDate,
    job.applicationDeadline
  );

  if (job.applicationStatus !== undefined) {
    payload.applicationStatus = job.applicationStatus.toLowerCase();
  }
  if (job.resumeFile !== undefined)
    payload.resumeFile = job.resumeFile;

  if (job.contactPerson !== undefined)
    payload.contactPerson = job.contactPerson;

  if (job.contactEmail !== undefined)
    payload.contactEmail = job.contactEmail;

  if (job.contactPhone !== undefined)
    payload.contactPhone = job.contactPhone;

  if (job.jobPostingUrl !== undefined)
    payload.jobPostingUrl = job.jobPostingUrl;

  if (job.notes !== undefined)
    payload.notes = job.notes;

  if (job.source !== undefined)
    payload.source = job.source;



  if (job.interviews !== undefined)
    payload.interviews = job.interviews;

  return payload;
}