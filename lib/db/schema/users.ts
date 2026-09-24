import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { accountStatusEnum, userRoleEnum } from "./enums";

/**
 * Core identity table for jobseekers and employers.
 *
 * Admin accounts are deliberately out of scope here: JobTrail's admin
 * authentication is email/password based and lives in its own separate
 * table/auth path (added in a later phase), while every row in `users` is
 * created exclusively via Google SSO (see `user_accounts`). Do not add a
 * password column or an "admin" role value to this table - that would
 * re-merge the two auth systems this design keeps apart.
 */
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  picture: text("picture"),

  role: userRoleEnum("role").notNull(),
  accountStatus: accountStatusEnum("account_status")
    .notNull()
    .default("active"),
  emailVerified: boolean("email_verified").notNull().default(false),

  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),

  ...timestamps(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
