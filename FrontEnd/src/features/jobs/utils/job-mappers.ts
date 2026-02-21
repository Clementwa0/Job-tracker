import type { BackendJob, Job } from "@/types";

export function mapBackendJobToJob(backend: BackendJob): Job {
  return {
    id: backend._id,
    title: backend.jobTitle ?? "",
    company: backend.companyName ?? "",
    location: backend.location ?? "",
    jobType: backend.jobType ?? "",
    salaryRange: backend.salaryRange ?? "",
    applicationDate: backend.applicationDate
      ? new Date(backend.applicationDate).toISOString().split("T")[0] ?? ""
      : "",
    applicationDeadline: backend.applicationDeadline
      ? new Date(backend.applicationDeadline).toISOString().split("T")[0] ?? ""
      : "",
    status: (backend.applicationStatus ?? "applied").toLowerCase(),
    resumeFile: backend.resumeFile ?? null,
    interviews: backend.interviews ?? [],
    contactEmail: backend.contactEmail ?? "",
    contactPhone: backend.contactPhone ?? "",
    jobPostingUrl: backend.jobPostingUrl ?? "",
    notes: backend.notes ?? "",
    contactPerson: backend.contactPerson ?? "",
    source: backend.source ?? "",
  };
}

export function mapJobToBackendPayload(job: Partial<Job>): Record<string, unknown> {
  return {
    jobTitle: job.title,
    companyName: job.company,
    location: job.location,
    jobType: job.jobType,
    applicationDate: job.applicationDate,
    applicationDeadline: job.applicationDeadline,
    applicationStatus: job.status,
    salaryRange: job.salaryRange,
    resumeFile: job.resumeFile,
    source: job.source,
    contactPerson: job.contactPerson,
    contactEmail: job.contactEmail,
    contactPhone: job.contactPhone,
    jobPostingUrl: job.jobPostingUrl,
    notes: job.notes,
    interviews: job.interviews,
  };
}
