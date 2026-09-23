"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/hooks/AuthContext";
import { getApiErrorMessage } from "@/lib/apiError";
import { useResource } from "@/lib/client/useResource";
import { migrateLegacySavedJobs } from "@/lib/legacyLocalData";
import { savedJobService } from "@/lib/savedJobs/service";
import type { SavedJob, SaveJobInput } from "@/lib/savedJobs/types";

export type { SavedJob, SaveJobInput } from "@/lib/savedJobs/types";

/** How often a visible tab re-checks the server, so other devices' changes show up. */
const SYNC_INTERVAL_MS = 60_000;

const migrationStarted = new Set<string>();

/**
 * The signed-in job seeker's saved jobs, stored in PostgreSQL.
 *
 * - Every component using this hook shares one list and stays in sync.
 * - Toggling updates the UI immediately, then confirms with the server and
 *   rolls back if that fails.
 * - The list refreshes on tab focus and periodically, so saves made on
 *   another device appear here without a reload.
 * - Saving requires a job-seeker account: signed-out visitors are sent to
 *   sign in instead.
 */
export function useSavedJobs() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const canSave = user?.role === "user";
  const key = canSave ? `saved-jobs:${user._id}` : null;

  const { data, refresh, mutate } = useResource<SavedJob[]>(
    key,
    () => savedJobService.list(),
    { pollMs: SYNC_INTERVAL_MS },
  );
  const jobs = data ?? [];

  // Import anything an older version left in this browser, once per account
  // (module-level guard: many cards on a page use this hook at the same time).
  useEffect(() => {
    if (!key || migrationStarted.has(key)) return;
    migrationStarted.add(key);
    void migrateLegacySavedJobs((job) => savedJobService.save(job)).then((n) => {
      if (n > 0) void refresh();
    });
  }, [key, refresh]);

  const has = useCallback((slug: string) => jobs.some((j) => j.slug === slug), [jobs]);

  /** Saves or unsaves. Resolves to whether the job is saved afterwards. */
  const toggle = useCallback(
    async (job: SaveJobInput): Promise<boolean> => {
      if (!canSave) {
        if (!isAuthenticated) {
          toast.info("Sign in to save jobs.");
          router.push("/login");
        } else {
          toast.info("Saving jobs is available to job seeker accounts.");
        }
        return false;
      }

      const wasSaved = jobs.some((j) => j.slug === job.slug);
      const previous = jobs;

      mutate(
        wasSaved
          ? previous.filter((j) => j.slug !== job.slug)
          : [{ ...job, savedAt: new Date().toISOString() }, ...previous],
      );

      try {
        if (wasSaved) await savedJobService.remove(job.slug);
        else await savedJobService.save(job);
        void refresh();
        return !wasSaved;
      } catch (error) {
        mutate(previous);
        toast.error(getApiErrorMessage(error));
        return wasSaved;
      }
    },
    [canSave, isAuthenticated, jobs, mutate, refresh, router],
  );

  return { jobs, toggle, has };
}
