import { nextAvailableSlug } from "./slug";
import type { PaginatedMeta } from "@/types/admin";

export function iso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

/** Escapes LIKE/ILIKE wildcards so search input is matched literally. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function buildMeta(page: number, limit: number, total: number): PaginatedMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** `page` / `limit` from a query string, clamped (default 12, max 50). */
export function parseListParams(params: URLSearchParams, defaultLimit = 12, maxLimit = 50) {
  const page = Math.max(1, Math.floor(Number(params.get("page"))) || 1);
  const rawLimit = Math.floor(Number(params.get("limit")));
  const limit = rawLimit >= 1 ? Math.min(rawLimit, maxLimit) : defaultLimit;
  return { page, limit };
}

/**
 * Picks a free slug for `base`. `fetchTaken` receives a LIKE pattern
 * (`base%`, already escaped) and returns the existing slugs matching it.
 * A concurrent insert can still win the race; the unique constraint then
 * fails and the caller retries via `withSlugRetry`.
 */
export async function pickSlug(
  base: string,
  fetchTaken: (likePattern: string) => Promise<string[]>,
): Promise<string> {
  return nextAvailableSlug(base, await fetchTaken(`${escapeLike(base)}%`));
}

/** Re-runs `attempt` when it loses a slug-uniqueness race. */
export async function withSlugRetry<T>(
  isSlugConflict: (error: unknown) => boolean,
  attempt: () => Promise<T>,
  tries = 4,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await attempt();
    } catch (error) {
      if (!isSlugConflict(error)) throw error;
      lastError = error;
    }
  }
  throw lastError;
}
