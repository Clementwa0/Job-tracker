"use client";

import type { SaveJobInput } from "@/lib/savedJobs/types";

const SAVED_JOBS_KEY = "saved_jobs.v1";

function remove(key: string) {
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}

/** Moves locally stored saved jobs to the API. Returns how many were imported. */
export async function migrateLegacySavedJobs(
  save: (job: SaveJobInput) => Promise<unknown>,
): Promise<number> {
  if (typeof window === "undefined") return 0;
  let stored: unknown;
  try {
    const raw = window.localStorage.getItem(SAVED_JOBS_KEY);
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    stored = null;
  }
  if (!Array.isArray(stored)) {
    remove(SAVED_JOBS_KEY);
    return 0;
  }
  const jobs = [...stored].reverse();
  let imported = 0;
  for (const item of jobs) {
    if (!item || typeof item.slug !== "string" || !item.title || !item.company) continue;
    try {
      await save({ slug: item.slug, title: item.title, company: item.company, location: item.location, salary: item.salary });
      imported++;
    } catch {
      return imported;
    }
  }
  remove(SAVED_JOBS_KEY);
  return imported;
}
