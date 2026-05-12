import type { Job } from "@/types";

export function getResumeUrl(job: Job) {
  if (!job.resumeFile) return null;

  const baseUrl = import.meta.env.VITE_API_DB_URL || "";
  return `${baseUrl}${job.resumeFile}`;
}