/**
 * The one list of valid application statuses. Kept free of any imports so
 * the database schema (CHECK constraint), the API (validation, stats) and
 * the UI can all share it without pulling drizzle into the browser bundle.
 */
export const APPLICATION_STATUSES = [
  "applied",
  "waiting_response",
  "interviewing",
  "offer",
  "rejected",
  "ghosted",
  "completed",
] as const;

export type ApplicationStatusValue = (typeof APPLICATION_STATUSES)[number];
