import {
  and,
  desc,
  eq,
  gt,
  ilike,
  isNull,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { companies, employerProfiles, jobPostings } from "@/lib/db/schema";
import {
  EMPLOYER_TRANSITIONS,
  canEditPosting,
  invalidTransitionMessage,
  type EmployerPostingAction,
} from "@/lib/jobPostings/lifecycle";
import { checkPublishReady, salaryProblem, type CompanyInput } from "@/lib/jobPostings/validation";
import type {
  EmployerCompany,
  EmployerJobPayload,
  EmployerJobPosting,
  EmployerJobsList,
  EmployerPostingStats,
  EmployerStatusCounts,
  EmployerTopPosting,
  PostingStatus,
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
    applicationInstructions: posting.applicationInstructions || undefined,
    applyEmailSubject: posting.applyEmailSubject || undefined,
    applyViaAggregator: posting.applyViaAggregator || undefined,
    descriptionSections: posting.descriptionSections ?? undefined,
    source:
      posting.sourceName || posting.sourceUrl
        ? {
            name: posting.sourceName || undefined,
            url: posting.sourceUrl || undefined,
          }
        : undefined,
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

export type CreateCompanyResult =
  | { ok: true; company: EmployerCompany }
  | { ok: false; reason: "exists" };

/**
 * Creates the company and links it to the employer's profile in one
 * transaction. The profile row is locked first, so two concurrent requests
 * can't both create a company, and a missing profile row can't leave an
 * orphaned company that no employer is linked to.
 */
export async function createEmployerCompany(
  userId: string,
  input: CompanyInput,
): Promise<CreateCompanyResult> {
  return db.transaction(async (tx) => {
    await tx
      .insert(employerProfiles)
      .values({ userId })
      .onConflictDoNothing({ target: employerProfiles.userId });
    const [profile] = await tx
      .select({ companyId: employerProfiles.companyId })
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, userId))
      .for("update");
    if (profile?.companyId) return { ok: false, reason: "exists" } as const;

    const [company] = await tx
      .insert(companies)
      .values({
        name: input.name.trim(),
        slug: companySlug(input.name),
        description: input.description ?? "",
        website: input.website ?? "",
        location: input.location ?? "",
        industry: input.industry ?? "",
        createdBy: userId,
        status: "pending",
      })
      .returning();
    await tx
      .update(employerProfiles)
      .set({ companyId: company.id })
      .where(eq(employerProfiles.userId, userId));
    return { ok: true, company: toCompany(company) } as const;
  });
}

/**
 * Only the fields present in `input` change. Renaming the company also
 * refreshes the name snapshot stored on its postings.
 */
export async function updateEmployerCompany(userId: string, input: Partial<CompanyInput>) {
  const company = await employerCompany(userId);
  if (!company) return null;
  const changes = {
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.website !== undefined ? { website: input.website } : {}),
    ...(input.location !== undefined ? { location: input.location } : {}),
    ...(input.industry !== undefined ? { industry: input.industry } : {}),
  };
  if (Object.keys(changes).length === 0) return company;
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(companies)
      .set(changes)
      .where(and(eq(companies.id, company.id), eq(companies.createdBy, userId)))
      .returning();
    if (!updated) return null;
    if (changes.name !== undefined) {
      await tx
        .update(jobPostings)
        .set({ companyName: changes.name })
        .where(eq(jobPostings.companyId, company.id));
    }
    return toCompany(updated);
  });
}

/* ------------------------------------------------------------------ */
/* Employer postings                                                   */
/* ------------------------------------------------------------------ */

/**
 * Ownership rule for every employer posting query: the posting was created
 * by this user AND still belongs to the company on this user's employer
 * profile. A posting left behind after the employer was unlinked from, or
 * moved to, another company is no longer manageable through this API.
 */
function ownedPostings(userId: string) {
  return {
    join: and(
      eq(employerProfiles.userId, jobPostings.createdBy),
      eq(employerProfiles.companyId, jobPostings.companyId),
    ),
    where: eq(jobPostings.createdBy, userId),
  };
}

async function joinedEmployerPosting(userId: string, id: string, lock = false) {
  const owned = ownedPostings(userId);
  const query = db
    .select({ posting: jobPostings, company: companies })
    .from(jobPostings)
    .innerJoin(companies, eq(jobPostings.companyId, companies.id))
    .innerJoin(employerProfiles, owned.join)
    .where(and(eq(jobPostings.id, id), owned.where))
    .limit(1);
  const [row] = await (lock ? query.for("update", { of: jobPostings }) : query);
  return row;
}

const POSTING_STATUSES: PostingStatus[] = ["draft", "pending_review", "published", "closed"];

export function isPostingStatus(value: string | null | undefined): value is PostingStatus {
  return POSTING_STATUSES.includes(value as PostingStatus);
}

export const EMPLOYER_PAGE_SIZE = { default: 10, max: 50 } as const;

export interface EmployerPostingsFilters {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}

function likePattern(value: string) {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

/** Per-status totals and total views for the whole account. */
async function employerStatusCounts(userId: string) {
  const owned = ownedPostings(userId);
  const rows = await db
    .select({
      status: jobPostings.status,
      count: sql<number>`count(*)::int`,
      views: sql<number>`coalesce(sum(${jobPostings.viewCount}), 0)::int`,
    })
    .from(jobPostings)
    .innerJoin(employerProfiles, owned.join)
    .where(owned.where)
    .groupBy(jobPostings.status);
  const counts: EmployerStatusCounts = { all: 0, draft: 0, pending_review: 0, published: 0, closed: 0 };
  let totalViews = 0;
  for (const row of rows) {
    counts[row.status] = row.count;
    counts.all += row.count;
    totalViews += row.views;
  }
  return { counts, totalViews };
}

export async function listEmployerPostings(
  userId: string,
  filters: EmployerPostingsFilters = {},
): Promise<EmployerJobsList> {
  const owned = ownedPostings(userId);
  const conditions: SQL[] = [owned.where];
  if (isPostingStatus(filters.status)) conditions.push(eq(jobPostings.status, filters.status));
  const q = filters.q?.trim().slice(0, 100);
  if (q) {
    const pattern = likePattern(q);
    conditions.push(or(ilike(jobPostings.title, pattern), ilike(jobPostings.location, pattern))!);
  }

  const limit = Math.min(EMPLOYER_PAGE_SIZE.max, Math.max(1, Math.floor(filters.limit || EMPLOYER_PAGE_SIZE.default)));
  const requestedPage = Math.max(1, Math.floor(filters.page || 1));

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(jobPostings)
    .innerJoin(employerProfiles, owned.join)
    .where(and(...conditions));
  const totalPages = Math.max(1, Math.ceil(total / limit));
  // A page past the end (e.g. after deleting the last row on it) clamps to
  // the last page instead of returning an empty list.
  const page = Math.min(requestedPage, totalPages);

  const [rows, { counts, totalViews }] = await Promise.all([
    db
      .select({ posting: jobPostings, company: companies })
      .from(jobPostings)
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .innerJoin(employerProfiles, owned.join)
      .where(and(...conditions))
      .orderBy(desc(jobPostings.updatedAt), desc(jobPostings.id))
      .limit(limit)
      .offset((page - 1) * limit),
    employerStatusCounts(userId),
  ]);

  return {
    jobs: rows.map(toEmployerPosting),
    meta: { page, limit, total, totalPages },
    counts,
    totalViews,
  };
}

/**
 * Dashboard numbers, computed in SQL over every posting the employer owns
 * (not over a page of them). See EmployerPostingStats for the definitions.
 */
export async function employerDashboardStats(userId: string) {
  const owned = ownedPostings(userId);
  const published = sql`${jobPostings.status} = 'published'`;
  const expired = sql`${published} and ${jobPostings.applicationDeadline} is not null and ${jobPostings.applicationDeadline} <= now()`;
  const live = sql`${published} and (${jobPostings.applicationDeadline} is null or ${jobPostings.applicationDeadline} > now())`;
  const closingSoon = sql`${live} and ${jobPostings.applicationDeadline} is not null and ${jobPostings.applicationDeadline} <= now() + interval '7 days'`;

  const [[row], top] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        live: sql<number>`(count(*) filter (where ${live}))::int`,
        expired: sql<number>`(count(*) filter (where ${expired}))::int`,
        drafts: sql<number>`(count(*) filter (where ${jobPostings.status} = 'draft'))::int`,
        pending: sql<number>`(count(*) filter (where ${jobPostings.status} = 'pending_review'))::int`,
        closed: sql<number>`(count(*) filter (where ${jobPostings.status} = 'closed'))::int`,
        closingSoon: sql<number>`(count(*) filter (where ${closingSoon}))::int`,
        views: sql<number>`coalesce(sum(${jobPostings.viewCount}), 0)::int`,
        liveViews: sql<number>`coalesce(sum(${jobPostings.viewCount}) filter (where ${live}), 0)::int`,
      })
      .from(jobPostings)
      .innerJoin(employerProfiles, owned.join)
      .where(owned.where),
    db
      .select({
        id: jobPostings.id,
        title: jobPostings.title,
        status: jobPostings.status,
        viewCount: jobPostings.viewCount,
      })
      .from(jobPostings)
      .innerJoin(employerProfiles, owned.join)
      .where(and(owned.where, gt(jobPostings.viewCount, 0)))
      .orderBy(desc(jobPostings.viewCount), desc(jobPostings.id))
      .limit(5),
  ]);

  const stats: EmployerPostingStats = {
    totalJobs: row.total,
    published: row.live,
    expired: row.expired,
    drafts: row.drafts,
    pendingReview: row.pending,
    closed: row.closed,
    totalViews: row.views,
    closingSoon: row.closingSoon,
    avgViewsPerLivePosting: row.live > 0 ? Math.round(row.liveViews / row.live) : 0,
  };
  return { stats, topPostings: top as EmployerTopPosting[] };
}

export async function getEmployerPosting(userId: string, id: string) {
  const row = await joinedEmployerPosting(userId, id);
  return row ? toEmployerPosting(row) : null;
}

/** DB-shaped column values for the fields present in `input`. */
function postingValues(input: Partial<EmployerJobPayload>) {
  return {
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.category !== undefined ? { category: input.category || "" } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.responsibilities !== undefined ? { responsibilities: input.responsibilities || "" } : {}),
    ...(input.requirements !== undefined ? { requirements: input.requirements || "" } : {}),
    ...(input.location !== undefined ? { location: input.location || "" } : {}),
    ...(input.salaryMin !== undefined ? { salaryMin: input.salaryMin } : {}),
    ...(input.salaryMax !== undefined ? { salaryMax: input.salaryMax } : {}),
    ...(input.salaryCurrency !== undefined ? { salaryCurrency: input.salaryCurrency } : {}),
    ...(input.jobType !== undefined ? { jobType: input.jobType } : {}),
    ...(input.workMode !== undefined ? { workMode: input.workMode } : {}),
    ...(input.experienceLevel !== undefined ? { experienceLevel: input.experienceLevel || "" } : {}),
    ...(input.educationLevel !== undefined ? { educationLevel: input.educationLevel || "" } : {}),
    ...(input.certifications !== undefined ? { certifications: input.certifications || "" } : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.applyMethod !== undefined
      ? { applyMethodType: input.applyMethod.type, applyMethodValue: input.applyMethod.value.trim() }
      : {}),
    ...(input.applicationDeadline !== undefined
      ? { applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : null }
      : {}),
  };
}

export async function createEmployerPosting(userId: string, input: EmployerJobPayload) {
  const company = await employerCompany(userId);
  if (!company) return null;
  const [posting] = await db
    .insert(jobPostings)
    .values({
      ...postingValues(input),
      title: input.title.trim(),
      // The public company name always comes from the company profile, never
      // from the request - otherwise an employer could post as any brand.
      companyName: company.name,
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

export type UpdatePostingResult =
  | { ok: true; posting: EmployerJobPosting }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "locked"; message: string }
  | { ok: false; reason: "invalid"; message: string };

export async function updateEmployerPosting(
  userId: string,
  id: string,
  input: Partial<EmployerJobPayload>,
): Promise<UpdatePostingResult> {
  const outcome = await db.transaction(async (tx) => {
    const owned = ownedPostings(userId);
    const [row] = await tx
      .select({ posting: jobPostings })
      .from(jobPostings)
      .innerJoin(employerProfiles, owned.join)
      .where(and(eq(jobPostings.id, id), owned.where))
      .limit(1)
      .for("update", { of: jobPostings });
    if (!row) return { ok: false, reason: "not_found" } as const;
    const { posting } = row;

    if (!canEditPosting(posting.status)) {
      return {
        ok: false,
        reason: "locked",
        message: "This posting is awaiting review. Unpublish it to make changes.",
      } as const;
    }

    const values = postingValues(input);
    const merged = { ...posting, ...values };
    const salary = salaryProblem(merged.salaryMin, merged.salaryMax);
    if (salary) return { ok: false, reason: "invalid", message: salary } as const;
    // A live posting can't be edited into something that couldn't be published.
    if (posting.status === "published") {
      const problems = checkPublishReady(merged);
      if (problems.length) {
        return { ok: false, reason: "invalid", message: problems.join(" ") } as const;
      }
    }

    if (Object.keys(values).length > 0) {
      await tx
        .update(jobPostings)
        .set(values)
        .where(and(eq(jobPostings.id, id), eq(jobPostings.createdBy, userId), eq(jobPostings.status, posting.status)));
    }
    return { ok: true } as const;
  });
  if (!outcome.ok) return outcome;
  const posting = await getEmployerPosting(userId, id);
  return posting ? { ok: true, posting } : { ok: false, reason: "not_found" };
}

export type TransitionResult =
  | { ok: true; posting: EmployerJobPosting }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "invalid_state"; message: string }
  | { ok: false; reason: "company_suspended"; message: string }
  | { ok: false; reason: "not_ready"; message: string };

export async function transitionEmployerPosting(
  userId: string,
  id: string,
  action: EmployerPostingAction,
): Promise<TransitionResult> {
  const outcome = await db.transaction(async (tx) => {
    const owned = ownedPostings(userId);
    // Row lock: a concurrent double-click or an admin approve/reject waits
    // here and then sees the new status instead of overwriting it.
    const [row] = await tx
      .select({ posting: jobPostings, company: companies })
      .from(jobPostings)
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .innerJoin(employerProfiles, owned.join)
      .where(and(eq(jobPostings.id, id), owned.where))
      .limit(1)
      .for("update", { of: jobPostings });
    if (!row) return { ok: false, reason: "not_found" } as const;

    const rule = EMPLOYER_TRANSITIONS[action];
    if (!rule.from.includes(row.posting.status)) {
      return {
        ok: false,
        reason: "invalid_state",
        message: invalidTransitionMessage(action, row.posting.status),
      } as const;
    }

    if (action === "publish") {
      if (row.company.status === "suspended") {
        return {
          ok: false,
          reason: "company_suspended",
          message: "Your company profile is suspended, so postings can't be published. Contact support.",
        } as const;
      }
      const problems = checkPublishReady(row.posting);
      if (problems.length) {
        return { ok: false, reason: "not_ready", message: problems.join(" ") } as const;
      }
    }

    const now = new Date();
    const changes =
      action === "publish"
        ? { status: "published" as const, publishedAt: now, closedAt: null }
        : action === "unpublish"
          ? { status: "draft" as const, closedAt: null }
          : { status: "closed" as const, closedAt: now };
    await tx.update(jobPostings).set(changes).where(eq(jobPostings.id, id));
    return { ok: true } as const;
  });
  if (!outcome.ok) return outcome;
  const posting = await getEmployerPosting(userId, id);
  return posting ? { ok: true, posting } : { ok: false, reason: "not_found" };
}

export type DeletePostingResult = "deleted" | "not_found" | "not_draft";

export async function deleteEmployerPosting(userId: string, id: string): Promise<DeletePostingResult> {
  const row = await joinedEmployerPosting(userId, id);
  if (!row) return "not_found";
  const deleted = await db
    .delete(jobPostings)
    .where(and(eq(jobPostings.id, id), eq(jobPostings.createdBy, userId), eq(jobPostings.status, "draft")))
    .returning({ id: jobPostings.id });
  return deleted.length > 0 ? "deleted" : "not_draft";
}

export async function publicPostings(filters: PublicJobFilters) {
  const conditions: SQL[] = [
    eq(jobPostings.status, "published"),
    isNull(jobPostings.closedAt),
    // Scraper-imported records are now read live from the source API.
    or(isNull(companies.source), ne(companies.source, "scraper"))!,
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
    limit = Math.min(5000, Math.max(1, filters.limit || 20));
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
        // Imported scraper listings are resolved from the live source API.
        or(isNull(companies.source), ne(companies.source, "scraper"))!,
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
