import { JOB_TYPE_OPTIONS, WORK_MODE_OPTIONS } from "@/lib/profile/options";

/** Thrown for profile input we can't store; routes map it to a 400. */
export class ProfileInputError extends Error {}

export interface ProfilePatch {
  /** `users.name` */
  name?: string;
  /** Columns on `candidate_profiles` (only the keys the client sent). */
  columns: Record<string, unknown>;
}

const MAX_LIST_ITEMS = 40;
const MAX_LIST_ITEM_LEN = 80;
const MAX_NESTED_ITEMS = 40;
const MAX_NESTED_TEXT_LEN = 300;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function text(body: Record<string, unknown>, key: string, max: number): string | null | undefined {
  const v = body[key];
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") throw new ProfileInputError(`"${key}" must be text.`);
  const t = v.trim();
  if (t.length > max) throw new ProfileInputError(`"${key}" is too long (max ${max} characters).`);
  return t || null;
}

function url(body: Record<string, unknown>, key: string): string | null | undefined {
  const raw = text(body, key, 300);
  if (raw === undefined || raw === null) return raw;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if ((u.protocol !== "http:" && u.protocol !== "https:") || !u.hostname.includes(".")) {
      throw new Error("bad");
    }
    return u.toString();
  } catch {
    throw new ProfileInputError(`"${key}" is not a valid URL.`);
  }
}

function list(body: Record<string, unknown>, key: string): string[] | undefined {
  const v = body[key];
  if (v === undefined) return undefined;
  if (v === null) return [];
  if (!Array.isArray(v)) throw new ProfileInputError(`"${key}" must be a list.`);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of v) {
    if (typeof item !== "string") throw new ProfileInputError(`"${key}" must only contain text.`);
    const t = item.trim();
    if (!t) continue;
    if (t.length > MAX_LIST_ITEM_LEN) {
      throw new ProfileInputError(`Items in "${key}" are too long (max ${MAX_LIST_ITEM_LEN} characters).`);
    }
    const norm = t.toLowerCase();
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(t);
  }
  if (out.length > MAX_LIST_ITEMS) {
    throw new ProfileInputError(`"${key}" can have at most ${MAX_LIST_ITEMS} items.`);
  }
  return out;
}

function structuredList(body: Record<string, unknown>, key: string): Record<string, unknown>[] | undefined {
  const value = body[key];
  if (value === undefined) return undefined;
  if (value === null) return [];
  if (!Array.isArray(value)) throw new ProfileInputError(`"${key}" must be a list.`);
  if (value.length > MAX_NESTED_ITEMS) throw new ProfileInputError(`"${key}" can have at most ${MAX_NESTED_ITEMS} items.`);

  return value.map((item) => {
    if (!isRecord(item)) throw new ProfileInputError(`Items in "${key}" must be objects.`);
    const output: Record<string, unknown> = {};
    for (const [field, raw] of Object.entries(item)) {
      if (typeof raw === "boolean") {
        output[field] = raw;
      } else if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (trimmed.length > MAX_NESTED_TEXT_LEN) {
          throw new ProfileInputError(`Fields in "${key}" are too long (max ${MAX_NESTED_TEXT_LEN} characters).`);
        }
        output[field] = trimmed;
      } else if (raw !== null && raw !== undefined) {
        throw new ProfileInputError(`Fields in "${key}" must be text or boolean.`);
      } else {
        output[field] = "";
      }
    }
    return output;
  });
}

function enumList(
  body: Record<string, unknown>,
  key: string,
  allowed: readonly string[],
): string[] | undefined {
  const items = list(body, key);
  if (items === undefined) return undefined;
  const lowered = items.map((i) => i.toLowerCase());
  const bad = lowered.find((i) => !allowed.includes(i));
  if (bad) throw new ProfileInputError(`"${bad}" is not a valid option for "${key}".`);
  return lowered;
}

function int(
  body: Record<string, unknown>,
  key: string,
  min: number,
  max: number,
): number | null | undefined {
  const v = body[key];
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < min || n > max) {
    throw new ProfileInputError(`"${key}" must be a number between ${min} and ${max}.`);
  }
  return Math.round(n);
}

/**
 * Validates a profile update. Only keys present in the body are returned, so
 * a partial update never blanks fields it didn't mention.
 */
export function sanitizeProfileInput(body: unknown): ProfilePatch {
  if (!isRecord(body)) throw new ProfileInputError("Invalid request body.");

  const columns: Record<string, unknown> = {};
  const set = (key: string, value: unknown) => {
    if (value !== undefined) columns[key] = value;
  };

  set("headline", text(body, "headline", 160));
  set("location", text(body, "location", 120));
  set("phone", text(body, "phone", 40));
  set("bio", text(body, "bio", 2000));
  set("website", url(body, "website"));
  set("linkedinUrl", url(body, "linkedinUrl"));
  set("githubUrl", url(body, "githubUrl"));

  set("yearsExperience", int(body, "yearsExperience", 0, 60));
  set("skills", list(body, "skills"));
  set("education", structuredList(body, "education"));
  set("certifications", structuredList(body, "certifications"));
  set("workExperience", structuredList(body, "workExperience"));

  set("targetRoles", list(body, "targetRoles"));
  set("preferredLocations", list(body, "preferredLocations"));
  set("preferredJobTypes", enumList(body, "preferredJobTypes", JOB_TYPE_OPTIONS));
  set("preferredWorkModes", enumList(body, "preferredWorkModes", WORK_MODE_OPTIONS));

  const min = int(body, "expectedSalaryMin", 0, 1_000_000_000_000);
  const max = int(body, "expectedSalaryMax", 0, 1_000_000_000_000);
  if (min != null && max != null && min > max) {
    throw new ProfileInputError("Minimum salary can't be higher than maximum salary.");
  }
  set("expectedSalaryMin", min);
  set("expectedSalaryMax", max);

  if (body.salaryCurrency !== undefined) {
    const c = typeof body.salaryCurrency === "string" ? body.salaryCurrency.trim() : "";
    if (!/^[A-Za-z]{3}$/.test(c)) {
      throw new ProfileInputError('"salaryCurrency" must be a 3-letter currency code.');
    }
    columns.salaryCurrency = c.toUpperCase();
  }

  const patch: ProfilePatch = { columns };
  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 100) {
      throw new ProfileInputError('"name" is required (max 100 characters).');
    }
    patch.name = name;
  }
  return patch;
}
