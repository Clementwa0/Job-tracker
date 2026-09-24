import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { accountStatusEnum } from "./enums";

/**
 * Admin accounts - a wholly separate identity system from `users`.
 *
 * Admins sign in with email + password (scrypt hash, see
 * lib/auth/password.ts); jobseekers and employers only ever use Google SSO
 * and live in `users`. There is no self-service admin registration: create
 * one with `pnpm db:create-admin`.
 */
export const adminUsers = pgTable("admin_users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: text("name").notNull(),
  // Always stored lowercased + trimmed by the app.
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  accountStatus: accountStatusEnum("account_status")
    .notNull()
    .default("active"),

  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),

  ...timestamps(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
