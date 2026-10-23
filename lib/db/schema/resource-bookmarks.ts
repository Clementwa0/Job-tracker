import { index, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { resources } from "./resources";
import { users } from "./users";

/**
 * A resource a jobseeker has bookmarked. The unique (user_id, resource_id)
 * constraint prevents duplicate bookmarks even across devices or racing
 * requests. Deleting either side removes the bookmark.
 */
export const resourceBookmarks = pgTable(
  "resource_bookmarks",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("resource_bookmarks_user_resource_unique").on(table.userId, table.resourceId),
    index("resource_bookmarks_user_created_idx").on(table.userId, table.createdAt),
    index("resource_bookmarks_resource_idx").on(table.resourceId),
  ],
);

export type ResourceBookmarkRow = typeof resourceBookmarks.$inferSelect;
export type NewResourceBookmarkRow = typeof resourceBookmarks.$inferInsert;
