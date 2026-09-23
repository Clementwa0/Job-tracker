import { timestamp } from "drizzle-orm/pg-core";

/**
 * Standard `created_at` / `updated_at` columns shared by every table.
 *
 * `updatedAt` is maintained application-side by Drizzle (`$onUpdate`) rather
 * than a DB trigger — simple, portable across any Postgres host, and good
 * enough for this app's needs.
 */
export function timestamps() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
}
