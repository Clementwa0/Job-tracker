import { invalidateResources } from "@/lib/client/useResource";

/**
 * Cache keys for the jobseeker's server-backed data, shared by every page
 * (dashboard, applications, interviews, calendar, analytics). All include the
 * user's id so nothing leaks between accounts.
 */
export const jobsKey = (userId: string) => `jobs:${userId}`;
export const interviewsKey = (userId: string) => `interviews:${userId}`;
export const jobStatsKey = (userId: string) => `job-stats:${userId}`;

const JOB_DATA_PREFIXES = ["jobs:", "interviews:", "job-stats:"];

/**
 * Call after any successful create / update / delete of an application or an
 * interview. They are linked on the server (scheduling an interview can move
 * an application to "interviewing", deleting an application removes its
 * interviews, stats are derived from both), so everything is refreshed
 * together and every page on screen updates, not just the one that saved.
 */
export function invalidateJobData() {
  invalidateResources(...JOB_DATA_PREFIXES);
}
