import type { EmployerJobPayload } from "@/types/employer";
import type { JobPostingAiFieldKey, JobPostingAiResult } from "@/types/jobPostingAi";

export function mapAiResultToFormPatch(
  result: JobPostingAiResult,
  selected: Set<JobPostingAiFieldKey>,
): Partial<EmployerJobPayload> {
  const patch: Partial<EmployerJobPayload> = {};

  if (selected.has("title") && result.title) patch.title = result.title;
  if (selected.has("description") && result.description) patch.description = result.description;
  if (selected.has("requirements") && result.requirementsText) {
    patch.requirements = result.requirementsText;
  }
  if (selected.has("tags") && result.tags.length) patch.tags = result.tags;
  if (selected.has("jobType") && result.jobType) patch.jobType = result.jobType;
  if (selected.has("workMode") && result.workMode) patch.workMode = result.workMode;
  if (selected.has("location") && result.location) patch.location = result.location;
  if (selected.has("salaryMin") && result.salaryMin != null) patch.salaryMin = result.salaryMin;
  if (selected.has("salaryMax") && result.salaryMax != null) patch.salaryMax = result.salaryMax;

  return patch;
}

export const AI_FIELD_LABELS: Record<JobPostingAiFieldKey, string> = {
  title: "Job title",
  description: "Description",
  requirements: "Requirements",
  tags: "Skills / tags",
  jobType: "Job type",
  workMode: "Work mode",
  salaryMin: "Min salary",
  salaryMax: "Max salary",
  location: "Location",
};

export const ALL_AI_FIELD_KEYS: JobPostingAiFieldKey[] = [
  "title",
  "description",
  "requirements",
  "tags",
  "jobType",
  "workMode",
  "location",
  "salaryMin",
  "salaryMax",
];
