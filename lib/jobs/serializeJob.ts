import type {
  JobActivityRow,
  JobAttachmentRow,
  JobReminderRow,
  JobRow,
} from "@/lib/db/schema";

/** A `jobs` row together with its child rows (already in display order). */
export type JobWithChildren = JobRow & {
  attachments: JobAttachmentRow[];
  activity: JobActivityRow[];
  reminders: JobReminderRow[];
};

const iso = (date: Date | null | undefined): string | undefined =>
  date ? date.toISOString() : undefined;

/**
 * Converts a job (plus children) into the plain JSON shape the frontend's
 * `BackendJob` type / `mapBackendJobToFrontend` expects. Ids are exposed as
 * `_id` (and `id`) to keep the API contract the UI was built against.
 *
 * This is an explicit field list on purpose: when you add a column to the
 * `jobs` table, add it here too.
 */
export function serializeJob(job: JobWithChildren): Record<string, unknown> {
  return {
    _id: job.id,
    id: job.id,
    userId: job.userId,
    jobTitle: job.jobTitle,
    companyName: job.companyName,
    companyLogo: job.companyLogo,
    location: job.location,
    jobType: job.jobType,
    workMode: job.workMode,
    applicationDate: iso(job.applicationDate),
    applicationDeadline: iso(job.applicationDeadline),
    source: job.source,
    applicationStatus: job.applicationStatus,
    priority: job.priority,
    tags: job.tags,
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    salaryCurrency: job.salaryCurrency,
    salaryRange: job.salaryRange,
    contactPerson: job.contactPerson,
    contactEmail: job.contactEmail,
    contactPhone: job.contactPhone,
    recruiterLinkedIn: job.recruiterLinkedIn,
    resumeFile: job.resumeFile,
    coverLetterFile: job.coverLetterFile,
    attachments: job.attachments.map((a) => ({
      _id: a.id,
      name: a.name,
      url: a.url,
      type: a.type ?? undefined,
      size: a.size ?? undefined,
      uploadedAt: iso(a.uploadedAt),
    })),
    jobPostingUrl: job.jobPostingUrl,
    jobDescription: job.jobDescription,
    matchScore: job.matchScore ?? undefined,
    matchAnalysis: job.matchAnalysis ?? undefined,
    notes: job.notes,
    activity: job.activity.map((a) => ({
      _id: a.id,
      type: a.type,
      message: a.message,
      meta: a.meta ?? undefined,
      createdAt: iso(a.createdAt),
    })),
    reminders: job.reminders.map((r) => ({
      _id: r.id,
      title: r.title,
      dueAt: iso(r.dueAt),
      done: r.done,
    })),
    isArchived: job.isArchived,
    respondedAt: iso(job.respondedAt),
    offerAt: iso(job.offerAt),
    jobPostingId: job.jobPostingId ?? undefined,
    createdAt: iso(job.createdAt),
    updatedAt: iso(job.updatedAt),
  };
}
