import type { BackendJob, JobCardProps } from "@/types";

export function mapJob(raw: BackendJob): JobCardProps {
  return {
    id: raw._id,
    title: raw.jobTitle ?? "",
    company: raw.companyName ?? "",
    location: raw.location ?? "",
    jobType: raw.jobType ?? "",
    salaryRange: raw.salaryRange ?? "",
    applicationDate: raw.applicationDate ?? "",
    applicationDeadline: raw.applicationDeadline ?? "",
    resumeFile: raw.resumeFile ?? null,
    status: raw.applicationStatus ?? "",
  };
}
