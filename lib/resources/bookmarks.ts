import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { PG_UNIQUE_VIOLATION, pgErrorCode } from "@/lib/db/errors";
import { resourceBookmarks, resourceCategories, resources } from "@/lib/db/schema";
import type { ResourceListItem } from "@/types/resource";
import { resourceListColumns, toListItem } from "./queries";
import { buildMeta } from "./shared";

/** A jobseeker's bookmarks (published resources only), newest bookmark first. */
export async function listBookmarkedResources(userId: string, page: number, limit: number) {
  const where = and(eq(resourceBookmarks.userId, userId), eq(resources.status, "published"));

  const [rows, totalRows] = await Promise.all([
    db
      .select(resourceListColumns)
      .from(resourceBookmarks)
      .innerJoin(resources, eq(resourceBookmarks.resourceId, resources.id))
      .innerJoin(resourceCategories, eq(resources.categoryId, resourceCategories.id))
      .where(where)
      .orderBy(desc(resourceBookmarks.createdAt), desc(resourceBookmarks.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ value: count() })
      .from(resourceBookmarks)
      .innerJoin(resources, eq(resourceBookmarks.resourceId, resources.id))
      .where(where),
  ]);

  return {
    data: rows.map(toListItem) as ResourceListItem[],
    meta: buildMeta(page, limit, totalRows[0]?.value ?? 0),
  };
}

/** Ids of every published resource the user has bookmarked (for marking cards). */
export async function listBookmarkedResourceIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ id: resourceBookmarks.resourceId })
    .from(resourceBookmarks)
    .innerJoin(resources, eq(resourceBookmarks.resourceId, resources.id))
    .where(and(eq(resourceBookmarks.userId, userId), eq(resources.status, "published")))
    .limit(1000);
  return rows.map((r) => r.id);
}

/**
 * Idempotent: bookmarking twice is a no-op. Drafts and unknown ids look
 * identical ("not_found") so unpublished content isn't confirmable.
 */
export async function addBookmark(userId: string, resourceId: string): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
  const [resource] = await db
    .select({ id: resources.id })
    .from(resources)
    .where(and(eq(resources.id, resourceId), eq(resources.status, "published")))
    .limit(1);
  if (!resource) return { ok: false, reason: "not_found" };

  try {
    await db.insert(resourceBookmarks).values({ userId, resourceId }).onConflictDoNothing();
  } catch (error) {
    if (pgErrorCode(error) !== PG_UNIQUE_VIOLATION) throw error;
  }
  return { ok: true };
}

/** Only ever touches the caller's own row. Removing a missing bookmark is fine. */
export async function removeBookmark(userId: string, resourceId: string): Promise<void> {
  await db
    .delete(resourceBookmarks)
    .where(and(eq(resourceBookmarks.userId, userId), eq(resourceBookmarks.resourceId, resourceId)));
}
