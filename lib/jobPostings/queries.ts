import {
  and,
  desc,
  eq,
  gt,
  ilike,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { companies, employerProfiles, jobPostings } from "@/lib/db/schema";
import type {
  EmployerCompany,
  EmployerJobPayload,
  EmployerJobPosting,
} from "@/types/employer";
import type {
  PublicJobDetail,
  PublicJobFilters,
  PublicJobListItem,
} from "@/types/jobPosting";

type JoinedPosting = {
  posting: typeof jobPostings.$inferSelect;
  company: typeof companies.$inferSelect;
};

function iso(value: Date | null | undefined) {
  return value?.toISOString();
}

function toCompany(company: typeof companies.$inferSelect): EmployerCompany {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    description: company.description || undefined,
    website: company.website || undefined,
    location: company.location || undefined,
    industry: company.industry || undefined,
    status: company.status,
    createdAt: iso(company.createdAt),
    updatedAt: iso(company.updatedAt),
  };
}

function toEmployerPosting({
  posting,
  company,
}: JoinedPosting): EmployerJobPosting {
  return {
    id: posting.id,
    title: posting.title,
    slug: posting.slug,
    companyId: posting.companyId,
    companyName: posting.companyName || company.name,
    category: posting.category || undefined,
    description: posting.description,
    responsibilities: posting.responsibilities || undefined,
    requirements: posting.requirements || undefined,
    location: posting.location || undefined,
    salaryMin: posting.salaryMin ?? undefined,
    salaryMax: posting.salaryMax ?? undefined,
    salaryCurrency: posting.salaryCurrency,
    jobType: posting.jobType,
    workMode: posting.workMode,
    experienceLevel: posting.experienceLevel || undefined,
    educationLevel: posting.educationLevel || undefined,
    certifications: posting.certifications || undefined,
    tags: posting.tags,
    applyMethod: {
      type: posting.applyMethodType,
      value: posting.applyMethodValue,
    },
    status: posting.status,
    publishedAt: iso(posting.publishedAt),
    closedAt: iso(posting.closedAt),
    applicationDeadline: iso(posting.applicationDeadline) ?? null,
    viewCount: posting.viewCount,
    createdAt: iso(posting.createdAt),
    updatedAt: iso(posting.updatedAt),
    company: {
      id: company.id,
      name: posting.companyName || company.name,
      slug: company.slug,
    },
  };
}

function toPublicPosting(
  row: JoinedPosting,
  detail = false,
): PublicJobListItem | PublicJobDetail {
  const { posting, company } = row;
  const base: PublicJobListItem = {
    id: posting.id,
    slug: posting.slug,
    title: posting.title,
    category: posting.category || undefined,
    location: posting.location || undefined,
    salaryMin: posting.salaryMin ?? undefined,
    salaryMax: posting.salaryMax ?? undefined,
    salaryCurrency: posting.salaryCurrency,
    jobType: posting.jobType as PublicJobListItem["jobType"],
    workMode: posting.workMode as PublicJobListItem["workMode"],
    experienceLevel: posting.experienceLevel || undefined,
    tags: posting.tags,
    publishedAt: iso(posting.publishedAt),
    applicationDeadline: iso(posting.applicationDeadline),
    status: posting.status,
    isActive:
      !posting.closedAt &&
      (!posting.applicationDeadline ||
        posting.applicationDeadline > new Date()),
    company: {
      id: company.id,
      name: posting.companyName || company.name,
      slug: company.slug,
      logo: company.logo || undefined,
      location: company.location || undefined,
      industry: company.industry || undefined,
      website: company.website || undefined,
      description: company.description || undefined,
    },
  };
  if (!detail) return base;
  return {
    ...base,
    description: posting.description,
    responsibilities: posting.responsibilities || undefined,
    requirements: posting.requirements || undefined,
    educationLevel: posting.educationLevel || undefined,
    certifications: posting.certifications || undefined,
    viewCount: posting.viewCount,
    closedAt: iso(posting.closedAt),
    applyMethod: {
      type: posting.applyMethodType,
      value: posting.applyMethodValue,
    },
  };
}

export async function employerCompany(userId: string) {
  const [row] = await db
    .select({ company: companies })
    .from(employerProfiles)
    .innerJoin(companies, eq(employerProfiles.companyId, companies.id))
    .where(eq(employerProfiles.userId, userId))
    .limit(1);
  return row?.company ? toCompany(row.company) : null;
}

function companySlug(name: string) {
  return `${
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "company"
  }-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createEmployerCompany(
  userId: string,
  input: Pick<
    EmployerCompany,
    "name" | "description" | "website" | "location" | "industry"
  >,
) {
  const [company] = await db
    .insert(companies)
    .values({
      ...input,
      name: input.name.trim(),
      slug: companySlug(input.name),
      createdBy: userId,
      status: "pending",
    })
    .returning();
  await db
    .update(employerProfiles)
    .set({ companyId: company.id })
    .where(eq(employerProfiles.userId, userId));
  return toCompany(company);
}

export async function updateEmployerCompany(
  userId: string,
  input: Partial<
    Pick<
      EmployerCompany,
      "name" | "description" | "website" | "location" | "industry"
    >
  >,
) {
  const company = await employerCompany(userId);
  if (!company) return null;
  const [updated] = await db
    .update(companies)
    .set({ ...input, ...(input.name ? { name: input.name.trim() } : {}) })
    .where(and(eq(companies.id, company.id), eq(companies.createdBy, userId)))
    .returning();
  return updated ? toCompany(updated) : null;
}

async function joinedEmployerPosting(userId: string, id: string) {
  const [row] = await db
    .select({ posting: jobPostings, company: companies })
    .from(jobPostings)
    .innerJoin(companies, eq(jobPostings.companyId, companies.id))
    .where(and(eq(jobPostings.id, id), eq(jobPostings.createdBy, userId)))
    .limit(1);
  return row;
}

export async function listEmployerPostings(userId: string, status?: string) {
  const conditions: SQL[] = [eq(jobPostings.createdBy, userId)];
  if (
    ["draft", "pending_review", "published", "closed"].includes(status || "")
  ) {
    conditions.push(
      eq(
        jobPostings.status,
        status as "draft" | "pending_review" | "published" | "closed",
      ),
    );
  }
  const rows = await db
    .select({ posting: jobPostings, company: companies })
    .from(jobPostings)
    .innerJoin(companies, eq(jobPostings.companyId, companies.id))
    .where(and(...conditions))
    .orderBy(desc(jobPostings.updatedAt));
  return rows.map(toEmployerPosting);
}

export async function getEmployerPosting(userId: string, id: string) {
  const row = await joinedEmployerPosting(userId, id);
  return row ? toEmployerPosting(row) : null;
}

function postingValues(input: Partial<EmployerJobPayload>) {
  return {
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.companyName !== undefined
      ? { companyName: input.companyName.trim() }
      : {}),
    ...(input.category !== undefined ? { category: input.category || "" } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.responsibilities !== undefined
      ? { responsibilities: input.responsibilities || "" }
      : {}),
    ...(input.requirements !== undefined
      ? { requirements: input.requirements || "" }
      : {}),
    ...(input.location !== undefined ? { location: input.location || "" } : {}),
    ...(input.salaryMin !== undefined ? { salaryMin: input.salaryMin } : {}),
    ...(input.salaryMax !== undefined ? { salaryMax: input.salaryMax } : {}),
    ...(input.salaryCurrency !== undefined
      ? { salaryCurrency: input.salaryCurrency }
      : {}),
    ...(input.jobType !== undefined ? { jobType: input.jobType } : {}),
    ...(input.workMode !== undefined ? { workMode: input.workMode } : {}),
    ...(input.experienceLevel !== undefined
      ? { experienceLevel: input.experienceLevel || "" }
      : {}),
    ...(input.educationLevel !== undefined
      ? { educationLevel: input.educationLevel || "" }
      : {}),
    ...(input.certifications !== undefined
      ? { certifications: input.certifications || "" }
      : {}),
    ...(input.tags !== undefined
      ? { tags: input.tags.map((tag) => tag.trim()).filter(Boolean) }
      : {}),
    ...(input.applyMethod !== undefined
      ? {
          applyMethodType: input.applyMethod.type,
          applyMethodValue: input.applyMethod.value.trim(),
        }
      : {}),
    ...(input.applicationDeadline !== undefined
      ? {
          applicationDeadline: input.applicationDeadline
            ? new Date(input.applicationDeadline)
            : null,
        }
      : {}),
  };
}

export async function createEmployerPosting(
  userId: string,
  input: EmployerJobPayload,
) {
  const company = await employerCompany(userId);
  if (!company) return null;
  const [posting] = await db
    .insert(jobPostings)
    .values({
      ...postingValues(input),
      title: input.title.trim(),
      slug: `${
        input.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "job"
      }-${crypto.randomUUID().slice(0, 8)}`,
      companyId: company.id,
      createdBy: userId,
    })
    .returning();
  return getEmployerPosting(userId, posting.id);
}

export async function updateEmployerPosting(
  userId: string,
  id: string,
  input: Partial<EmployerJobPayload>,
) {
  const row = await joinedEmployerPosting(userId, id);
  if (!row) return null;
  await db
    .update(jobPostings)
    .set(postingValues(input))
    .where(and(eq(jobPostings.id, id), eq(jobPostings.createdBy, userId)));
  return getEmployerPosting(userId, id);
}

export async function transitionEmployerPosting(
  userId: string,
  id: string,
  action: "publish" | "unpublish" | "close",
) {
  const row = await joinedEmployerPosting(userId, id);
  if (!row) return null;
  const allowed =
    (action === "publish" &&
      (row.posting.status === "draft" || row.posting.status === "closed")) ||
    (action === "unpublish" &&
      (row.posting.status === "published" ||
        row.posting.status === "pending_review")) ||
    (action === "close" && row.posting.status === "published");
  if (!allowed) return null;
  const now = new Date();
  const changes =
    action === "publish"
      ? { status: "published" as const, publishedAt: now, closedAt: null }
      : action === "unpublish"
        ? { status: "draft" as const, closedAt: null }
        : { status: "closed" as const, closedAt: now };
  await db
    .update(jobPostings)
    .set(changes)
    .where(and(eq(jobPostings.id, id), eq(jobPostings.createdBy, userId)));
  return getEmployerPosting(userId, id);
}

export async function deleteEmployerPosting(userId: string, id: string) {
  const deleted = await db
    .delete(jobPostings)
    .where(
      and(
        eq(jobPostings.id, id),
        eq(jobPostings.createdBy, userId),
        eq(jobPostings.status, "draft"),
      ),
    )
    .returning({ id: jobPostings.id });
  return deleted.length > 0;
}

export async function publicPostings(filters: PublicJobFilters) {
  const conditions: SQL[] = [
    eq(jobPostings.status, "published"),
    isNull(jobPostings.closedAt),
    or(
      isNull(jobPostings.applicationDeadline),
      gt(jobPostings.applicationDeadline, new Date()),
    )!,
  ];
  const q = filters.q?.trim();
  if (q) {
    const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(
      or(
        ilike(jobPostings.title, pattern),
        ilike(companies.name, pattern),
        ilike(jobPostings.location, pattern),
        ilike(jobPostings.category, pattern),
        sql`array_to_string(${jobPostings.tags}, ' ') ILIKE ${pattern}`,
      )!,
    );
  }
  if (filters.location)
    conditions.push(
      ilike(
        jobPostings.location,
        `%${filters.location.replace(/[\\%_]/g, "\\$&")}%`,
      ),
    );
  if (filters.category)
    conditions.push(eq(jobPostings.category, filters.category));
  if (filters.jobType)
    conditions.push(eq(jobPostings.jobType, filters.jobType));
  if (filters.workMode)
    conditions.push(eq(jobPostings.workMode, filters.workMode));
  if (filters.experienceLevel)
    conditions.push(eq(jobPostings.experienceLevel, filters.experienceLevel));
  const page = Math.max(1, filters.page || 1),
    limit = Math.min(50, Math.max(1, filters.limit || 20));
  const rows = await db
    .select({ posting: jobPostings, company: companies })
    .from(jobPostings)
    .innerJoin(companies, eq(jobPostings.companyId, companies.id))
    .where(and(...conditions))
    .orderBy(
      filters.sort === "salary"
        ? desc(jobPostings.salaryMax)
        : desc(jobPostings.publishedAt),
    )
    .limit(limit)
    .offset((page - 1) * limit);
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(jobPostings)
    .innerJoin(companies, eq(jobPostings.companyId, companies.id))
    .where(and(...conditions));
  return {
    jobs: rows.map((row) => toPublicPosting(row) as PublicJobListItem),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function publicPostingBySlug(slug: string) {
  const [row] = await db
    .select({ posting: jobPostings, company: companies })
    .from(jobPostings)
    .innerJoin(companies, eq(jobPostings.companyId, companies.id))
    .where(
      and(
        eq(jobPostings.slug, slug),
        eq(jobPostings.status, "published"),
        isNull(jobPostings.closedAt),
        or(
          isNull(jobPostings.applicationDeadline),
          gt(jobPostings.applicationDeadline, new Date()),
        )!,
      ),
    )
    .limit(1);
  if (!row) return null;
  await db
    .update(jobPostings)
    .set({ viewCount: sql`${jobPostings.viewCount} + 1` })
    .where(eq(jobPostings.id, row.posting.id));
  return toPublicPosting(
    {
      ...row,
      posting: { ...row.posting, viewCount: row.posting.viewCount + 1 },
    },
    true,
  ) as PublicJobDetail;
}
