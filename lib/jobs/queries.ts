import { and, asc, count, eq, inArray, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  jobActivity,
  jobAttachments,
  jobReminders,
  jobs,
  type JobActivityRow,
  type JobAttachmentRow,
  type JobReminderRow,
  type JobRow,
  type NewJobRow,
} from "@/lib/db/schema";
import {
  PRE_INTERVIEW_STATUSES,
  deriveStatusTimestamps,
  isResponseStatus,
  statusLabel,
} from "@/lib/jobs/status";
import type { ActivityEntryInput, JobInput } from "@/lib/jobs/sanitizeJobInput";
import type { JobWithChildren } from "@/lib/jobs/serializeJob";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** The stored fields a status change is computed from (always read under a row lock). */
export interface StatusState {
  id: string;
  userId: string;
  applicationStatus: string;
  respondedAt: Date | null;
  offerAt: Date | null;
}

/** Activity types the client owns and may replace; "status"/"system" rows are server-written. */
const CLIENT_ACTIVITY_TYPES = ["note", "reminder"] as const;

/* ------------------------------- reading -------------------------------- */

function groupBy<T extends { jobId: string }>(rows: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const bucket = map.get(row.jobId);
    if (bucket) bucket.push(row);
    else map.set(row.jobId, [row]);
  }
  return map;
}

/**
 * Loads attachments / activity / reminders for a set of jobs in three
 * queries (not N+1) and stitches them on. Activity is in chronological
 * order so server-written status rows interleave correctly with notes.
 */
export async function withChildren(rows: JobRow[]): Promise<JobWithChildren[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);

  const [attachments, activity, reminders] = await Promise.all([
    db
      .select()
      .from(jobAttachments)
      .where(inArray(jobAttachments.jobId, ids))
      .orderBy(asc(jobAttachments.position)),
    db
      .select()
      .from(jobActivity)
      .where(inArray(jobActivity.jobId, ids))
      .orderBy(asc(jobActivity.createdAt), asc(jobActivity.position)),
    db
      .select()
      .from(jobReminders)
      .where(inArray(jobReminders.jobId, ids))
      .orderBy(asc(jobReminders.position)),
  ]);

  const attachmentsByJob = groupBy<JobAttachmentRow>(attachments);
  const activityByJob = groupBy<JobActivityRow>(activity);
  const remindersByJob = groupBy<JobReminderRow>(reminders);

  return rows.map((row) => ({
    ...row,
    attachments: attachmentsByJob.get(row.id) ?? [],
    activity: activityByJob.get(row.id) ?? [],
    reminders: remindersByJob.get(row.id) ?? [],
  }));
}

/** One job by id, scoped to its owner. Returns null if not found / not theirs. */
export async function getJob(
  userId: string,
  id: string,
): Promise<JobWithChildren | null> {
  const [row] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
    .limit(1);
  if (!row) return null;
  const [job] = await withChildren([row]);
  return job;
}

/**
 * A page of the caller's jobs, ordered, with children attached. `where` adds
 * filters on top of the owner scope, which is always applied here so a
 * caller can't accidentally list anyone else's jobs.
 */
export async function listJobs(options: {
  userId: string;
  where?: SQL | undefined;
  orderBy: SQL[];
  limit: number;
  offset: number;
}): Promise<JobWithChildren[]> {
  const rows = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, options.userId), options.where))
    .orderBy(...options.orderBy)
    .limit(options.limit)
    .offset(options.offset);
  return withChildren(rows);
}

/** How many of the caller's jobs match `where` (owner scope always applied). */
export async function countJobs(userId: string, where?: SQL | undefined): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(jobs)
    .where(and(eq(jobs.userId, userId), where));
  return row.total;
}

/* ------------------------------- writing -------------------------------- */

async function nextActivityPosition(tx: Tx, jobId: string): Promise<number> {
  const [row] = await tx
    .select({ max: sql<number>`coalesce(max(${jobActivity.position}), -1)`.mapWith(Number) })
    .from(jobActivity)
    .where(eq(jobActivity.jobId, jobId));
  return row.max + 1;
}

/**
 * Appends a server-written history row for a status change. These rows are
 * the permanent record of an application's progress: clients can't edit or
 * delete them through the job APIs.
 */
export async function recordStatusChange(
  tx: Tx,
  jobId: string,
  from: string | null,
  to: string,
  at: Date,
  reason?: string,
) {
  const message = from
    ? `Status changed from ${statusLabel(from)} to ${statusLabel(to)}`
    : `Added with status ${statusLabel(to)}`;

  await tx.insert(jobActivity).values({
    jobId,
    type: "status",
    message: reason ? `${message} (${reason})` : message,
    meta: { from, to, ...(reason ? { reason } : {}) },
    position: await nextActivityPosition(tx, jobId),
    createdAt: at,
  });
}

/**
 * Replaces a job's child rows. For each kind of child, `undefined` means
 * "not supplied - leave what's stored"; an array (even empty) replaces the
 * client-owned rows. Activity is special: only notes/reminders are replaced,
 * and any status/system rows in the payload are ignored, so a client that
 * round-trips (or blanks) the activity list can never rewrite history.
 */
async function replaceChildren(tx: Tx, jobId: string, input: JobInput) {
  if (input.attachments !== undefined) {
    await tx.delete(jobAttachments).where(eq(jobAttachments.jobId, jobId));
    if (input.attachments.length > 0) {
      await tx
        .insert(jobAttachments)
        .values(input.attachments.map((a, position) => ({ ...a, jobId, position })));
    }
  }

  if (input.activity !== undefined) {
    await tx
      .delete(jobActivity)
      .where(
        and(eq(jobActivity.jobId, jobId), inArray(jobActivity.type, [...CLIENT_ACTIVITY_TYPES])),
      );
    const clientRows = input.activity.filter((a) =>
      (CLIENT_ACTIVITY_TYPES as readonly string[]).includes(a.type ?? "note"),
    );
    if (clientRows.length > 0) {
      await tx
        .insert(jobActivity)
        .values(clientRows.map((a, position) => ({ ...a, jobId, position })));
    }
  }

  if (input.reminders !== undefined) {
    await tx.delete(jobReminders).where(eq(jobReminders.jobId, jobId));
    if (input.reminders.length > 0) {
      await tx
        .insert(jobReminders)
        .values(input.reminders.map((r, position) => ({ ...r, jobId, position })));
    }
  }
}

export async function createJob(
  userId: string,
  input: JobInput,
): Promise<JobWithChildren> {
  const now = new Date();
  const status = input.values.applicationStatus ?? "applied";
  const stamps = deriveStatusTimestamps(null, status, now);

  const id = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(jobs)
      .values({ ...input.values, ...stamps, userId })
      .returning({ id: jobs.id });

    // Logging an application that's already past "applied" is history worth keeping.
    if (isResponseStatus(status)) await recordStatusChange(tx, row.id, null, status, now);

    await replaceChildren(tx, row.id, input);
    return row.id;
  });

  const job = await getJob(userId, id);
  if (!job) throw new Error("Job vanished immediately after creation");
  return job;
}

/**
 * Applies `input` to one job whose state was read under a row lock: stamps
 * the response/offer history markers, records the status transition, updates
 * the row and replaces any supplied children - all inside the caller's
 * transaction.
 */
async function applyUpdate(tx: Tx, prev: StatusState, input: JobInput, now: Date) {
  const next = input.values.applicationStatus;
  const stamps = next !== undefined ? deriveStatusTimestamps(prev, next, now) : {};

  await tx
    .update(jobs)
    .set({ ...input.values, ...stamps, updatedAt: now })
    .where(and(eq(jobs.id, prev.id), eq(jobs.userId, prev.userId)));

  if (next !== undefined && next !== prev.applicationStatus) {
    await recordStatusChange(tx, prev.id, prev.applicationStatus, next, now);
  }

  await replaceChildren(tx, prev.id, input);
}

const statusStateColumns = {
  id: jobs.id,
  userId: jobs.userId,
  applicationStatus: jobs.applicationStatus,
  respondedAt: jobs.respondedAt,
  offerAt: jobs.offerAt,
};

/** Updates a job the caller owns. Returns null if it doesn't exist / isn't theirs. */
export async function updateJob(
  userId: string,
  id: string,
  input: JobInput,
): Promise<JobWithChildren | null> {
  const updatedId = await db.transaction(async (tx) => {
    const [prev] = await tx
      .select(statusStateColumns)
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
      .limit(1)
      .for("update");
    if (!prev) return null;

    await applyUpdate(tx, prev, input, new Date());
    return prev.id;
  });

  return updatedId ? getJob(userId, updatedId) : null;
}

/**
 * Applies the same scalar changes to several of the caller's jobs. Ids that
 * aren't theirs (or don't exist) are simply not matched.
 */
export async function bulkUpdateJobs(
  userId: string,
  ids: string[],
  input: JobInput,
): Promise<{ matched: number; modified: number }> {
  // Children are per-job data; a bulk edit only changes shared scalar fields.
  const scalarOnly: JobInput = { values: input.values };

  return db.transaction(async (tx) => {
    const owned = await tx
      .select(statusStateColumns)
      .from(jobs)
      .where(and(inArray(jobs.id, ids), eq(jobs.userId, userId)))
      .for("update");

    const now = new Date();
    for (const prev of owned) await applyUpdate(tx, prev, scalarOnly, now);
    return { matched: owned.length, modified: owned.length };
  });
}

/** Sets or clears the archived flag on a job the caller owns. */
export async function setArchived(
  userId: string,
  id: string,
  archived: boolean,
): Promise<JobWithChildren | null> {
  const [row] = await db
    .update(jobs)
    .set({ isArchived: archived, updatedAt: new Date() })
    .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
    .returning({ id: jobs.id });
  return row ? getJob(userId, row.id) : null;
}

/** Appends a note/reminder to a job's timeline. Returns null if the job isn't the caller's. */
export async function addActivity(
  userId: string,
  id: string,
  entry: ActivityEntryInput,
): Promise<JobWithChildren | null> {
  const found = await db.transaction(async (tx) => {
    const [job] = await tx
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
      .limit(1)
      .for("update");
    if (!job) return false;

    const now = new Date();
    await tx.insert(jobActivity).values({
      jobId: job.id,
      type: entry.type,
      message: entry.message,
      meta: entry.meta,
      position: await nextActivityPosition(tx, job.id),
      createdAt: now,
    });
    await tx
      .update(jobs)
      .set({ updatedAt: now })
      .where(and(eq(jobs.id, job.id), eq(jobs.userId, userId)));
    return true;
  });

  return found ? getJob(userId, id) : null;
}

/** Fields carried over when an application is duplicated. */
const DUPLICATED_FIELDS = [
  "jobTitle",
  "companyName",
  "companyLogo",
  "location",
  "jobType",
  "workMode",
  "source",
  "priority",
  "tags",
  "applicationDeadline",
  "salaryMin",
  "salaryMax",
  "salaryCurrency",
  "salaryRange",
  "contactPerson",
  "contactEmail",
  "contactPhone",
  "recruiterLinkedIn",
  "resumeFile",
  "coverLetterFile",
  "jobPostingUrl",
  "jobDescription",
  "matchScore",
  "matchAnalysis",
  "notes",
] as const satisfies readonly (keyof JobRow)[];

/**
 * Copies one of the caller's applications as a fresh "applied" application.
 * History does not carry over (status timeline, response/offer markers,
 * interviews) and the copy isn't linked to the job-board posting, so the
 * one-application-per-posting rule isn't tripped.
 */
export async function duplicateJob(
  userId: string,
  id: string,
): Promise<JobWithChildren | null> {
  const source = await getJob(userId, id);
  if (!source) return null;

  const now = new Date();
  const copy: Record<string, unknown> = {};
  for (const key of DUPLICATED_FIELDS) copy[key] = source[key];

  const newId = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(jobs)
      .values({
        ...(copy as Partial<NewJobRow>),
        userId,
        applicationStatus: "applied",
        applicationDate: now,
        isArchived: false,
      })
      .returning({ id: jobs.id });

    if (source.attachments.length > 0) {
      await tx.insert(jobAttachments).values(
        source.attachments.map((a, position) => ({
          jobId: row.id,
          position,
          name: a.name,
          url: a.url,
          type: a.type,
          size: a.size,
        })),
      );
    }
    if (source.reminders.length > 0) {
      await tx.insert(jobReminders).values(
        source.reminders.map((r, position) => ({
          jobId: row.id,
          position,
          title: r.title,
          dueAt: r.dueAt,
          done: false,
        })),
      );
    }
    await tx.insert(jobActivity).values({
      jobId: row.id,
      type: "system",
      message: "Duplicated from an existing application",
      position: 0,
      createdAt: now,
    });
    return row.id;
  });

  return getJob(userId, newId);
}

/** Deletes a job the caller owns (children cascade). Returns whether a row was removed. */
export async function deleteJob(userId: string, id: string): Promise<boolean> {
  const deleted = await db
    .delete(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
    .returning({ id: jobs.id });
  return deleted.length > 0;
}

/** Deletes several of the caller's jobs; returns how many were removed. */
export async function bulkDeleteJobs(userId: string, ids: string[]): Promise<number> {
  const deleted = await db
    .delete(jobs)
    .where(and(inArray(jobs.id, ids), eq(jobs.userId, userId)))
    .returning({ id: jobs.id });
  return deleted.length;
}

/**
 * Called when an interview is scheduled: an application still at "applied" /
 * "waiting_response" has, by definition, been answered, so move it to
 * "interviewing" (stamping the response history and recording the change).
 * Runs inside the interview's transaction; `job` must be the row read FOR UPDATE.
 */
export async function advanceForScheduledInterview(tx: Tx, job: StatusState, now: Date) {
  if (!(PRE_INTERVIEW_STATUSES as readonly string[]).includes(job.applicationStatus)) return;

  const stamps = deriveStatusTimestamps(job, "interviewing", now);
  await tx
    .update(jobs)
    .set({ applicationStatus: "interviewing", ...stamps, updatedAt: now })
    .where(and(eq(jobs.id, job.id), eq(jobs.userId, job.userId)));
  await recordStatusChange(tx, job.id, job.applicationStatus, "interviewing", now, "interview scheduled");
}
