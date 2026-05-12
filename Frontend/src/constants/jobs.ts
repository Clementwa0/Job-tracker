/** Job type strings for add/edit job forms (must match stored `jobType` values). */
export const jobTypeOptions = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
] as const;

/** Where the lead came from (stored on `source`). */
export const sourceOptions = [
  "LinkedIn",
  "Company website",
  "Referral",
  "Job board",
  "Recruiter",
  "Other",
] as const;

/** Column headers for the jobs data table (sortable fields only). */
export const joblabel = [
  { label: "Title", field: "title" as const },
  { label: "Company", field: "company" as const },
  { label: "Applied", field: "applicationDate" as const },
  { label: "Status", field: "status" as const },
];
