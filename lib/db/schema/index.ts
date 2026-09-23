/**
 * Drizzle schema entry point — re-exports every table/enum/relations module
 * so `import * as schema from "@/lib/db/schema"` (used by `lib/db/index.ts`)
 * and `drizzle.config.ts` both see the full schema.
 *
 * Domains:
 *  - identity:   users, user_accounts, candidate_profiles, employer_profiles
 *  - admin:      admin_users (separate from `users` on purpose)
 *  - auth:       sessions (refresh tokens)
 *  - employers:  companies, job_postings
 *  - jobseekers: jobs (+ job_attachments / job_activity / job_reminders),
 *                saved_jobs, interviews, resumes
 *  - platform:   notifications, audit_logs
 */
export * from "./enums";
export * from "./application-status";
export * from "./users";
export * from "./user-accounts";
export * from "./candidate-profiles";
export * from "./employer-profiles";
export * from "./admin-users";
export * from "./sessions";
export * from "./companies";
export * from "./job-postings";
export * from "./jobs";
export * from "./saved-jobs";
export * from "./interviews";
export * from "./resumes";
export * from "./notifications";
export * from "./audit-logs";
export * from "./relations";
