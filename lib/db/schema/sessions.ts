import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";
import { adminUsers } from "./admin-users";
import { users } from "./users";

/**
 * Server-side refresh-token sessions. Only a SHA-256 digest of the refresh
 * JWT is stored, never the token itself.
 *
 * A session belongs to EITHER a regular user OR an admin (they live in
 * different tables), enforced by the check constraint below so a row can
 * never point at both or at neither.
 *
 * `refresh_token_hash` is deliberately a plain index, not unique: two
 * sign-ins for the same account within the same second produce byte-identical
 * JWTs (same payload, same `iat`), which would otherwise collide.
 */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    adminId: uuid("admin_id").references(() => adminUsers.id, {
      onDelete: "cascade",
    }),

    refreshTokenHash: text("refresh_token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    ...timestamps(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_admin_id_idx").on(table.adminId),
    index("sessions_refresh_token_hash_idx").on(table.refreshTokenHash),
    index("sessions_expires_at_idx").on(table.expiresAt),
    check(
      "sessions_exactly_one_subject",
      sql`(${table.userId} IS NOT NULL) <> (${table.adminId} IS NOT NULL)`,
    ),
  ],
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
