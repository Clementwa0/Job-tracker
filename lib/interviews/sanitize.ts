import { interviewStageEnum, interviewStatusEnum } from "@/lib/db/schema";
import { isUuid } from "@/lib/uuid";

/** Thrown for interview input we can't store; routes map it to a 400. */
export class InterviewInputError extends Error {}

type Stage = (typeof interviewStageEnum.enumValues)[number];
type Status = (typeof interviewStatusEnum.enumValues)[number];

export interface InterviewCreateInput {
  jobId: string;
  stage: Stage;
  status: Status;
  interviewDate: Date;
  location: string;
  notes: string;
}

/** A partial update; the application an interview belongs to can't be changed. */
export type InterviewUpdateInput = Partial<Omit<InterviewCreateInput, "jobId">>;

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;
const MAX_LOCATION = 300;
const MAX_NOTES = 5000;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function oneOf<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!(allowed as readonly string[]).includes(v)) {
    throw new InterviewInputError(`"${field}" must be one of: ${allowed.join(", ")}.`);
  }
  return v as T;
}

function parseDate(value: unknown): Date {
  const d = value instanceof Date ? value : new Date(value as string | number);
  const year = d.getUTCFullYear();
  if (
    (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) ||
    Number.isNaN(d.getTime()) ||
    year < MIN_YEAR ||
    year > MAX_YEAR
  ) {
    throw new InterviewInputError('"interviewDate" is not a valid date.');
  }
  return d;
}

function parseText(value: unknown, field: string, max: number): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") throw new InterviewInputError(`"${field}" must be text.`);
  if (value.length > max) throw new InterviewInputError(`"${field}" is too long (max ${max} characters).`);
  return value.trim();
}

/** Validates a new interview (`POST /interviews`). */
export function sanitizeInterviewCreate(body: unknown): InterviewCreateInput {
  if (!isRecord(body)) throw new InterviewInputError("Invalid request body.");
  if (!isUuid(body.jobId)) throw new InterviewInputError('"jobId" is required.');
  if (body.interviewDate === undefined || body.interviewDate === null || body.interviewDate === "") {
    throw new InterviewInputError('"interviewDate" is required.');
  }

  return {
    jobId: body.jobId,
    stage: oneOf(body.stage ?? "phone", interviewStageEnum.enumValues, "stage"),
    status: oneOf(body.status ?? "scheduled", interviewStatusEnum.enumValues, "status"),
    interviewDate: parseDate(body.interviewDate),
    location: parseText(body.location, "location", MAX_LOCATION),
    notes: parseText(body.notes, "notes", MAX_NOTES),
  };
}

/** Validates a partial update (`PUT /interviews/:id`); only the fields sent are returned. */
export function sanitizeInterviewUpdate(body: unknown): InterviewUpdateInput {
  if (!isRecord(body)) throw new InterviewInputError("Invalid request body.");

  const out: InterviewUpdateInput = {};
  if (body.stage !== undefined) out.stage = oneOf(body.stage, interviewStageEnum.enumValues, "stage");
  if (body.status !== undefined) out.status = oneOf(body.status, interviewStatusEnum.enumValues, "status");
  if (body.interviewDate !== undefined) out.interviewDate = parseDate(body.interviewDate);
  if (body.location !== undefined) out.location = parseText(body.location, "location", MAX_LOCATION);
  if (body.notes !== undefined) out.notes = parseText(body.notes, "notes", MAX_NOTES);
  return out;
}
