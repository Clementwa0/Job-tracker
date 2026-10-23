import { z } from "zod";

import { JOB_TYPES, WORK_MODES } from "@/lib/jobPostings/options";
import type { EmployerJobPayload } from "@/types/employer";

/**
 * One place for every rule about what an employer may store on a posting or
 * company. Routes call the `parse*` functions; the lifecycle code calls
 * `checkPublishReady` before a posting can go live.
 */

export const POSTING_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  descriptionMin: 50,
  descriptionMax: 20_000,
  sectionMax: 10_000,
  shortMax: 200,
  locationMax: 120,
  tagsMax: 15,
  tagMax: 40,
  salaryMax: 1_000_000_000,
} as const;

export const COMPANY_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  descriptionMax: 2_000,
  locationMax: 120,
  industryMax: 80,
  websiteMax: 2_048,
} as const;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string; fields: Record<string, string> };

const JOB_TYPE_VALUES = JOB_TYPES.map(([value]) => value) as [string, ...string[]];
const WORK_MODE_VALUES = WORK_MODES.map(([value]) => value) as [string, ...string[]];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts only http(s) URLs; returns the normalised href or null. */
export function normalizeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function applyMethodProblem(type: string, value: string): string | null {
  if (type === "external_link") {
    if (value.length > 2_048) return "The application URL is too long.";
    return normalizeHttpUrl(value) && /^https?:\/\//i.test(value)
      ? null
      : "Enter a full application URL starting with http:// or https://.";
  }
  if (type === "email") {
    return value.length <= 254 && EMAIL_RE.test(value) ? null : "Enter a valid application email address.";
  }
  if (type === "whatsapp") {
    const digits = value.replace(/[\s()+-]/g, "");
    return /^\d{7,15}$/.test(digits) ? null : "Enter a valid WhatsApp number with country code.";
  }
  return "Choose a valid application method.";
}

const optionalText = (max: number, label: string) =>
  z.string({ invalid_type_error: `${label} must be text.` }).trim().max(max, `${label} must be ${max} characters or fewer.`);

const salary = (label: string) =>
  z
    .number({ invalid_type_error: `${label} must be a number.` })
    .int(`${label} must be a whole number.`)
    .min(0, `${label} can't be negative.`)
    .max(POSTING_LIMITS.salaryMax, `${label} is too large.`)
    .nullable();

const applyMethodSchema = z
  .object({
    type: z.enum(["external_link", "email", "whatsapp"], {
      errorMap: () => ({ message: "Choose a valid application method." }),
    }),
    value: z.string({ invalid_type_error: "Application details must be text." }).trim().min(1, "Application details are required."),
  })
  .superRefine((method, ctx) => {
    const problem = applyMethodProblem(method.type, method.value);
    if (problem) ctx.addIssue({ code: "custom", path: ["value"], message: problem });
  });

const deadlineSchema = z
  .union([z.string().trim(), z.null()])
  .refine((value) => value === null || value === "" || !Number.isNaN(Date.parse(value)), "Application deadline isn't a valid date.");

const postingShape = {
  // Accepted for backwards compatibility but ignored: the public company name
  // always comes from the employer's company profile (see createEmployerPosting).
  companyName: z.string().max(POSTING_LIMITS.shortMax).optional(),
  title: optionalText(POSTING_LIMITS.titleMax, "Job title").min(POSTING_LIMITS.titleMin, `Job title must be at least ${POSTING_LIMITS.titleMin} characters.`),
  category: optionalText(POSTING_LIMITS.shortMax, "Category"),
  description: optionalText(POSTING_LIMITS.descriptionMax, "Description"),
  responsibilities: optionalText(POSTING_LIMITS.sectionMax, "Responsibilities"),
  requirements: optionalText(POSTING_LIMITS.sectionMax, "Qualifications"),
  location: optionalText(POSTING_LIMITS.locationMax, "Location"),
  salaryMin: salary("Minimum salary").optional(),
  salaryMax: salary("Maximum salary").optional(),
  salaryCurrency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter code such as KES."),
  jobType: z.enum(JOB_TYPE_VALUES, { errorMap: () => ({ message: "Choose a valid job type." }) }),
  workMode: z.enum(WORK_MODE_VALUES, { errorMap: () => ({ message: "Choose a valid work mode." }) }),
  experienceLevel: optionalText(POSTING_LIMITS.shortMax, "Experience level"),
  educationLevel: optionalText(POSTING_LIMITS.shortMax, "Education level"),
  certifications: optionalText(POSTING_LIMITS.sectionMax, "Certifications"),
  tags: z
    .array(z.string({ invalid_type_error: "Skills must be text." }).trim().max(POSTING_LIMITS.tagMax, `Each skill must be ${POSTING_LIMITS.tagMax} characters or fewer.`))
    .max(POSTING_LIMITS.tagsMax * 2, `Add at most ${POSTING_LIMITS.tagsMax} skills.`),
  applyMethod: applyMethodSchema,
  applicationDeadline: deadlineSchema.optional(),
};

// Create needs only what a draft is useful with: title, location and how to
// apply. Everything else is optional, and the type/mode/currency/tags default.
const createSchema = z
  .object(postingShape)
  .partial()
  .extend({
    title: postingShape.title,
    location: postingShape.location.min(1, "Location is required."),
    applyMethod: postingShape.applyMethod,
    description: postingShape.description.default(""),
    salaryCurrency: postingShape.salaryCurrency.default("KES"),
    jobType: postingShape.jobType.default("full-time"),
    workMode: postingShape.workMode.default("onsite"),
    tags: postingShape.tags.default([]),
  });

const updateSchema = z.object(postingShape).partial();

function failure(error: z.ZodError): ValidationResult<never> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "body";
    if (!fields[key]) fields[key] = issue.message;
  }
  const messages = Object.values(fields);
  return { ok: false, message: messages.slice(0, 3).join(" "), fields };
}

function tidy<T extends Partial<EmployerJobPayload>>(value: T): T {
  const next = { ...value };
  if (next.tags) {
    const seen = new Set<string>();
    next.tags = next.tags
      .filter((tag) => {
        const key = tag.toLowerCase();
        if (!tag || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, POSTING_LIMITS.tagsMax);
  }
  if (next.applicationDeadline === "") next.applicationDeadline = null;
  if (next.applyMethod?.type === "external_link") {
    next.applyMethod = { type: "external_link", value: next.applyMethod.value.trim() };
  }
  return next;
}

function salaryProblem(min?: number | null, max?: number | null) {
  return min != null && max != null && min > max ? "Minimum salary can't be higher than the maximum." : null;
}

export function parseNewPosting(body: unknown): ValidationResult<EmployerJobPayload> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Send the posting details as a JSON object.", fields: {} };
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return failure(parsed.error);
  const value = tidy(parsed.data) as EmployerJobPayload;
  const problem = salaryProblem(value.salaryMin, value.salaryMax);
  if (problem) return { ok: false, message: problem, fields: { salaryMin: problem } };
  return { ok: true, value };
}

export function parsePostingUpdate(body: unknown): ValidationResult<Partial<EmployerJobPayload>> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Send the posting changes as a JSON object.", fields: {} };
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return failure(parsed.error);
  const value = tidy(parsed.data) as Partial<EmployerJobPayload>;
  const problem = salaryProblem(value.salaryMin, value.salaryMax);
  if (problem) return { ok: false, message: problem, fields: { salaryMin: problem } };
  return { ok: true, value };
}

export { salaryProblem };

/** Fields of a stored posting that `checkPublishReady` inspects. */
export interface PublishCandidate {
  title: string;
  description: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  applyMethodType: string;
  applyMethodValue: string;
  applicationDeadline: Date | null;
}

/** Everything that must be true before a posting is shown to candidates. */
export function checkPublishReady(posting: PublishCandidate, now = new Date()): string[] {
  const problems: string[] = [];
  if (posting.title.trim().length < POSTING_LIMITS.titleMin) problems.push("Add a job title.");
  if (posting.description.trim().length < POSTING_LIMITS.descriptionMin) {
    problems.push(`Write a description of at least ${POSTING_LIMITS.descriptionMin} characters.`);
  }
  if (!posting.location.trim()) problems.push("Add a location.");
  const applyProblem = applyMethodProblem(posting.applyMethodType, posting.applyMethodValue.trim());
  if (applyProblem) problems.push(applyProblem);
  const salary = salaryProblem(posting.salaryMin, posting.salaryMax);
  if (salary) problems.push(salary);
  if (posting.applicationDeadline && posting.applicationDeadline.getTime() <= now.getTime()) {
    problems.push("The application deadline has already passed - set a future date or clear it.");
  }
  return problems;
}

/* ------------------------------------------------------------------ */
/* Company profile                                                     */
/* ------------------------------------------------------------------ */

export interface CompanyInput {
  name: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
}

const companySchema = z.object({
  name: optionalText(COMPANY_LIMITS.nameMax, "Company name").min(COMPANY_LIMITS.nameMin, `Company name must be at least ${COMPANY_LIMITS.nameMin} characters.`),
  description: optionalText(COMPANY_LIMITS.descriptionMax, "About"),
  website: optionalText(COMPANY_LIMITS.websiteMax, "Website"),
  location: optionalText(COMPANY_LIMITS.locationMax, "Location"),
  industry: optionalText(COMPANY_LIMITS.industryMax, "Industry"),
});

/**
 * Only keys present in the body are returned, so a PUT that omits a field
 * leaves it untouched instead of blanking it.
 */
export function parseCompany(body: unknown): ValidationResult<CompanyInput> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Send the company details as a JSON object.", fields: {} };
  }
  const parsed = companySchema.partial({ description: true, website: true, location: true, industry: true }).safeParse(body);
  if (!parsed.success) return failure(parsed.error);
  const value: CompanyInput = { ...parsed.data };
  if (value.website) {
    const href = normalizeHttpUrl(value.website);
    if (!href) {
      const message = "Enter a valid website address, for example https://example.com.";
      return { ok: false, message, fields: { website: message } };
    }
    value.website = href.replace(/\/$/, "");
  }
  return { ok: true, value };
}
