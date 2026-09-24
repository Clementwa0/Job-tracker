import { sql } from "drizzle-orm";
import { bigint, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { users } from "./users";

/**
 * Jobseeker-facing profile data, split out from `users` so the identity
 * table stays provider-agnostic and this can grow independently without
 * touching auth.
 *
 * One row per user with role "jobseeker" - enforced with a unique
 * constraint on `userId` rather than making `userId` the primary key, so a
 * future migration to a surrogate id doesn't require an app-visible change.
 *
 * Structured profile data is kept here alongside the user's direct
 * contact/links and job-search preferences. Resume data remains separate;
 * the dashboard's profile-completeness score and job recommendations combine
 * both sources.
 */
export const candidateProfiles = pgTable("candidate_profiles", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  headline: text("headline"),
  location: text("location"),
  phone: text("phone"),
  bio: text("bio"),

  website: text("website"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),

  yearsExperience: integer("years_experience"),
  skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
  education: jsonb("education").$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
  certifications: jsonb("certifications").$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),
  workExperience: jsonb("work_experience").$type<unknown[]>().notNull().default(sql`'[]'::jsonb`),

  // Job-search preferences
  targetRoles: text("target_roles").array().notNull().default(sql`'{}'::text[]`),
  preferredLocations: text("preferred_locations")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  preferredJobTypes: text("preferred_job_types")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  preferredWorkModes: text("preferred_work_modes")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  expectedSalaryMin: bigint("expected_salary_min", { mode: "number" }),
  expectedSalaryMax: bigint("expected_salary_max", { mode: "number" }),
  salaryCurrency: text("salary_currency").notNull().default("KES"),

  ...timestamps(),
});

export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type NewCandidateProfile = typeof candidateProfiles.$inferInsert;
