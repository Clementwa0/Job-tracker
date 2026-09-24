import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { companies } from "./companies";
import { applyMethodTypeEnum, jobPostingStatusEnum } from "./enums";
import { users } from "./users";

/**
 * Public job-board postings published by employers. (Not to be confused
 * with `jobs`, which are a jobseeker's own tracked applications.)
 *
 * The old embedded `applyMethod: { type, value }` object is flattened into
 * `apply_method_type` + `apply_method_value`; map it back to the nested
 * `ApplyMethod` shape (types/jobPosting.ts) at the API boundary.
 */
export const jobPostings = pgTable(
  "job_postings",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),

    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    companyName: text("company_name").notNull().default(""),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    category: text("category").notNull().default(""),

    description: text("description").notNull().default(""),
    responsibilities: text("responsibilities").notNull().default(""),
    // "Qualifications" in the posting form/UI - kept as `requirements` at the
    // schema/DB level to avoid a duplicate column and preserve existing data.
    requirements: text("requirements").notNull().default(""),
    location: text("location").notNull().default(""),

    salaryMin: bigint("salary_min", { mode: "number" }),
    salaryMax: bigint("salary_max", { mode: "number" }),
    salaryCurrency: text("salary_currency").notNull().default("KES"),

    jobType: text("job_type").notNull().default("full-time"),
    workMode: text("work_mode").notNull().default("remote"),
    // "Skills" in the posting form/UI - kept as `tags` at the schema/DB
    // level to avoid a duplicate column and preserve existing data.
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),

    experienceLevel: text("experience_level").notNull().default(""),
    educationLevel: text("education_level").notNull().default(""),
    certifications: text("certifications").notNull().default(""),

    applyMethodType: applyMethodTypeEnum("apply_method_type")
      .notNull()
      .default("external_link"),
    applyMethodValue: text("apply_method_value").notNull().default(""),

    status: jobPostingStatusEnum("status").notNull().default("draft"),

    publishedAt: timestamp("published_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    applicationDeadline: timestamp("application_deadline", {
      withTimezone: true,
    }),

    viewCount: integer("view_count").notNull().default(0),

    ...timestamps(),
  },
  (table) => [
    index("job_postings_company_id_idx").on(table.companyId),
    index("job_postings_created_by_idx").on(table.createdBy),
    index("job_postings_status_idx").on(table.status),
  ],
);

export type JobPosting = typeof jobPostings.$inferSelect;
export type NewJobPosting = typeof jobPostings.$inferInsert;
