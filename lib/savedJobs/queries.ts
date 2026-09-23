import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { jobPostings, savedJobs, type SavedJobRow } from "@/lib/db/schema";
import type { SavedJobInput, SavedJobUpdate } from "@/lib/savedJobs/sanitize";

/** Per-user cap so the list can't grow without bound. */
export const MAX_SAVED_JOBS = 500;

export class SavedJobLimitError extends Error {}

/** Shape shared with the client (`SavedJob` in lib/savedJobs.ts). */
export interface SavedJobDto {
  slug: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  savedAt: string;
}

export function toSavedJobDto(row: SavedJobRow): SavedJobDto {
  return {
    slug: row.slug,
    title: row.title,
    company: row.company,
    location: row.location ?? undefined,
    salary: row.salary ?? undefined,
    savedAt: row.savedAt.toISOString(),
  };
}

export async function listSavedJobs(userId: string): Promise<SavedJobDto[]> {
  const rows = await db
    .select()
    .from(savedJobs)
    .where(eq(savedJobs.userId, userId))
    .orderBy(desc(savedJobs.savedAt));
  return rows.map(toSavedJobDto);
}

/**
 * Saves a posting for the user. Idempotent: saving the same slug twice (from
 * two tabs, two devices, or a double click) leaves one row and reports
 * `created: false` the second time. The unique (user_id, slug) constraint,
 * not a read-then-write check, is what guarantees that.
 */
export async function saveJob(
  userId: string,
  input: SavedJobInput,
): Promise<{ created: boolean; job: SavedJobDto }> {
  const [existing] = await db
    .select()
    .from(savedJobs)
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.slug, input.slug)))
    .limit(1);
  if (existing) return { created: false, job: toSavedJobDto(existing) };

  const [{ n }] = await db
    .select({ n: count() })
    .from(savedJobs)
    .where(eq(savedJobs.userId, userId));
  if (n >= MAX_SAVED_JOBS) {
    throw new SavedJobLimitError(`You can save up to ${MAX_SAVED_JOBS} jobs.`);
  }

  // Link to the real posting when the slug is one we have.
  const [posting] = await db
    .select({ id: jobPostings.id })
    .from(jobPostings)
    .where(eq(jobPostings.slug, input.slug))
    .limit(1);

  const inserted = await db
    .insert(savedJobs)
    .values({
      userId,
      slug: input.slug,
      jobPostingId: posting?.id ?? null,
      title: input.title,
      company: input.company,
      location: input.location,
      salary: input.salary,
    })
    .onConflictDoNothing({ target: [savedJobs.userId, savedJobs.slug] })
    .returning();

  if (inserted.length > 0) return { created: true, job: toSavedJobDto(inserted[0]) };

  // Lost a race with a concurrent save of the same slug: return that row.
  const [winner] = await db
    .select()
    .from(savedJobs)
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.slug, input.slug)))
    .limit(1);
  return { created: false, job: toSavedJobDto(winner) };
}

/** Removes a saved job. Idempotent; returns whether a row was actually deleted. */
export async function removeSavedJob(userId: string, slug: string): Promise<boolean> {
  const deleted = await db
    .delete(savedJobs)
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.slug, slug)))
    .returning({ id: savedJobs.id });
  return deleted.length > 0;
}

/** One saved job, only if it's the caller's. */
export async function getSavedJob(userId: string, slug: string): Promise<SavedJobDto | null> {
  const [row] = await db
    .select()
    .from(savedJobs)
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.slug, slug)))
    .limit(1);
  return row ? toSavedJobDto(row) : null;
}

/** Updates the snapshot fields of a saved job the caller owns; null if it isn't theirs. */
export async function updateSavedJob(
  userId: string,
  slug: string,
  patch: SavedJobUpdate,
): Promise<SavedJobDto | null> {
  const [row] = await db
    .update(savedJobs)
    .set(patch)
    .where(and(eq(savedJobs.userId, userId), eq(savedJobs.slug, slug)))
    .returning();
  return row ? toSavedJobDto(row) : null;
}
