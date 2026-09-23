/** Validation/normalisation of resume-builder payloads. Pure. */

export class ResumeInputError extends Error {}

export const RESUME_TEMPLATES = ["modern", "classic", "compact", "executive", "minimal"] as const;

export const SECTION_KEYS = [
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "languages",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

const CONTACT_KEYS = [
  "fullName",
  "title",
  "email",
  "phone",
  "location",
  "website",
  "linkedin",
  "github",
] as const;

const MAX_TITLE = 120;
const MAX_SUMMARY = 5000;
const MAX_CONTACT_FIELD = 300;
const MAX_ITEMS_PER_SECTION = 60;
/** Hard cap on the serialised JSON of one resume (keeps rows and requests sane). */
const MAX_TOTAL_BYTES = 400_000;

export interface ResumeValues {
  title?: string;
  template?: (typeof RESUME_TEMPLATES)[number];
  accent?: string;
  contact?: Record<string, string>;
  summary?: string;
  experience?: Record<string, unknown>[];
  education?: Record<string, unknown>[];
  projects?: Record<string, unknown>[];
  skills?: Record<string, unknown>[];
  certifications?: Record<string, unknown>[];
  languages?: Record<string, unknown>[];
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Returns only the fields present in `body`, validated. Unknown keys and
 * anything that isn't part of the resume model are dropped (so a body can't
 * smuggle in `userId`, `id` or timestamps).
 */
export function sanitizeResumeInput(body: unknown): ResumeValues {
  if (!isRecord(body)) throw new ResumeInputError("Invalid request body.");

  const out: ResumeValues = {};

  if (body.title !== undefined) {
    const t = typeof body.title === "string" ? body.title.trim() : "";
    if (t.length > MAX_TITLE) {
      throw new ResumeInputError(`Resume name is too long (max ${MAX_TITLE} characters).`);
    }
    out.title = t || "Untitled resume";
  }

  if (body.template !== undefined) {
    if (!(RESUME_TEMPLATES as readonly string[]).includes(String(body.template))) {
      throw new ResumeInputError("Unknown resume template.");
    }
    out.template = body.template as ResumeValues["template"];
  }

  if (body.accent !== undefined) {
    if (typeof body.accent !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.accent)) {
      throw new ResumeInputError("Accent colour must be a hex value like #2563eb.");
    }
    out.accent = body.accent;
  }

  if (body.contact !== undefined) {
    if (!isRecord(body.contact)) throw new ResumeInputError('"contact" must be an object.');
    const contact: Record<string, string> = {};
    for (const key of CONTACT_KEYS) {
      const v = body.contact[key];
      if (v === undefined || v === null) {
        contact[key] = "";
        continue;
      }
      if (typeof v !== "string") throw new ResumeInputError(`Contact "${key}" must be text.`);
      if (v.length > MAX_CONTACT_FIELD) throw new ResumeInputError(`Contact "${key}" is too long.`);
      contact[key] = v.trim();
    }
    out.contact = contact;
  }

  if (body.summary !== undefined) {
    const s = typeof body.summary === "string" ? body.summary : "";
    if (s.length > MAX_SUMMARY) throw new ResumeInputError("Summary is too long.");
    out.summary = s;
  }

  for (const key of SECTION_KEYS) {
    const v = body[key];
    if (v === undefined) continue;
    if (!Array.isArray(v)) throw new ResumeInputError(`"${key}" must be a list.`);
    if (v.length > MAX_ITEMS_PER_SECTION) {
      throw new ResumeInputError(`"${key}" can have at most ${MAX_ITEMS_PER_SECTION} entries.`);
    }
    out[key] = v.filter(isRecord);
  }

  if (JSON.stringify(out).length > MAX_TOTAL_BYTES) {
    throw new ResumeInputError("This resume is too large to save.");
  }

  return out;
}
