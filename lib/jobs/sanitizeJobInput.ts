import {
  jobActivityTypeEnum,
  jobPriorityEnum,
  type NewJobActivityRow,
  type NewJobAttachmentRow,
  type NewJobReminderRow,
  type NewJobRow,
} from "@/lib/db/schema";
import { isApplicationStatus, normalizeStatus } from "@/lib/jobs/status";
import { isUuid } from "@/lib/uuid";

/** Thrown for client-supplied input we can't store; routes map it to a 400. */
export class JobInputError extends Error {}

/** Scalar columns on `jobs` a client may set (never id/userId/timestamps). */
export type JobValues = Partial<
  Omit<NewJobRow, "id" | "userId" | "createdAt" | "updatedAt">
>;

type ChildInput<T> = Omit<T, "jobId" | "position">;

export interface JobInput {
  values: JobValues;
  /** When defined, replaces the job's stored children of that kind. */
  attachments?: ChildInput<NewJobAttachmentRow>[];
  activity?: ChildInput<NewJobActivityRow>[];
  reminders?: ChildInput<NewJobReminderRow>[];
}

const TEXT_FIELDS = [
  "jobTitle",
  "companyName",
  "companyLogo",
  "location",
  "jobType",
  "workMode",
  "source",
  "salaryCurrency",
  "salaryRange",
  "contactPerson",
  "contactEmail",
  "contactPhone",
  "recruiterLinkedIn",
  "jobPostingUrl",
  "jobDescription",
  "notes",
] as const;

const NULLABLE_TEXT_FIELDS = ["resumeFile", "coverLetterFile"] as const;
const DATE_FIELDS = ["applicationDate", "applicationDeadline"] as const;
const SALARY_FIELDS = ["salaryMin", "salaryMax"] as const;

/* ------------------------------ primitives ------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** undefined → leave alone; null → "" ; string/number → string; else ignore. */
function parseText(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function parseNullableText(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return typeof value === "string" ? value : undefined;
}

/** undefined → leave alone; null/"" → clear; invalid → 400. */
function parseDate(value: unknown, field: string): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(date.getTime())) {
    throw new JobInputError(`"${field}" is not a valid date.`);
  }
  return date;
}

function parseNumber(
  value: unknown,
  field: string,
  integer: boolean,
): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    throw new JobInputError(`"${field}" must be a number.`);
  }
  return integer ? Math.round(n) : n;
}

function parseOptionalUuid(value: unknown, field: string): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (!isUuid(value)) throw new JobInputError(`"${field}" is not a valid id.`);
  return value;
}

/* -------------------------------- children ------------------------------- */

function parseAttachments(raw: unknown[]): JobInput["attachments"] {
  return raw.filter(isRecord).map((item) => ({
    // Keep a client-supplied id only if it's a real uuid; otherwise let the
    // database mint one (covers ids that predate the migration).
    ...(isUuid(item._id) ? { id: item._id } : {}),
    name: parseText(item.name) ?? "",
    url: parseText(item.url) ?? "",
    type: parseNullableText(item.type) ?? null,
    size: parseNumber(item.size, "attachment size", true) ?? null,
    uploadedAt: parseDate(item.uploadedAt, "attachment uploadedAt") ?? new Date(),
  }));
}

function parseActivity(raw: unknown[]): JobInput["activity"] {
  return raw.filter(isRecord).map((item) => {
    const message = parseText(item.message)?.trim();
    if (!message) throw new JobInputError("Every activity entry needs a message.");

    const type = item.type === undefined || item.type === null ? "note" : String(item.type);
    if (!(jobActivityTypeEnum.enumValues as readonly string[]).includes(type)) {
      throw new JobInputError(`"${type}" is not a valid activity type.`);
    }

    return {
      ...(isUuid(item._id) ? { id: item._id } : {}),
      type: type as NewJobActivityRow["type"],
      message,
      meta: isRecord(item.meta) ? item.meta : null,
      createdAt: parseDate(item.createdAt, "activity createdAt") ?? new Date(),
    };
  });
}

function parseReminders(raw: unknown[]): JobInput["reminders"] {
  return raw.filter(isRecord).map((item) => ({
    ...(isUuid(item._id) ? { id: item._id } : {}),
    title: parseText(item.title) ?? "",
    dueAt: parseDate(item.dueAt, "reminder dueAt") ?? null,
    done: item.done === true,
  }));
}

/* --------------------------------- entry --------------------------------- */

/**
 * Turns a client request body into something safe to write: only fields a
 * jobseeker may set are kept (never `id`, `userId` or timestamps, so a body
 * can't reassign ownership or forge them), values are coerced/validated for
 * their column types, and the embedded arrays are split out as child rows.
 *
 * Throws `JobInputError` (→ HTTP 400) for values that can't be stored.
 */
export function sanitizeJobInput(body: Record<string, unknown>): JobInput {
  const values: Record<string, unknown> = {};

  const set = (key: string, value: unknown) => {
    if (value !== undefined) values[key] = value;
  };

  for (const key of TEXT_FIELDS) set(key, parseText(body[key]));
  for (const key of NULLABLE_TEXT_FIELDS) set(key, parseNullableText(body[key]));
  for (const key of DATE_FIELDS) set(key, parseDate(body[key], key));
  for (const key of SALARY_FIELDS) set(key, parseNumber(body[key], key, true));

  const matchScore = parseNumber(body.matchScore, "matchScore", false);
  if (matchScore != null && (matchScore < 0 || matchScore > 100)) {
    throw new JobInputError('"matchScore" must be between 0 and 100.');
  }
  set("matchScore", matchScore);
  set("jobPostingId", parseOptionalUuid(body.jobPostingId, "jobPostingId"));

  if (body.applicationStatus !== undefined && body.applicationStatus !== null) {
    const status = normalizeStatus(body.applicationStatus);
    // An empty status means "not chosen": keep the default / stored value.
    if (status) {
      if (!isApplicationStatus(status)) {
        throw new JobInputError(`"${String(body.applicationStatus)}" is not a valid application status.`);
      }
      values.applicationStatus = status;
    }
  }

  if (body.priority !== undefined && body.priority !== null) {
    const priority = String(body.priority).toLowerCase();
    if (!(jobPriorityEnum.enumValues as readonly string[]).includes(priority)) {
      throw new JobInputError(`"${String(body.priority)}" is not a valid priority.`);
    }
    values.priority = priority;
  }

  if (body.tags !== undefined) {
    values.tags = Array.isArray(body.tags)
      ? body.tags
          .filter((t): t is string => typeof t === "string")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
  }

  if (typeof body.isArchived === "boolean") values.isArchived = body.isArchived;

  if (body.matchAnalysis !== undefined) {
    values.matchAnalysis = isRecord(body.matchAnalysis) ? body.matchAnalysis : null;
  }

  if (
    typeof values.salaryMin === "number" &&
    typeof values.salaryMax === "number" &&
    values.salaryMin > values.salaryMax
  ) {
    throw new JobInputError("Minimum salary can't be higher than maximum salary.");
  }

  const input: JobInput = { values: values as JobValues };

  if (Array.isArray(body.attachments)) input.attachments = parseAttachments(body.attachments);
  else if (body.attachments === null) input.attachments = [];

  if (Array.isArray(body.activity)) input.activity = parseActivity(body.activity);
  else if (body.activity === null) input.activity = [];

  if (Array.isArray(body.reminders)) input.reminders = parseReminders(body.reminders);
  else if (body.reminders === null) input.reminders = [];

  return input;
}

/** Activity types a client may write. "status" and "system" rows are recorded by the server. */
const CLIENT_ACTIVITY_TYPES = ["note", "reminder"] as const;
export type ClientActivityType = (typeof CLIENT_ACTIVITY_TYPES)[number];

export interface ActivityEntryInput {
  type: ClientActivityType;
  message: string;
  meta: Record<string, unknown> | null;
}

/** Validates one entry for `POST /jobs/:id/activity`. */
export function sanitizeActivityEntry(body: unknown): ActivityEntryInput {
  if (!isRecord(body)) throw new JobInputError("Invalid request body.");

  const message = parseText(body.message)?.trim();
  if (!message) throw new JobInputError("An activity entry needs a message.");
  if (message.length > 2000) throw new JobInputError("The activity message is too long.");

  const type = body.type === undefined || body.type === null ? "note" : String(body.type);
  if (!(CLIENT_ACTIVITY_TYPES as readonly string[]).includes(type)) {
    throw new JobInputError(
      "Only notes and reminders can be added; status changes are recorded automatically.",
    );
  }

  return {
    type: type as ClientActivityType,
    message,
    meta: isRecord(body.meta) ? body.meta : null,
  };
}
