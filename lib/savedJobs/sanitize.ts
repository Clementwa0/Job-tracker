/** Validation for saving a job-board posting. Pure. */

export class SavedJobInputError extends Error {}

export interface SavedJobInput {
  slug: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
}

/** The public slugs the job board routes by: lowercase words joined by hyphens. */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_SLUG_LENGTH = 200;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function isValidSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= MAX_SLUG_LENGTH && SLUG_RE.test(value);
}

function required(body: Record<string, unknown>, key: string, max: number): string {
  const v = body[key];
  const t = typeof v === "string" ? v.trim() : "";
  if (!t) throw new SavedJobInputError(`"${key}" is required.`);
  if (t.length > max) throw new SavedJobInputError(`"${key}" is too long.`);
  return t;
}

function optional(body: Record<string, unknown>, key: string, max: number): string | null {
  const v = body[key];
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") throw new SavedJobInputError(`"${key}" must be text.`);
  const t = v.trim();
  if (t.length > max) throw new SavedJobInputError(`"${key}" is too long.`);
  return t || null;
}

export function sanitizeSavedJobInput(body: unknown): SavedJobInput {
  if (!isRecord(body)) throw new SavedJobInputError("Invalid request body.");

  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!isValidSlug(slug)) throw new SavedJobInputError('"slug" is not a valid job slug.');

  return {
    slug,
    title: required(body, "title", 300),
    company: required(body, "company", 300),
    location: optional(body, "location", 200),
    salary: optional(body, "salary", 200),
  };
}

export type SavedJobUpdate = Partial<Pick<SavedJobInput, "title" | "company" | "location" | "salary">>;

/** Validates a partial update of a saved job's snapshot fields (the slug is its identity and can't change). */
export function sanitizeSavedJobUpdate(body: unknown): SavedJobUpdate {
  if (!isRecord(body)) throw new SavedJobInputError("Invalid request body.");

  const out: SavedJobUpdate = {};
  if (body.title !== undefined) out.title = required(body, "title", 300);
  if (body.company !== undefined) out.company = required(body, "company", 300);
  if (body.location !== undefined) out.location = optional(body, "location", 200);
  if (body.salary !== undefined) out.salary = optional(body, "salary", 200);

  if (Object.keys(out).length === 0) throw new SavedJobInputError("Nothing to update.");
  return out;
}
