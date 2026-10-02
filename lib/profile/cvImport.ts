import { parseLooseDate } from "@/lib/profile/experience";
import type { ParsedCv } from "@/types/profile";

/**
 * Helpers for the Jobseeker "import my CV" flow. Pure (no I/O, no server-only
 * imports) so the route stays thin and the behaviour is easy to test.
 *
 * Limits mirror `sanitizeProfileInput` so anything we hand to the profile form
 * can actually be saved.
 */

export const CV_MIN_TEXT_LENGTH = 80;
export const CV_MAX_TEXT_LENGTH = 18_000;
export const CV_MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Skill items are capped at 80 chars by the profile API. */
const MAX_SKILL_LEN = 80;
/** The profile keeps at most 40 skills; parse a few more so the user can choose. */
const MAX_PARSED_SKILLS = 80;
const MAX_ENTRIES = 40;
const MAX_BULLETS = 12;
const MAX_BULLET_LEN = 400;
const MAX_FIELD_LEN = 200;
const MAX_TARGET_ROLES = 10;
const MAX_ROLE_LEN = 80;

/** A failure with a message that is safe to show to the user. */
export class CvImportError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "CvImportError";
  }
}

// ---------------------------------------------------------------------------
// File validation
// ---------------------------------------------------------------------------

export type CvFileKind = "pdf" | "docx";

/**
 * Validates the upload without trusting its name or declared MIME type: the
 * extension must be pdf/docx AND the leading bytes must match that format.
 */
export function validateCvFile(file: { name: string; size: number }, head: Uint8Array): CvFileKind {
  const ext = file.name.toLowerCase().match(/\.(pdf|docx)$/)?.[1] as CvFileKind | undefined;
  if (!ext) throw new CvImportError("Upload your CV as a PDF or DOCX file.", 400);
  if (file.size === 0) throw new CvImportError("This file is empty. Please choose another CV.", 400);
  if (file.size > CV_MAX_FILE_BYTES) throw new CvImportError("Your CV must be 5 MB or smaller.", 413);

  const startsWith = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);
  const isPdf = startsWith(0x25, 0x50, 0x44, 0x46, 0x2d); // %PDF-
  const isZip = startsWith(0x50, 0x4b, 0x03, 0x04); // PK\x03\x04 (DOCX container)
  if ((ext === "pdf" && !isPdf) || (ext === "docx" && !isZip)) {
    throw new CvImportError("This file doesn't look like a valid PDF or DOCX. Please re-export your CV and try again.", 400);
  }
  return ext;
}

/** Guards the extracted text before it is sent to the AI parser. */
export function assertUsableCvText(text: string): void {
  if (text.length === 0) {
    throw new CvImportError(
      "We couldn't find any text in this CV. It may be a scanned or image-only document - please upload a text-based PDF or a DOCX.",
      422,
    );
  }
  if (text.length < CV_MIN_TEXT_LENGTH) {
    throw new CvImportError("This CV has too little text to analyze. Please upload a complete CV.", 422);
  }
}

/** Strips things that could be read as prompt structure, and caps the length. */
export function prepareCvTextForParser(text: string): string {
  return text.replace(/```/g, "").replace(/system:|assistant:|user:/gi, "").slice(0, CV_MAX_TEXT_LENGTH);
}

/** True when the CV text has a heading/phrase that states the roles the person WANTS. */
export function hasExplicitTargetRoleStatement(text: string): boolean {
  return /\b(target(ed)?\s+roles?|desired\s+(position|role|job)|career\s+(objective|goal)|objective|seeking|looking\s+for|job\s+target)\b/i.test(text);
}

// ---------------------------------------------------------------------------
// Normalization of the AI output
// ---------------------------------------------------------------------------

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown, max = MAX_FIELD_LEN): string =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

function strList(v: unknown, limit: number, itemMax: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.replace(/^[\s•▪◦●\-–—*]+/, "").replace(/\s+/g, " ").trim().slice(0, itemMax))
    .filter(Boolean)
    .slice(0, limit);
}

const PRESENT = /\b(present|current(ly)?|now|ongoing|on-?going|to\s*date|till\s*date|today)\b/i;

/** `YYYY-MM` (what `<input type="month">` needs) or "" when the date can't be read. */
export function toMonthValue(input: unknown, edge: "start" | "end"): string {
  const date = parseLooseDate(input, edge);
  if (!date) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Returns a valid http(s) URL with a scheme, or "" (matches the profile API's URL rule). */
export function cleanUrl(input: unknown): string {
  const raw = str(input, 300);
  if (!raw) return "";
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname.includes(".")) return "";
    return url.pathname === "/" && !url.search && !url.hash ? url.origin : url.toString();
  } catch {
    return "";
  }
}

interface DateFields {
  startDate: string;
  endDate: string;
  current: boolean;
  /** A date string was present but couldn't be understood (or was contradictory). */
  hadBadDate: boolean;
}

function normalizeDates(rawStart: unknown, rawEnd: unknown, flaggedCurrent: boolean): DateFields {
  const startText = str(rawStart, 40);
  const endText = str(rawEnd, 40);
  const current = flaggedCurrent || PRESENT.test(endText);

  let startDate = toMonthValue(startText, "start");
  let endDate = current ? "" : toMonthValue(endText, "end");
  let hadBadDate = (Boolean(startText) && !startDate) || (!current && Boolean(endText) && !endDate);

  if (startDate && endDate && endDate < startDate) {
    // Contradictory range: keep neither end rather than guess which one is right.
    startDate = "";
    endDate = "";
    hadBadDate = true;
  }
  return { startDate, endDate, current, hadBadDate };
}

function normalizeSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const flat: string[] = [];
  for (const item of raw) {
    if (typeof item === "string") flat.push(item);
    else if (isRecord(item) && Array.isArray(item.items)) {
      for (const skill of item.items) if (typeof skill === "string") flat.push(skill);
    }
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const skill of flat) {
    const clean = str(skill, 200);
    if (!clean || clean.length > MAX_SKILL_LEN) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
    if (out.length >= MAX_PARSED_SKILLS) break;
  }
  return out;
}

/**
 * Turns the AI's JSON into a fully-typed, size-safe `ParsedCv`. Never throws
 * on malformed content: unusable pieces become empty values plus a warning.
 *
 * `allowTargetRoles` should only be true when the CV text itself contains an
 * explicit "objective / seeking / target role" statement; otherwise whatever
 * the model returned is discarded so job titles are never turned into goals.
 */
export function normalizeParsedCv(
  result: Record<string, unknown>,
  options: { allowTargetRoles: boolean; now?: Date } = { allowTargetRoles: false },
): ParsedCv {
  const now = options.now ?? new Date();
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const warnings = strList(result.warnings, 20, 300);
  let badDates = false;
  let badLinks = false;

  const resume = isRecord(result.resume) ? result.resume : {};
  const contact = isRecord(resume.contact) ? resume.contact : {};

  const link = (value: unknown) => {
    const cleaned = cleanUrl(value);
    if (str(value, 300) && !cleaned) badLinks = true;
    return cleaned;
  };

  const experience = (Array.isArray(resume.experience) ? resume.experience : [])
    .filter(isRecord)
    .map((entry) => {
      const dates = normalizeDates(entry.startDate, entry.endDate, entry.current === true);
      if (dates.hadBadDate) badDates = true;
      return {
        company: str(entry.company),
        role: str(entry.role),
        location: str(entry.location),
        startDate: dates.startDate,
        endDate: dates.endDate,
        current: dates.current,
        bullets: strList(entry.bullets, MAX_BULLETS, MAX_BULLET_LEN),
      };
    })
    .filter((entry) => entry.company || entry.role)
    .slice(0, MAX_ENTRIES);

  const education = (Array.isArray(resume.education) ? resume.education : [])
    .filter(isRecord)
    .map((entry) => {
      const dates = normalizeDates(entry.startDate, entry.endDate, entry.current === true);
      if (dates.hadBadDate) badDates = true;
      // An end date in the future is an expected graduation, i.e. still studying.
      const ongoing = dates.current || (Boolean(dates.endDate) && dates.endDate > currentMonth);
      return {
        school: str(entry.school),
        degree: str(entry.degree),
        field: str(entry.field),
        startDate: dates.startDate,
        endDate: dates.endDate,
        current: ongoing,
        notes: str(entry.notes, 500),
      };
    })
    .filter((entry) => entry.school || entry.degree)
    .slice(0, MAX_ENTRIES);

  const certifications = (Array.isArray(resume.certifications) ? resume.certifications : [])
    .filter(isRecord)
    .map((entry) => {
      const rawDate = str(entry.date, 40);
      const date = toMonthValue(rawDate, "start");
      if (rawDate && !date) badDates = true;
      return { name: str(entry.name), issuer: str(entry.issuer), date, url: link(entry.url) };
    })
    .filter((entry) => entry.name)
    .slice(0, MAX_ENTRIES);

  const parsed: ParsedCv = {
    confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0.5)),
    warnings,
    contact: {
      fullName: str(contact.fullName, 100),
      title: str(contact.title, 160),
      email: str(contact.email, 254),
      phone: str(contact.phone, 40),
      location: str(contact.location, 120),
      website: link(contact.website),
      linkedin: link(contact.linkedin),
      github: link(contact.github),
    },
    summary: typeof resume.summary === "string" ? resume.summary.replace(/[ \t]+/g, " ").trim().slice(0, 2000) : "",
    skills: normalizeSkills(resume.skills),
    experience,
    education,
    certifications,
    targetRoles: options.allowTargetRoles
      ? [...new Map(strList(resume.targetRoles, MAX_TARGET_ROLES, MAX_ROLE_LEN).map((role) => [role.toLowerCase(), role])).values()]
      : [],
  };

  if (badDates) parsed.warnings.push("Some dates couldn't be read clearly and were left blank.");
  if (badLinks) parsed.warnings.push("Some links in the CV didn't look valid and were skipped.");
  return parsed;
}

/** True when the parse produced nothing we could import. */
export function isEmptyParsedCv(cv: ParsedCv): boolean {
  const c = cv.contact;
  return (
    !c.fullName && !c.title && !c.phone && !c.location && !cv.summary &&
    cv.skills.length === 0 && cv.experience.length === 0 &&
    cv.education.length === 0 && cv.certifications.length === 0
  );
}
