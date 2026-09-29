export const JOB_CATEGORIES = [
  "Software Development",
  "IT & Support",
  "Cybersecurity",
  "Networking",
  "ICT/Telecommunications",
  "Data & Analytics",
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Customer Support",
  "Operations",
  "Finance & Accounting",
  "Human Resources",
  "Legal",
  "Healthcare & Medical",
  "Pharmaceutical",
  "Education",
  "Construction",
  "Manufacturing",
  "Hospitality & Tourism",
  "Logistics & Supply Chain",
  "Procurement",
  "Agriculture",
  "Media & Communications",
  "Research",
  "Other",
] as const;
export const EXPERIENCE_LEVELS = [
  "Entry-level",
  "Mid-level",
  "Senior",
  "Lead / Principal",
  "Executive",
] as const;

export const EDUCATION_LEVELS = [
  "Not required",
  "High school",
  "Associate degree",
  "Bachelor's degree",
  "Master's degree",
  "Doctorate",
] as const;

export const JOB_TYPES = [
  ["full-time", "Full-time"],
  ["part-time", "Part-time"],
  ["contract", "Contract"],
  ["internship", "Internship"],
] as const;

export const WORK_MODES = [
  ["onsite", "On-site"],
  ["remote", "Remote"],
  ["hybrid", "Hybrid"],
] as const;

/**
 * Derived union types.
 *
 * These can be reused throughout the application so that
 * forms, APIs, filters, and database-facing code stay type-safe.
 */

export type JobCategory = (typeof JOB_CATEGORIES)[number];

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export type JobType = (typeof JOB_TYPES)[number][0];

export type WorkMode = (typeof WORK_MODES)[number][0];