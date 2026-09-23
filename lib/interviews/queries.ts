import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { interviews, jobs, type Interview } from "@/lib/db/schema";
import { advanceForScheduledInterview } from "@/lib/jobs/queries";
import type {
  InterviewCreateInput,
  InterviewUpdateInput,
} from "@/lib/interviews/sanitize";

/** Raised when the application an interview is for isn't the caller's (or doesn't exist). */
export class InterviewJobNotFoundError extends Error {}

/** The shape the frontend's `Interview` type expects (job populated as a reference). */
export interface InterviewDto {
  _id: string;
  userId: string;
  jobId: { _id: string; jobTitle: string; companyName: string; applicationStatus: string } | null;
  stage: Interview["stage"];
  status: Interview["status"];
  interviewDate: string;
  location: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const selection = {
  interview: interviews,
  jobRef: jobs.id,
  jobTitle: jobs.jobTitle,
  companyName: jobs.companyName,
  applicationStatus: jobs.applicationStatus,
};

interface JoinedRow {
  interview: Interview;
  jobRef: string | null;
  jobTitle: string | null;
  companyName: string | null;
  applicationStatus: string | null;
}

function toDto(row: JoinedRow): InterviewDto {
  const { interview } = row;
  return {
    _id: interview.id,
    userId: interview.userId,
    jobId:
      row.jobRef !== null
        ? {
            _id: row.jobRef,
            jobTitle: row.jobTitle ?? "",
            companyName: row.companyName ?? "",
            applicationStatus: row.applicationStatus ?? "",
          }
        : null,
    stage: interview.stage,
    status: interview.status,
    interviewDate: interview.interviewDate.toISOString(),
    location: interview.location,
    notes: interview.notes,
    createdAt: interview.createdAt.toISOString(),
    updatedAt: interview.updatedAt.toISOString(),
  };
}

/**
 * The caller's interviews, soonest first, optionally for one application.
 * The job is joined on the caller's own applications only, so a reference to
 * someone else's job could never leak its title even if bad data existed.
 */
export async function listInterviews(userId: string, jobId?: string): Promise<InterviewDto[]> {
  const rows = await db
    .select(selection)
    .from(interviews)
    .leftJoin(jobs, and(eq(interviews.jobId, jobs.id), eq(jobs.userId, userId)))
    .where(
      jobId
        ? and(eq(interviews.userId, userId), eq(interviews.jobId, jobId))
        : eq(interviews.userId, userId),
    )
    .orderBy(asc(interviews.interviewDate), asc(interviews.id));
  return rows.map(toDto);
}

export async function getInterview(userId: string, id: string): Promise<InterviewDto | null> {
  const [row] = await db
    .select(selection)
    .from(interviews)
    .leftJoin(jobs, and(eq(interviews.jobId, jobs.id), eq(jobs.userId, userId)))
    .where(and(eq(interviews.id, id), eq(interviews.userId, userId)))
    .limit(1);
  return row ? toDto(row) : null;
}

/**
 * Books an interview for one of the caller's applications. The application
 * row is locked for the duration, and if it hadn't yet been answered
 * ("applied" / "waiting_response") it moves to "interviewing" — with the
 * response history stamped and the change recorded — so statuses and
 * analytics agree with the interviews on file.
 */
export async function createInterview(
  userId: string,
  input: InterviewCreateInput,
): Promise<InterviewDto> {
  const id = await db.transaction(async (tx) => {
    const [job] = await tx
      .select({
        id: jobs.id,
        userId: jobs.userId,
        applicationStatus: jobs.applicationStatus,
        respondedAt: jobs.respondedAt,
        offerAt: jobs.offerAt,
      })
      .from(jobs)
      .where(and(eq(jobs.id, input.jobId), eq(jobs.userId, userId)))
      .limit(1)
      .for("update");
    if (!job) throw new InterviewJobNotFoundError();

    const [row] = await tx
      .insert(interviews)
      .values({
        userId,
        jobId: job.id,
        stage: input.stage,
        status: input.status,
        interviewDate: input.interviewDate,
        location: input.location,
        notes: input.notes,
      })
      .returning({ id: interviews.id });

    // Any interview that wasn't cancelled means the employer replied.
    if (input.status !== "canceled") {
      await advanceForScheduledInterview(tx, job, new Date());
    }
    return row.id;
  });

  const created = await getInterview(userId, id);
  if (!created) throw new Error("Interview vanished immediately after creation");
  return created;
}

/** Updates an interview the caller owns. Returns null if it doesn't exist / isn't theirs. */
export async function updateInterview(
  userId: string,
  id: string,
  patch: InterviewUpdateInput,
): Promise<InterviewDto | null> {
  const [row] = await db
    .update(interviews)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(interviews.id, id), eq(interviews.userId, userId)))
    .returning({ id: interviews.id });
  return row ? getInterview(userId, row.id) : null;
}

/** Deletes an interview the caller owns. Returns whether a row was removed. */
export async function deleteInterview(userId: string, id: string): Promise<boolean> {
  const deleted = await db
    .delete(interviews)
    .where(and(eq(interviews.id, id), eq(interviews.userId, userId)))
    .returning({ id: interviews.id });
  return deleted.length > 0;
}
