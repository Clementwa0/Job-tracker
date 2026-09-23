/**
 * Shared option lists for job-posting fields. Single source of truth for
 * both the employer job-posting form and the public job board filters, so
 * a value posted by an employer always has a matching label/filter on the
 * discovery side.
 */

export const JOB_CATEGORIES = [
  "Software Development",
  "Engineering",
  "Product",
  "Design",
  "Data & Analytics",
  "Marketing",
  "Sales",
  "Customer Support",
  "Operations",
  "Finance & Accounting",
  "Human Resources",
  "Legal",
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

export const JOB_TYPES: [string, string][] = [
  ["full-time", "Full-time"],
  ["part-time", "Part-time"],
  ["contract", "Contract"],
  ["internship", "Internship"],
];

export const WORK_MODES: [string, string][] = [
  ["onsite", "On-site"],
  ["remote", "Remote"],
  ["hybrid", "Hybrid"],
];
