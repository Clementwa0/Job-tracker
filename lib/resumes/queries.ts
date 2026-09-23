import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { resumes, type Resume as ResumeRow } from "@/lib/db/schema";
import type { ResumeValues } from "@/lib/resumes/sanitize";
import type { ResumeData, ResumeMeta } from "@/types/resume-builder";

/** Per-user cap on stored resumes. */
export const MAX_RESUMES = 50;

export class ResumeLimitError extends Error {}

export function toResumeMeta(row: Pick<ResumeRow, "id" | "title" | "createdAt" | "updatedAt">): ResumeMeta {
  return {
    id: row.id,
    name: row.title,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  };
}

/** Row → the `ResumeData` shape the builder edits (`meta` carries id/name/times). */
export function toResumeData(row: ResumeRow): ResumeData {
  return {
    meta: toResumeMeta(row),
    template: row.template as ResumeData["template"],
    accent: row.accent,
    contact: row.contact as unknown as ResumeData["contact"],
    summary: row.summary,
    experience: row.experience as ResumeData["experience"],
    education: row.education as ResumeData["education"],
    projects: row.projects as ResumeData["projects"],
    skills: row.skills as ResumeData["skills"],
    certifications: row.certifications as ResumeData["certifications"],
    languages: row.languages as ResumeData["languages"],
  };
}

/** The user's resumes, most recently edited first (metadata only — no section bodies). */
export async function listResumes(userId: string): Promise<ResumeMeta[]> {
  const rows = await db
    .select({
      id: resumes.id,
      title: resumes.title,
      createdAt: resumes.createdAt,
      updatedAt: resumes.updatedAt,
    })
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt));
  return rows.map(toResumeMeta);
}

/** One resume, only if it belongs to `userId`. */
export async function getResume(userId: string, id: string): Promise<ResumeData | null> {
  const [row] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .limit(1);
  return row ? toResumeData(row) : null;
}

export async function createResume(userId: string, values: ResumeValues): Promise<ResumeData> {
  const [{ n }] = await db
    .select({ n: count() })
    .from(resumes)
    .where(eq(resumes.userId, userId));
  if (n >= MAX_RESUMES) {
    throw new ResumeLimitError(`You can keep up to ${MAX_RESUMES} resumes.`);
  }

  const [row] = await db
    .insert(resumes)
    .values({ ...(values as Partial<typeof resumes.$inferInsert>), userId })
    .returning();
  return toResumeData(row);
}

/** Updates a resume the caller owns. Returns null if it doesn't exist / isn't theirs. */
export async function updateResume(
  userId: string,
  id: string,
  values: ResumeValues,
): Promise<ResumeData | null> {
  const [row] = await db
    .update(resumes)
    .set({ ...(values as Partial<typeof resumes.$inferInsert>), updatedAt: new Date() })
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .returning();
  return row ? toResumeData(row) : null;
}

/** Deletes a resume the caller owns. Returns whether a row was removed. */
export async function deleteResume(userId: string, id: string): Promise<boolean> {
  const deleted = await db
    .delete(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .returning({ id: resumes.id });
  return deleted.length > 0;
}
