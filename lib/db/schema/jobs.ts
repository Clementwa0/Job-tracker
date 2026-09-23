import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { APPLICATION_STATUSES } from "./application-status";
import { jobActivityTypeEnum, jobPriorityEnum } from "./enums";
import { jobPostings } from "./job-postings";
import { users } from "./users";

/**
 * A jobseeker's tracked job application.
 *
 * Free-form strings that the UI treats as open vocabularies (application
 * status, job type, work mode) stay `text`; `priority` is a real enum.
 *
 * The former embedded arrays (attachments / activity / reminders) are now
 * child tables below. The API still accepts and returns them as arrays on
 * the job; on update the supplied array replaces the stored rows.
 */
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    jobTitle: text("job_title").notNull().default(""),
    companyName: text("company_name").notNull().default(""),
    companyLogo: text("company_logo").notNull().default(""),
    location: text("location").notNull().default(""),
    jobType: text("job_type").notNull().default(""),
    workMode: text("work_mode").notNull().default(""),

    applicationDate: timestamp("application_date", { withTimezone: true }),
    applicationDeadline: timestamp("application_deadline", {
      withTimezone: true,
    }),
    source: text("source").notNull().default(""),
    // One of APPLICATION_STATUSES (see ./application-status.ts).
    applicationStatus: text("application_status").notNull().default("applied"),
    priority: jobPriorityEnum("priority").notNull().default("medium"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),

    salaryMin: bigint("salary_min", { mode: "number" }),
    salaryMax: bigint("salary_max", { mode: "number" }),
    salaryCurrency: text("salary_currency").notNull().default("KES"),
    salaryRange: text("salary_range").notNull().default(""),

    contactPerson: text("contact_person").notNull().default(""),
    contactEmail: text("contact_email").notNull().default(""),
    contactPhone: text("contact_phone").notNull().default(""),
    recruiterLinkedIn: text("recruiter_linkedin").notNull().default(""),

    resumeFile: text("resume_file"),
    coverLetterFile: text("cover_letter_file"),

    jobPostingUrl: text("job_posting_url").notNull().default(""),
    jobDescription: text("job_description").notNull().default(""),

    matchScore: doublePrecision("match_score"),
    matchAnalysis: jsonb("match_analysis").$type<Record<string, unknown>>(),

    notes: text("notes").notNull().default(""),
    isArchived: boolean("is_archived").notNull().default(false),

    // History markers maintained by the server (see lib/jobs/status.ts): the
    // first time an employer really responded (interviewing / offer /
    // rejected) and the first time an offer was made. Never cleared, so the
    // fact survives later status changes; every transition is also recorded
    // as a `status` row in job_activity.
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    offerAt: timestamp("offer_at", { withTimezone: true }),

    // Set when the application was created from a public job-board posting.
    jobPostingId: uuid("job_posting_id").references(() => jobPostings.id, {
      onDelete: "set null",
    }),

    ...timestamps(),
  },
  (table) => [
    index("jobs_user_id_idx").on(table.userId),
    index("jobs_user_status_idx").on(table.userId, table.applicationStatus),
    index("jobs_job_posting_id_idx").on(table.jobPostingId),
    // One tracked application per posting per user. NULLs are distinct in a
    // unique constraint, so manually-added jobs (no posting) are unaffected.
    unique("jobs_user_posting_unique").on(table.userId, table.jobPostingId),
    // One spelling of each status, enforced in the database as well as the API.
    check(
      "jobs_application_status_check",
      sql`${table.applicationStatus} in (${sql.raw(
        APPLICATION_STATUSES.map((s) => `'${s}'`).join(", "),
      )})`,
    ),
  ],
);

export const jobAttachments = pgTable(
  "job_attachments",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    // Preserves the order the client sent the array in.
    position: integer("position").notNull().default(0),

    name: text("name").notNull().default(""),
    url: text("url").notNull().default(""),
    type: text("type"),
    size: bigint("size", { mode: "number" }),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("job_attachments_job_id_idx").on(table.jobId)],
);

export const jobActivity = pgTable(
  "job_activity",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),

    type: jobActivityTypeEnum("type").notNull().default("note"),
    message: text("message").notNull(),
    meta: jsonb("meta").$type<Record<string, unknown>>(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("job_activity_job_id_idx").on(table.jobId)],
);

export const jobReminders = pgTable(
  "job_reminders",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),

    title: text("title").notNull().default(""),
    dueAt: timestamp("due_at", { withTimezone: true }),
    done: boolean("done").notNull().default(false),
  },
  (table) => [
    index("job_reminders_job_id_idx").on(table.jobId),
    index("job_reminders_due_at_idx").on(table.dueAt),
  ],
);

export type JobRow = typeof jobs.$inferSelect;
export type NewJobRow = typeof jobs.$inferInsert;
export type JobAttachmentRow = typeof jobAttachments.$inferSelect;
export type NewJobAttachmentRow = typeof jobAttachments.$inferInsert;
export type JobActivityRow = typeof jobActivity.$inferSelect;
export type NewJobActivityRow = typeof jobActivity.$inferInsert;
export type JobReminderRow = typeof jobReminders.$inferSelect;
export type NewJobReminderRow = typeof jobReminders.$inferInsert;
