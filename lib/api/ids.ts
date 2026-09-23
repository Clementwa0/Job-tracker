import { isUuid } from "@/lib/uuid";

export const MAX_BULK_IDS = 100;

/**
 * Validates a list of record ids from a request body: 1..MAX_BULK_IDS unique
 * UUIDs. Returns the ids, or an error message to send back as a 400.
 */
export function parseIdList(value: unknown): { ids: string[] } | { error: string } {
  if (!Array.isArray(value) || value.length === 0) {
    return { error: '"ids" must be a non-empty list.' };
  }
  if (value.length > MAX_BULK_IDS) {
    return { error: `You can act on at most ${MAX_BULK_IDS} items at once.` };
  }
  if (!value.every(isUuid)) return { error: '"ids" must only contain valid ids.' };
  return { ids: [...new Set(value)] };
}
