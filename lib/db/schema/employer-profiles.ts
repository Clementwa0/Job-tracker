import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { companies } from "./companies";
import { users } from "./users";

/**
 * Employer-facing profile data for a user with role "employer" - the
 * person, plus the company/organization they represent (`company_id`,
 * null until they create or join one).
 *
 * One row per user - enforced with a unique constraint on `userId`, same
 * pattern as `candidate_profiles`.
 */
export const employerProfiles = pgTable(
  "employer_profiles",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),

    jobTitle: text("job_title"),
    department: text("department"),
    phone: text("phone"),

    ...timestamps(),
  },
  (table) => [index("employer_profiles_company_id_idx").on(table.companyId)],
);

export type EmployerProfile = typeof employerProfiles.$inferSelect;
export type NewEmployerProfile = typeof employerProfiles.$inferInsert;
