import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { companyStatusEnum } from "./enums";
import { users } from "./users";

/**
 * An employer-side organisation (the "employers" domain). Employer users
 * are linked to one via `employer_profiles.company_id`.
 */
export const companies = pgTable(
  "companies",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),

    description: text("description").notNull().default(""),
    website: text("website").notNull().default(""),
    location: text("location").notNull().default(""),
    industry: text("industry").notNull().default(""),
    logo: text("logo").notNull().default(""),

    status: companyStatusEnum("status").notNull().default("pending"),

    // RESTRICT: a user who created a company can't be hard-deleted out from
    // under it — reassign or remove the company first.
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    ...timestamps(),
  },
  (table) => [
    index("companies_created_by_idx").on(table.createdBy),
    index("companies_status_idx").on(table.status),
  ],
);

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
