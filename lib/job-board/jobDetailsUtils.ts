import type { PublicJobDetail } from "@/types/jobPosting";

export function formatSalary(job: PublicJobDetail): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.salaryCurrency || "KES";
  const min = job.salaryMin?.toLocaleString();
  const max = job.salaryMax?.toLocaleString();
  if (min && max) return `${currency} ${min} – ${max}`;
  return `${currency} ${min || max}${min ? "+" : ""}`;
}

export function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(target);
  startOfTarget.setHours(0, 0, 0, 0);
  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000);
}

export type Instruction = { label?: string; body: string };

export function parseApplicationInstructions(raw: string): Instruction[] {
  const text = raw.replace(/\r\n?/g, "\n").trim();
  if (!text) return [];

  const chunks = text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z])/))
    .map((chunk) => chunk.replace(/^[\s\-•*]+/, "").replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);

  return chunks.map((chunk) => {
const colon = chunk.match(/^([^:]{2,80}):\s+([\s\S]+)$/);
    if (colon && !/[.!?]$/.test(colon[1].trim())) {
      return { label: colon[1].trim(), body: colon[2].trim() };
    }

    const caps = chunk.match(/^([A-Z][A-Z0-9&'/-]*(?: [A-Z][A-Z0-9&'/-]*)*)\s+([A-Z][\s\S]+)$/);
    if (caps) return { label: caps[1].trim(), body: caps[2].trim() };

    return { body: chunk };
  });
}

export function buildJobDescriptionText(job: PublicJobDetail): string {
  const lines: string[] = [];
  const divider = "—".repeat(48);
  const push = (label: string, value?: string | null) => {
    if (value && value.trim()) lines.push(`${label}: ${value.trim()}`);
  };

  lines.push(job.title, job.company?.name || "Company", divider);
  push("Location", job.location);
  if (job.jobType || job.workMode) {
    lines.push(`Type: ${[job.jobType?.replace("-", " "), job.workMode].filter(Boolean).join(" · ")}`);
  }
  push("Salary", formatSalary(job));
  push("Experience", job.experienceLevel);
  push("Category", job.category);
  push("Posted", formatDate(job.publishedAt));
  push("Application deadline", formatDate(job.applicationDeadline));

  const email = job.applyMethod?.type === "email" && typeof job.applyMethod.value === "string"
    ? job.applyMethod.value.replace(/^mailto:/i, "")
    : null;
  if (email) push("Apply via email", email);
  if (job.company?.website) push("Company website", job.company.website);

  const addSection = (title: string, body?: string | null) => {
    if (!body?.trim()) return;
    lines.push("", divider, title.toUpperCase(), divider, body.trim());
  };

  addSection("About the role", job.description);
  addSection("Responsibilities", job.responsibilities);
  addSection("Qualifications", job.requirements);
  addSection("How to apply", job.applicationInstructions);

  if (job.tags?.length) lines.push("", divider, "SKILLS", divider, job.tags.join(" · "));
  if (job.educationLevel || job.certifications) {
    lines.push("", divider, "EDUCATION & CERTIFICATIONS", divider);
    if (job.educationLevel) lines.push(`Education: ${job.educationLevel}`);
    if (job.certifications) lines.push(`Certifications: ${job.certifications}`);
  }

  if (job.company?.description || job.company?.location || job.company?.industry) {
    lines.push("", divider, `ABOUT ${(job.company?.name || "THE COMPANY").toUpperCase()}`, divider);
    if (job.company?.description) lines.push(job.company.description.trim());
    if (job.company?.location) lines.push(`Headquarters: ${job.company.location}`);
    if (job.company?.industry) lines.push(`Industry: ${job.company.industry}`);
  }

  lines.push("", divider, `Source: JobTrail · /job-board/${job.slug}`);
  return lines.join("\n");
}
