import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { interviewStageEnum, interviewStatusEnum } from "./enums";
import { jobs } from "./jobs";
import { users } from "./users";

export const interviews = pgTable(
  "interviews",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Interviews outlive their application if it's deleted.
    jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),

    stage: interviewStageEnum("stage").notNull().default("phone"),
    status: interviewStatusEnum("status").notNull().default("scheduled"),

    interviewDate: timestamp("interview_date", { withTimezone: true }).notNull(),
    location: text("location").notNull().default(""),
    notes: text("notes").notNull().default(""),

    ...timestamps(),
  },
  (table) => [
    index("interviews_user_id_idx").on(table.userId),
    index("interviews_job_id_idx").on(table.jobId),
    index("interviews_user_date_idx").on(table.userId, table.interviewDate),
    // The same round can't be booked twice for one application at one time.
    unique("interviews_user_job_date_stage_unique").on(
      table.userId,
      table.jobId,
      table.interviewDate,
      table.stage,
    ),
  ],
);

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
