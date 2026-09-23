/** Allowed values for the job-search preference fields (shared by API + UI). */
export const JOB_TYPE_OPTIONS = ["full-time", "part-time", "contract", "internship"] as const;
export const WORK_MODE_OPTIONS = ["remote", "hybrid", "onsite"] as const;

export type JobTypeOption = (typeof JOB_TYPE_OPTIONS)[number];
export type WorkModeOption = (typeof WORK_MODE_OPTIONS)[number];

export function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join("-");
}
