import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Jobseeker vs employer only. Admin is intentionally NOT a value here —
 * admin authentication is a separate system (its own table/auth path, added
 * in a later phase) and must never share the `users` table or this enum.
 */
export const userRoleEnum = pgEnum("user_role", ["jobseeker", "employer"]);

export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "suspended",
]);

/**
 * Identity provider behind a `user_accounts` row. JobTrail currently only
 * offers Google SSO for jobseekers/employers, but this is an enum (not a
 * boolean) so another provider can be added later without a schema change
 * beyond adding a value.
 */
export const authProviderEnum = pgEnum("auth_provider", ["google"]);

/* ------------------------------------------------------------------ */
/* Domain enums (moved over from the former Mongoose models)           */
/* ------------------------------------------------------------------ */

export const jobPriorityEnum = pgEnum("job_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const jobActivityTypeEnum = pgEnum("job_activity_type", [
  "note",
  "status",
  "reminder",
  "system",
]);

export const interviewStageEnum = pgEnum("interview_stage", [
  "phone",
  "hr",
  "technical",
  "behavioral",
  "onsite",
  "final",
]);

export const interviewStatusEnum = pgEnum("interview_status", [
  "scheduled",
  "completed",
  "canceled",
  "passed",
  "failed",
  "rescheduled",
]);

export const companyStatusEnum = pgEnum("company_status", [
  "pending",
  "approved",
  "suspended",
]);

export const jobPostingStatusEnum = pgEnum("job_posting_status", [
  "draft",
  "pending_review",
  "published",
  "closed",
]);

export const applyMethodTypeEnum = pgEnum("apply_method_type", [
  "external_link",
  "email",
  "whatsapp",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "in_app",
  "email",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "read",
  "failed",
]);
