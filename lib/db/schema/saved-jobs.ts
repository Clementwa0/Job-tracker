import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { jobPostings } from "./job-postings";
import { users } from "./users";

/**
 * Job-board postings a jobseeker has bookmarked.
 *
 * Keyed by the posting's public `slug` (that's what the job board links and
 * routes by), with a snapshot of the card fields so the dashboard can list
 * them without a join. `job_posting_id` is filled in when the slug matches a
 * real row in `job_postings`, and is nullable so sample/demo listings that
 * aren't in the table yet can still be saved.
 *
 * The unique (user_id, slug) constraint is what prevents duplicates, even
 * across devices or racing requests.
 */
export const savedJobs = pgTable(
  "saved_jobs",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    slug: text("slug").notNull(),
    jobPostingId: uuid("job_posting_id").references(() => jobPostings.id, {
      onDelete: "set null",
    }),

    title: text("title").notNull(),
    company: text("company").notNull(),
    location: text("location"),
    salary: text("salary"),

    savedAt: timestamp("saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("saved_jobs_user_slug_unique").on(table.userId, table.slug),
    index("saved_jobs_user_saved_at_idx").on(table.userId, table.savedAt),
  ],
);

export type SavedJobRow = typeof savedJobs.$inferSelect;
export type NewSavedJobRow = typeof savedJobs.$inferInsert;
