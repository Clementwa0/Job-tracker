import { boolean, index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./_helpers";

/**
 * Admin-managed categories for career resources. Stored in the database (never
 * hard-coded in the UI); `order` drives display order, `is_active` hides a
 * category from the public library without deleting it.
 */
export const resourceCategories = pgTable(
  "resource_categories",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    order: integer("order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),

    ...timestamps(),
  },
  (table) => [index("resource_categories_order_idx").on(table.order)],
);

export type ResourceCategoryRow = typeof resourceCategories.$inferSelect;
export type NewResourceCategoryRow = typeof resourceCategories.$inferInsert;
