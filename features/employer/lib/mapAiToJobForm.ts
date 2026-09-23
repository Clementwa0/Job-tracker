import type { EmployerJobPayload } from "@/types/employer";
import type { JobPostingAiFieldKey, JobPostingAiResult } from "@/types/jobPostingAi";

export function mapAiResultToFormPatch(
  result: JobPostingAiResult,
  selected: Set<JobPostingAiFieldKey>,
): Partial<EmployerJobPayload> {
  const patch: Partial<EmployerJobPayload> = {};

  if (selected.has("companyName") && result.companyName) patch.companyName = result.companyName;
  if (selected.has("title") && result.title) patch.title = result.title;
  if (selected.has("category") && result.category) patch.category = result.category;
  if (selected.has("description") && result.description) patch.description = result.description;
  if (selected.has("responsibilities") && result.responsibilities.length) {
    patch.responsibilities = result.responsibilities.map((item) => `- ${item}`).join("\n");
  }
  if (selected.has("requirements") && result.requirementsText) {
    patch.requirements = result.requirementsText;
  }
  if (selected.has("tags") && result.tags.length) patch.tags = result.tags;
  if (selected.has("jobType") && result.jobType) patch.jobType = result.jobType;
  if (selected.has("workMode") && result.workMode) patch.workMode = result.workMode;
  if (selected.has("experienceLevel") && result.experienceLevel) {
    patch.experienceLevel = result.experienceLevel;
  }
  if (selected.has("educationLevel") && result.educationLevel) {
    patch.educationLevel = result.educationLevel;
  }
  if (selected.has("location") && result.location) patch.location = result.location;
  if (selected.has("salaryMin") && result.salaryMin != null) patch.salaryMin = result.salaryMin;
  if (selected.has("salaryMax") && result.salaryMax != null) patch.salaryMax = result.salaryMax;
  if (selected.has("applicationDeadline") && result.applicationDeadline) {
    patch.applicationDeadline = result.applicationDeadline;
  }
  if (selected.has("application") && result.applicationUrl) {
    patch.applyMethod = { type: result.applicationMethod, value: result.applicationUrl };
  }

  return patch;
}

export const AI_FIELD_LABELS: Record<JobPostingAiFieldKey, string> = {
  companyName: "Company name",
  title: "Job title",
  category: "Category",
  description: "Description",
  responsibilities: "Responsibilities",
  requirements: "Requirements",
  tags: "Skills / tags",
  jobType: "Job type",
  workMode: "Work mode",
  experienceLevel: "Experience level",
  educationLevel: "Education level",
  salaryMin: "Min salary",
  salaryMax: "Max salary",
  location: "Location",
  applicationDeadline: "Application deadline",
  application: "Application method",
};

export const ALL_AI_FIELD_KEYS: JobPostingAiFieldKey[] = [
  "companyName",
  "title",
  "category",
  "description",
  "responsibilities",
  "requirements",
  "tags",
  "jobType",
  "workMode",
  "experienceLevel",
  "educationLevel",
  "location",
  "salaryMin",
  "salaryMax",
  "applicationDeadline",
  "application",
];
