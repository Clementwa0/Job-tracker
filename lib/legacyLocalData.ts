"use client";

/**
 * One-time import of data that older builds kept in the browser's
 * localStorage (resumes, saved jobs) into the user's account.
 *
 * Each migration copies the data to the API first, then deletes the local
 * copy — so once it has run, nothing job-seeker related remains in
 * localStorage, and a failure part-way simply retries on the next visit
 * (both APIs are safe to retry: saved jobs are idempotent, and each resume
 * is removed locally the moment it is created remotely).
 *
 * This file can be deleted once existing users have had time to migrate.
 */

import { normalizeResume, type ResumeData, type ResumeMeta } from "@/types/resume-builder";
import type { SaveJobInput } from "@/lib/savedJobs/types";

const RESUME_INDEX_KEY = "resumes-index.v1";
const RESUME_ITEM_KEY = (id: string) => `resume.v1.${id}`;
const RESUME_DRAFT_KEY = "resume-builder.v1";
const SAVED_JOBS_KEY = "saved_jobs.v1";

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

let resumeMigration: Promise<number> | null = null;

/**
 * Moves locally stored resumes to the API. Returns how many were imported.
 * Single-flight: several components can ask at once (each dashboard card that
 * lists resumes does), but only one import runs, so nothing is created twice.
 */
export function migrateLegacyResumes(
  create: (resume: ResumeData) => Promise<unknown>,
): Promise<number> {
  if (typeof window === "undefined") return Promise.resolve(0);
  resumeMigration ??= runResumeMigration(create).finally(() => {
    resumeMigration = null;
  });
  return resumeMigration;
}

async function runResumeMigration(
  create: (resume: ResumeData) => Promise<unknown>,
): Promise<number> {
  let imported = 0;

  const index = readJson(RESUME_INDEX_KEY);
  const metas: ResumeMeta[] = Array.isArray(index) ? (index as ResumeMeta[]) : [];
  const remaining = [...metas];

  for (const meta of metas) {
    const raw = readJson(RESUME_ITEM_KEY(meta.id));
    if (raw && typeof raw === "object") {
      const data = normalizeResume(raw as Partial<ResumeData> & Record<string, unknown>);
      await create({ ...data, meta: { ...meta, name: meta.name || "Imported resume" } });
      imported++;
    }
    // Copied (or empty): drop it locally right away so a later failure can't duplicate it.
    remove(RESUME_ITEM_KEY(meta.id));
    remaining.splice(remaining.findIndex((m) => m.id === meta.id), 1);
    if (remaining.length > 0) writeJson(RESUME_INDEX_KEY, remaining);
    else remove(RESUME_INDEX_KEY);
  }

  // Draft from the old single-document builder, if it has real content.
  const draft = readJson(RESUME_DRAFT_KEY);
  if (draft && typeof draft === "object") {
    const data = normalizeResume(draft as Partial<ResumeData> & Record<string, unknown>);
    const hasContent =
      data.contact.fullName.trim() || data.summary.trim() || data.experience.length > 0;
    if (hasContent) {
      const now = Date.now();
      await create({
        ...data,
        meta: { id: "", name: data.contact.fullName || "Imported draft", createdAt: now, updatedAt: now },
      });
      imported++;
    }
    remove(RESUME_DRAFT_KEY);
  }

  return imported;
}

/** Moves locally stored saved jobs to the API. Returns how many were imported. */
export async function migrateLegacySavedJobs(
  save: (job: SaveJobInput) => Promise<unknown>,
): Promise<number> {
  if (typeof window === "undefined") return 0;

  const stored = readJson(SAVED_JOBS_KEY);
  if (!Array.isArray(stored)) {
    remove(SAVED_JOBS_KEY);
    return 0;
  }

  // Oldest first, so the newest ends up with the newest saved_at.
  const jobs = [...stored].reverse();
  let imported = 0;

  for (const item of jobs) {
    if (!item || typeof item.slug !== "string" || !item.title || !item.company) continue;
    try {
      await save({
        slug: item.slug,
        title: item.title,
        company: item.company,
        location: item.location,
        salary: item.salary,
      });
      imported++;
    } catch {
      // Keep the local copy and retry next visit (saving is idempotent).
      return imported;
    }
  }

  remove(SAVED_JOBS_KEY);
  return imported;
}
