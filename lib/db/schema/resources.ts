import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { StoredFile } from "../../resources/constants";
import { adminUsers } from "./admin-users";
import { timestamps } from "./_helpers";
import { resourceStatusEnum, resourceTypeEnum } from "./enums";
import { resourceCategories } from "./resource-categories";

/**
 * A career resource (article, guide, template, checklist or video) authored
 * by an admin and shown on the public resource library.
 *
 * `content` holds sanitized HTML produced by the Tiptap editor (sanitized on
 * every write - see lib/resources/sanitize.ts). `cover_image` / `attachment`
 * are Cloudinary file metadata; the assets themselves never touch our server
 * disk. Only `status = 'published'` rows are ever served publicly.
 */
export const resources = pgTable(
  "resources",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),

    // RESTRICT: a category that still has resources cannot be deleted.
    categoryId: uuid("category_id")
      .notNull()
      .references(() => resourceCategories.id, { onDelete: "restrict" }),
    type: resourceTypeEnum("type").notNull().default("article"),

    content: text("content").notNull().default(""),
    coverImage: jsonb("cover_image").$type<StoredFile>(),
    attachment: jsonb("attachment").$type<StoredFile>(),
    externalUrl: text("external_url"),

    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    featured: boolean("featured").notNull().default(false),
    status: resourceStatusEnum("status").notNull().default("draft"),
    views: integer("views").notNull().default(0),

    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),

    publishedAt: timestamp("published_at", { withTimezone: true }),
    // SET NULL so resources outlive the admin account that wrote them.
    createdBy: uuid("created_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),

    ...timestamps(),
  },
  (table) => [
    index("resources_status_published_idx").on(table.status, table.publishedAt),
    index("resources_category_idx").on(table.categoryId),
    index("resources_featured_idx").on(table.featured),
    index("resources_created_at_idx").on(table.createdAt),
  ],
);

export type ResourceRow = typeof resources.$inferSelect;
export type NewResourceRow = typeof resources.$inferInsert;
