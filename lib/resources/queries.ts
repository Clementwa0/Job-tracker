import { and, count, desc, eq, ilike, inArray, like, ne, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { PG_UNIQUE_VIOLATION, pgConstraintName, pgErrorCode } from "@/lib/db/errors";
import { resourceCategories, resources } from "@/lib/db/schema";
import { logAdminAction, type Tx } from "@/lib/admin/queries";
import type {
  AdminResource,
  AdminResourceListItem,
  AdminResourceSummary,
  PublicResource,
  ResourceListItem,
} from "@/types/resource";
import { RESERVED_RESOURCE_SLUGS, type ResourceStatus, type ResourceType, type StoredFile } from "./constants";
import { publishIssues, type ResourceInput } from "./schema";
import { isRichTextEmpty, readingTimeMinutes, sanitizeRichText } from "./sanitize";
import { buildMeta, escapeLike, iso, pickSlug, withSlugRetry } from "./shared";
import { slugify } from "./slug";

type ResourceRow = typeof resources.$inferSelect;

const isSlugConflict = (error: unknown) =>
  pgErrorCode(error) === PG_UNIQUE_VIOLATION && pgConstraintName(error) === "resources_slug_unique";

/* ------------------------------------------------------------------ */
/* Mapping                                                             */
/* ------------------------------------------------------------------ */

const listColumns = {
  id: resources.id,
  title: resources.title,
  slug: resources.slug,
  description: resources.description,
  type: resources.type,
  tags: resources.tags,
  featured: resources.featured,
  coverImage: resources.coverImage,
  attachment: resources.attachment,
  externalUrl: resources.externalUrl,
  publishedAt: resources.publishedAt,
  categoryId: resources.categoryId,
  categoryName: resourceCategories.name,
  categorySlug: resourceCategories.slug,
};

type ListRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: ResourceType;
  tags: string[];
  featured: boolean;
  coverImage: StoredFile | null;
  attachment: StoredFile | null;
  externalUrl: string | null;
  publishedAt: Date | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
};

export function toListItem(row: ListRow): ResourceListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    type: row.type,
    tags: row.tags,
    featured: row.featured,
    coverImageUrl: row.coverImage?.url ?? null,
    hasAttachment: !!row.attachment,
    hasExternalUrl: !!row.externalUrl,
    category: { id: row.categoryId, name: row.categoryName, slug: row.categorySlug },
    publishedAt: iso(row.publishedAt),
  };
}

export { listColumns as resourceListColumns };

const adminColumns = {
  ...listColumns,
  status: resources.status,
  views: resources.views,
  createdAt: resources.createdAt,
  updatedAt: resources.updatedAt,
  content: resources.content,
  seoTitle: resources.seoTitle,
  seoDescription: resources.seoDescription,
};

type AdminRow = ListRow & {
  status: ResourceStatus;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  seoTitle: string;
  seoDescription: string;
};

function toAdminListItem(row: AdminRow): AdminResourceListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    type: row.type,
    status: row.status,
    featured: row.featured,
    views: row.views,
    category: { id: row.categoryId, name: row.categoryName },
    publishedAt: iso(row.publishedAt),
    createdAt: iso(row.createdAt) as string,
    updatedAt: iso(row.updatedAt) as string,
  };
}

function toAdminResource(row: AdminRow): AdminResource {
  return {
    ...toAdminListItem(row),
    description: row.description,
    categoryId: row.categoryId,
    content: sanitizeRichText(row.content),
    coverImage: row.coverImage,
    attachment: row.attachment,
    externalUrl: row.externalUrl,
    tags: row.tags,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export async function listAdminResources(opts: {
  q?: string;
  status?: ResourceStatus;
  categoryId?: string;
  page: number;
  limit: number;
}) {
  const conditions: SQL[] = [];
  if (opts.status) conditions.push(eq(resources.status, opts.status));
  if (opts.categoryId) conditions.push(eq(resources.categoryId, opts.categoryId));
  if (opts.q) {
    const pattern = `%${escapeLike(opts.q)}%`;
    conditions.push(or(ilike(resources.title, pattern), ilike(resources.slug, pattern)) as SQL);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRows, summaryRows] = await Promise.all([
    db
      .select(adminColumns)
      .from(resources)
      .innerJoin(resourceCategories, eq(resources.categoryId, resourceCategories.id))
      .where(where)
      .orderBy(desc(resources.createdAt), desc(resources.id))
      .limit(opts.limit)
      .offset((opts.page - 1) * opts.limit),
    db.select({ value: count() }).from(resources).where(where),
    // Unfiltered, so the stat cards stay put whatever filter is applied.
    db.select({ status: resources.status, value: count() }).from(resources).groupBy(resources.status),
  ]);

  const published = summaryRows.find((r) => r.status === "published")?.value ?? 0;
  const draft = summaryRows.find((r) => r.status === "draft")?.value ?? 0;
  const summary: AdminResourceSummary = { total: published + draft, published, draft };

  return {
    data: rows.map(toAdminListItem),
    meta: buildMeta(opts.page, opts.limit, totalRows[0]?.value ?? 0),
    summary,
  };
}

export async function getAdminResource(id: string): Promise<AdminResource | null> {
  const [row] = await db
    .select(adminColumns)
    .from(resources)
    .innerJoin(resourceCategories, eq(resources.categoryId, resourceCategories.id))
    .where(eq(resources.id, id))
    .limit(1);
  return row ? toAdminResource(row) : null;
}

export type SaveResourceResult =
  | { ok: true; resource: AdminResource; removedFiles: StoredFile[] }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "category_not_found" }
  | { ok: false; reason: "cannot_publish"; issues: Partial<Record<"description" | "content", string>> };

function publishCheck(input: ResourceInput, content: string) {
  const issues = publishIssues({
    description: input.description,
    content,
    attachment: input.attachment,
    externalUrl: input.externalUrl,
    hasContent: !isRichTextEmpty(content),
  });
  return Object.keys(issues).length ? issues : null;
}

async function categoryExists(tx: Tx, categoryId: string) {
  const [row] = await tx
    .select({ id: resourceCategories.id })
    .from(resourceCategories)
    .where(eq(resourceCategories.id, categoryId))
    .limit(1);
  return !!row;
}

export async function createResource(input: ResourceInput, adminId: string): Promise<SaveResourceResult> {
  const content = sanitizeRichText(input.content);
  if (input.status === "published") {
    const issues = publishCheck(input, content);
    if (issues) return { ok: false, reason: "cannot_publish", issues };
  }

  const id = await withSlugRetry(isSlugConflict, () =>
    db.transaction(async (tx) => {
      if (!(await categoryExists(tx, input.categoryId))) return null;

      let base = slugify(input.title);
      if ((RESERVED_RESOURCE_SLUGS as readonly string[]).includes(base)) base = `${base}-resource`;
      const slug = await pickSlug(base, async (pattern) =>
        (await tx.select({ slug: resources.slug }).from(resources).where(like(resources.slug, pattern))).map((r) => r.slug),
      );

      const [row] = await tx
        .insert(resources)
        .values({
          title: input.title,
          slug,
          description: input.description,
          categoryId: input.categoryId,
          type: input.type,
          content,
          coverImage: input.coverImage,
          attachment: input.attachment,
          externalUrl: input.externalUrl,
          tags: input.tags,
          featured: input.featured,
          status: input.status,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          publishedAt: input.status === "published" ? new Date() : null,
          createdBy: adminId,
        })
        .returning({ id: resources.id });

      await logAdminAction(tx, adminId, "resource.created", "resource", row.id, { title: input.title, status: input.status });
      return row.id;
    }),
  );

  if (!id) return { ok: false, reason: "category_not_found" };
  const resource = (await getAdminResource(id)) as AdminResource;
  return { ok: true, resource, removedFiles: [] };
}

/**
 * Full update from the edit form. The slug is deliberately left alone so
 * published URLs never break. Returns files that are no longer referenced
 * by this resource so the caller can delete them from Cloudinary once the
 * change has committed.
 */
export async function updateResource(id: string, input: ResourceInput, adminId: string): Promise<SaveResourceResult> {
  const content = sanitizeRichText(input.content);
  if (input.status === "published") {
    const issues = publishCheck(input, content);
    if (issues) return { ok: false, reason: "cannot_publish", issues };
  }

  const outcome = await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(resources).where(eq(resources.id, id)).for("update");
    if (!existing) return { ok: false, reason: "not_found" } as const;
    if (!(await categoryExists(tx, input.categoryId))) return { ok: false, reason: "category_not_found" } as const;

    const removedFiles: StoredFile[] = [];
    if (existing.coverImage && existing.coverImage.publicId !== input.coverImage?.publicId) {
      removedFiles.push(existing.coverImage);
    }
    if (existing.attachment && existing.attachment.publicId !== input.attachment?.publicId) {
      removedFiles.push(existing.attachment);
    }

    const becomesPublished = input.status === "published" && existing.status !== "published";
    await tx
      .update(resources)
      .set({
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
        type: input.type,
        content,
        coverImage: input.coverImage,
        attachment: input.attachment,
        externalUrl: input.externalUrl,
        tags: input.tags,
        featured: input.featured,
        status: input.status,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        // First publish stamps the date; later edits / re-publishes keep it.
        publishedAt: input.status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      })
      .where(eq(resources.id, id));

    await logAdminAction(
      tx,
      adminId,
      becomesPublished ? "resource.published" : "resource.updated",
      "resource",
      id,
      { title: input.title, status: input.status },
    );
    return { ok: true, removedFiles } as const;
  });

  if (!outcome.ok) return outcome;
  const resource = (await getAdminResource(id)) as AdminResource;
  return { ok: true, resource, removedFiles: outcome.removedFiles };
}

export type ResourceAction = "publish" | "unpublish" | "feature" | "unfeature";
export const RESOURCE_ACTIONS: readonly ResourceAction[] = ["publish", "unpublish", "feature", "unfeature"];

export function isResourceAction(value: string): value is ResourceAction {
  return (RESOURCE_ACTIONS as readonly string[]).includes(value);
}

export type ResourceActionResult =
  | { ok: true; resource: AdminResource }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "cannot_publish"; issues: Partial<Record<"description" | "content", string>> };

/** Publish / unpublish / feature / unfeature. Row-locked so two admins can't race. */
export async function applyResourceAction(
  id: string,
  action: ResourceAction,
  adminId: string,
): Promise<ResourceActionResult> {
  const outcome = await db.transaction(async (tx) => {
    const [row] = await tx.select().from(resources).where(eq(resources.id, id)).for("update");
    if (!row) return { ok: false, reason: "not_found" } as const;

    if (action === "publish") {
      if (row.status !== "published") {
        const issues = publishIssues({
          description: row.description,
          content: row.content,
          attachment: row.attachment,
          externalUrl: row.externalUrl,
          hasContent: !isRichTextEmpty(row.content),
        });
        if (Object.keys(issues).length) return { ok: false, reason: "cannot_publish", issues } as const;
        await tx
          .update(resources)
          .set({ status: "published", publishedAt: row.publishedAt ?? new Date() })
          .where(eq(resources.id, id));
        await logAdminAction(tx, adminId, "resource.published", "resource", id, { title: row.title });
      }
    } else if (action === "unpublish") {
      if (row.status !== "draft") {
        await tx.update(resources).set({ status: "draft" }).where(eq(resources.id, id));
        await logAdminAction(tx, adminId, "resource.unpublished", "resource", id, { title: row.title });
      }
    } else {
      const featured = action === "feature";
      if (row.featured !== featured) {
        await tx.update(resources).set({ featured }).where(eq(resources.id, id));
        await logAdminAction(tx, adminId, featured ? "resource.featured" : "resource.unfeatured", "resource", id, {
          title: row.title,
        });
      }
    }
    return { ok: true } as const;
  });

  if (!outcome.ok) return outcome;
  return { ok: true, resource: (await getAdminResource(id)) as AdminResource };
}

export async function deleteResource(
  id: string,
  adminId: string,
): Promise<{ ok: true; files: StoredFile[] } | { ok: false; reason: "not_found" }> {
  return db.transaction(async (tx) => {
    const [row] = await tx.select().from(resources).where(eq(resources.id, id)).for("update");
    if (!row) return { ok: false, reason: "not_found" } as const;

    await tx.delete(resources).where(eq(resources.id, id)); // bookmarks cascade
    await logAdminAction(tx, adminId, "resource.deleted", "resource", id, { title: row.title });
    return {
      ok: true,
      files: [row.coverImage, row.attachment].filter((f): f is StoredFile => !!f),
    } as const;
  });
}

/* ------------------------------------------------------------------ */
/* Public (published only - by construction)                          */
/* ------------------------------------------------------------------ */

const PUBLISHED = eq(resources.status, "published");

export async function listPublishedResources(opts: {
  q?: string;
  categorySlug?: string;
  type?: ResourceType;
  featured?: boolean;
  ids?: string[];
  page: number;
  limit: number;
}) {
  const conditions: SQL[] = [PUBLISHED];
  if (opts.categorySlug) conditions.push(eq(resourceCategories.slug, opts.categorySlug));
  if (opts.type) conditions.push(eq(resources.type, opts.type));
  if (opts.featured) conditions.push(eq(resources.featured, true));
  if (opts.ids) conditions.push(inArray(resources.id, opts.ids));
  if (opts.q) {
    const pattern = `%${escapeLike(opts.q)}%`;
    conditions.push(
      or(
        ilike(resources.title, pattern),
        ilike(resources.description, pattern),
        sql`array_to_string(${resources.tags}, ' ') ilike ${pattern}`,
      ) as SQL,
    );
  }
  const where = and(...conditions);

  const [rows, totalRows] = await Promise.all([
    db
      .select(listColumns)
      .from(resources)
      .innerJoin(resourceCategories, eq(resources.categoryId, resourceCategories.id))
      .where(where)
      .orderBy(desc(resources.publishedAt), desc(resources.id))
      .limit(opts.limit)
      .offset((opts.page - 1) * opts.limit),
    db
      .select({ value: count() })
      .from(resources)
      .innerJoin(resourceCategories, eq(resources.categoryId, resourceCategories.id))
      .where(where),
  ]);

  return {
    data: rows.map(toListItem),
    meta: buildMeta(opts.page, opts.limit, totalRows[0]?.value ?? 0),
  };
}

type DetailRow = ResourceRow & { categoryName: string; categorySlug: string };

function toPublicResource(row: DetailRow): PublicResource {
  const content = sanitizeRichText(row.content);
  return {
    ...toListItem({ ...row, categoryName: row.categoryName, categorySlug: row.categorySlug }),
    content,
    attachment: row.attachment
      ? {
          url: row.attachment.url,
          originalFilename: row.attachment.originalFilename,
          size: row.attachment.size,
          fileType: row.attachment.fileType,
        }
      : null,
    externalUrl: row.externalUrl,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    views: row.views,
    readingMinutes: readingTimeMinutes(content),
    updatedAt: iso(row.updatedAt) as string,
  };
}

/** A published resource by slug; null for unknown slugs *and* for drafts. */
export async function getPublishedResourceBySlug(slug: string): Promise<(PublicResource & { categoryId: string }) | null> {
  const [row] = await db
    .select({
      resource: resources,
      categoryName: resourceCategories.name,
      categorySlug: resourceCategories.slug,
    })
    .from(resources)
    .innerJoin(resourceCategories, eq(resources.categoryId, resourceCategories.id))
    .where(and(eq(resources.slug, slug), PUBLISHED))
    .limit(1);
  if (!row) return null;
  return { ...toPublicResource({ ...row.resource, categoryName: row.categoryName, categorySlug: row.categorySlug }), categoryId: row.resource.categoryId };
}

export async function incrementResourceViews(id: string): Promise<void> {
  await db
    .update(resources)
    .set({ views: sql`${resources.views} + 1`, updatedAt: sql`${resources.updatedAt}` })
    .where(and(eq(resources.id, id), PUBLISHED));
}

/** Other published resources in the same category or sharing a tag; same category first. */
export async function getRelatedResources(
  resource: { id: string; categoryId: string; tags: string[] },
  limit = 3,
): Promise<ResourceListItem[]> {
  const sameCategory = eq(resources.categoryId, resource.categoryId);
  const tagOverlap = resource.tags.length
    ? sql`${resources.tags} && ARRAY[${sql.join(
        resource.tags.map((t) => sql`${t}`),
        sql`, `,
      )}]::text[]`
    : undefined;

  const rows = await db
    .select(listColumns)
    .from(resources)
    .innerJoin(resourceCategories, eq(resources.categoryId, resourceCategories.id))
    .where(and(PUBLISHED, ne(resources.id, resource.id), tagOverlap ? or(sameCategory, tagOverlap) : sameCategory))
    .orderBy(
      sql`(${resources.categoryId} = ${resource.categoryId}) desc`,
      desc(resources.publishedAt),
      desc(resources.id),
    )
    .limit(limit);

  return rows.map(toListItem);
}
