import { asc, count, eq, ilike, like, max, ne, and, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { PG_FOREIGN_KEY_VIOLATION, pgConstraintName, pgErrorCode, PG_UNIQUE_VIOLATION } from "@/lib/db/errors";
import { resourceCategories, resources } from "@/lib/db/schema";
import { logAdminAction } from "@/lib/admin/queries";
import type { ResourceCategory } from "@/types/resource";
import type { CategoryInput } from "./schema";
import { escapeLike, iso, pickSlug, withSlugRetry } from "./shared";
import { slugify } from "./slug";

function toCategory(
  row: typeof resourceCategories.$inferSelect,
  resourceCount: number,
): ResourceCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    order: row.order,
    isActive: row.isActive,
    createdAt: iso(row.createdAt) as string,
    updatedAt: iso(row.updatedAt) as string,
    resourceCount,
  };
}

const isSlugConflict = (error: unknown) =>
  pgErrorCode(error) === PG_UNIQUE_VIOLATION && !!pgConstraintName(error)?.includes("slug");

const isNameConflict = (error: unknown) =>
  pgErrorCode(error) === PG_UNIQUE_VIOLATION && !!pgConstraintName(error)?.includes("name");

/**
 * Categories in display order. Admin lists count every assigned resource;
 * public lists (`publicOnly`) only return enabled categories and count just
 * their published resources.
 */
export async function listCategories(opts: { publicOnly?: boolean } = {}): Promise<ResourceCategory[]> {
  const countExpr = opts.publicOnly
    ? sql<number>`count(${resources.id}) filter (where ${resources.status} = 'published')`
    : sql<number>`count(${resources.id})`;

  const rows = await db
    .select({ category: resourceCategories, resourceCount: countExpr.mapWith(Number) })
    .from(resourceCategories)
    .leftJoin(resources, eq(resources.categoryId, resourceCategories.id))
    .where(opts.publicOnly ? eq(resourceCategories.isActive, true) : undefined)
    .groupBy(resourceCategories.id)
    .orderBy(asc(resourceCategories.order), asc(resourceCategories.name));

  return rows.map((r) => toCategory(r.category, r.resourceCount));
}

export type CategoryResult =
  | { ok: true; category: ResourceCategory }
  | { ok: false; reason: "duplicate" | "not_found" };

async function nameTaken(name: string, excludeId?: string): Promise<boolean> {
  const [row] = await db
    .select({ id: resourceCategories.id })
    .from(resourceCategories)
    .where(
      and(
        ilike(resourceCategories.name, escapeLike(name)),
        excludeId ? ne(resourceCategories.id, excludeId) : undefined,
      ),
    )
    .limit(1);
  return !!row;
}

export async function createCategory(input: CategoryInput, adminId: string): Promise<CategoryResult> {
  if (await nameTaken(input.name)) return { ok: false, reason: "duplicate" };

  try {
    return await withSlugRetry(isSlugConflict, () =>
      db.transaction(async (tx) => {
        const slug = await pickSlug(slugify(input.name, 60), async (pattern) =>
          (await tx.select({ slug: resourceCategories.slug }).from(resourceCategories).where(like(resourceCategories.slug, pattern))).map(
            (r) => r.slug,
          ),
        );
        const [{ top }] = await tx.select({ top: max(resourceCategories.order) }).from(resourceCategories);

        const [row] = await tx
          .insert(resourceCategories)
          .values({
            name: input.name,
            slug,
            description: input.description,
            isActive: input.isActive,
            order: (top ?? -1) + 1,
          })
          .returning();

        await logAdminAction(tx, adminId, "resource_category.created", "resource_category", row.id, { name: row.name });
        return { ok: true, category: toCategory(row, 0) } as const;
      }),
    );
  } catch (error) {
    if (isNameConflict(error) || isSlugConflict(error)) return { ok: false, reason: "duplicate" };
    throw error;
  }
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
  adminId: string,
): Promise<CategoryResult> {
  const [existing] = await db.select().from(resourceCategories).where(eq(resourceCategories.id, id)).limit(1);
  if (!existing) return { ok: false, reason: "not_found" };

  const renamed = input.name !== undefined && input.name !== existing.name;
  if (renamed && (await nameTaken(input.name as string, id))) return { ok: false, reason: "duplicate" };

  try {
    return await withSlugRetry(isSlugConflict, () =>
      db.transaction(async (tx) => {
        const patch: Partial<typeof resourceCategories.$inferInsert> = {};
        if (input.description !== undefined) patch.description = input.description;
        if (input.isActive !== undefined) patch.isActive = input.isActive;
        if (renamed) {
          patch.name = input.name;
          patch.slug = await pickSlug(slugify(input.name as string, 60), async (pattern) =>
            (
              await tx
                .select({ slug: resourceCategories.slug })
                .from(resourceCategories)
                .where(and(like(resourceCategories.slug, pattern), ne(resourceCategories.id, id)))
            ).map((r) => r.slug),
          );
        }

        const [row] = await tx.update(resourceCategories).set(patch).where(eq(resourceCategories.id, id)).returning();
        if (!row) return { ok: false, reason: "not_found" } as const;

        const [{ value }] = await tx.select({ value: count() }).from(resources).where(eq(resources.categoryId, id));
        await logAdminAction(tx, adminId, "resource_category.updated", "resource_category", id, {
          fields: Object.keys(patch),
        });
        return { ok: true, category: toCategory(row, value) } as const;
      }),
    );
  } catch (error) {
    if (isNameConflict(error) || isSlugConflict(error)) return { ok: false, reason: "duplicate" };
    throw error;
  }
}

export type DeleteCategoryResult =
  | { ok: true }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "in_use"; resourceCount: number };

/** Deletes a category only when no resource uses it. */
export async function deleteCategory(id: string, adminId: string): Promise<DeleteCategoryResult> {
  try {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(resourceCategories)
        .where(eq(resourceCategories.id, id))
        .for("update");
      if (!existing) return { ok: false, reason: "not_found" } as const;

      const [{ value }] = await tx.select({ value: count() }).from(resources).where(eq(resources.categoryId, id));
      if (value > 0) return { ok: false, reason: "in_use", resourceCount: value } as const;

      await tx.delete(resourceCategories).where(eq(resourceCategories.id, id));
      await logAdminAction(tx, adminId, "resource_category.deleted", "resource_category", id, { name: existing.name });
      return { ok: true } as const;
    });
  } catch (error) {
    // A resource was assigned between the count and the delete: the FK (RESTRICT) caught it.
    if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) return { ok: false, reason: "in_use", resourceCount: 1 };
    throw error;
  }
}

/** Persists a new display order. `ids` must be exactly the current set of categories. */
export async function reorderCategories(ids: string[], adminId: string): Promise<{ ok: true } | { ok: false }> {
  return db.transaction(async (tx) => {
    const current = await tx.select({ id: resourceCategories.id }).from(resourceCategories).for("update");
    const currentIds = new Set(current.map((c) => c.id));
    if (ids.length !== currentIds.size || !ids.every((id) => currentIds.has(id))) {
      return { ok: false } as const;
    }
    for (let i = 0; i < ids.length; i++) {
      await tx.update(resourceCategories).set({ order: i }).where(eq(resourceCategories.id, ids[i]));
    }
    await logAdminAction(tx, adminId, "resource_category.reordered", "resource_category", "all", { count: ids.length });
    return { ok: true } as const;
  });
}
