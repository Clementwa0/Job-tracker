import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  APPLICATION_STATUSES,
  auditLogs,
  companies,
  jobPostings,
  jobs,
  users,
} from "@/lib/db/schema";
import type {
  AdminApplication,
  AdminCompany,
  AdminJobPosting,
  AuditLogEntry,
  PaginatedMeta,
} from "@/types/admin";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

export const ADMIN_PAGE_SIZES = [10, 20, 50, 100] as const;
const DEFAULT_LIMIT = 20;

/** Reads `page` / `limit` from a query string; unknown limits fall back to the default. */
export function parsePagination(params: URLSearchParams) {
  const page = Math.max(1, Math.floor(Number(params.get("page"))) || 1);
  const rawLimit = Number(params.get("limit"));
  const limit = (ADMIN_PAGE_SIZES as readonly number[]).includes(rawLimit) ? rawLimit : DEFAULT_LIMIT;
  return { page, limit };
}

function buildMeta(page: number, limit: number, total: number): PaginatedMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Escapes LIKE/ILIKE wildcards so search input is matched literally. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function iso(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Records an admin action. Call it inside the same transaction as the change it describes. */
async function logAdminAction(
  tx: Tx,
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  meta: Record<string, unknown> = {},
) {
  await tx.insert(auditLogs).values({ actorAdminId: adminId, action, targetType, targetId, meta });
}

/* ------------------------------------------------------------------ */
/* Job postings                                                        */
/* ------------------------------------------------------------------ */

export const POSTING_STATUSES = ["draft", "pending_review", "published", "closed"] as const;
type PostingStatus = (typeof POSTING_STATUSES)[number];

export function isPostingStatus(value: string): value is PostingStatus {
  return (POSTING_STATUSES as readonly string[]).includes(value);
}

const jobColumns = {
  id: jobPostings.id,
  title: jobPostings.title,
  slug: jobPostings.slug,
  companyId: jobPostings.companyId,
  status: jobPostings.status,
  location: jobPostings.location,
  jobType: jobPostings.jobType,
  workMode: jobPostings.workMode,
  viewCount: jobPostings.viewCount,
  publishedAt: jobPostings.publishedAt,
  createdBy: jobPostings.createdBy,
  createdAt: jobPostings.createdAt,
  companyName: companies.name,
  companySlug: companies.slug,
};

function toAdminJob(row: {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  status: PostingStatus;
  location: string;
  jobType: string;
  workMode: string;
  viewCount: number;
  publishedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  companyName: string;
  companySlug: string;
}): AdminJobPosting {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    companyId: row.companyId,
    status: row.status,
    location: row.location || undefined,
    jobType: row.jobType || undefined,
    workMode: row.workMode || undefined,
    viewCount: row.viewCount,
    publishedAt: iso(row.publishedAt),
    createdBy: row.createdBy,
    createdAt: iso(row.createdAt),
    company: { id: row.companyId, name: row.companyName, slug: row.companySlug },
  };
}

export async function listAdminJobs(opts: { status?: PostingStatus; q?: string; page: number; limit: number }) {
  const conditions: SQL[] = [];
  if (opts.status) conditions.push(eq(jobPostings.status, opts.status));
  if (opts.q) {
    const pattern = `%${escapeLike(opts.q)}%`;
    conditions.push(or(ilike(jobPostings.title, pattern), ilike(companies.name, pattern)) as SQL);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRows, pendingRows] = await Promise.all([
    db
      .select(jobColumns)
      .from(jobPostings)
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .where(where)
      .orderBy(desc(jobPostings.createdAt), desc(jobPostings.id))
      .limit(opts.limit)
      .offset((opts.page - 1) * opts.limit),
    db
      .select({ value: count() })
      .from(jobPostings)
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .where(where),
    // Unfiltered, so the page header can say "N awaiting review" whatever filter is applied.
    db.select({ value: count() }).from(jobPostings).where(eq(jobPostings.status, "pending_review")),
  ]);

  return {
    data: rows.map(toAdminJob),
    meta: buildMeta(opts.page, opts.limit, totalRows[0]?.value ?? 0),
    summary: { pendingReview: pendingRows[0]?.value ?? 0 },
  };
}

export type JobAction = "approve" | "reject" | "close" | "reopen";

const JOB_TRANSITIONS: Record<
  JobAction,
  { from: readonly PostingStatus[]; to: PostingStatus; audit: string }
> = {
  approve: { from: ["pending_review"], to: "published", audit: "job.approved" },
  reject: { from: ["pending_review"], to: "draft", audit: "job.rejected" },
  close: { from: ["published"], to: "closed", audit: "job.closed" },
  reopen: { from: ["closed"], to: "published", audit: "job.reopened" },
};

export function isJobAction(value: string): value is JobAction {
  return value in JOB_TRANSITIONS;
}

export type JobActionResult =
  | { ok: true; job: AdminJobPosting }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "conflict"; currentStatus: PostingStatus };

/**
 * Moves a posting through the moderation workflow. The row is locked and its
 * current status re-checked inside the transaction, so two admins clicking at
 * once can't both succeed, and the audit entry is written atomically with the
 * change. Publishing stamps `publishedAt`; closing stamps `closedAt` - the
 * same fields the employer-side actions maintain.
 */
export async function applyJobAction(
  id: string,
  action: JobAction,
  adminId: string,
  reason?: string,
): Promise<JobActionResult> {
  const transition = JOB_TRANSITIONS[action];

  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({ status: jobPostings.status })
      .from(jobPostings)
      .where(eq(jobPostings.id, id))
      .for("update");

    if (!current) return { ok: false, reason: "not_found" } as const;
    if (!transition.from.includes(current.status)) {
      return { ok: false, reason: "conflict", currentStatus: current.status } as const;
    }

    const now = new Date();
    await tx
      .update(jobPostings)
      .set(
        transition.to === "published"
          ? { status: "published", publishedAt: now, closedAt: null }
          : transition.to === "closed"
            ? { status: "closed", closedAt: now }
            : { status: transition.to, closedAt: null },
      )
      .where(eq(jobPostings.id, id));

    await logAdminAction(tx, adminId, transition.audit, "job_posting", id, {
      from: current.status,
      to: transition.to,
      ...(reason ? { reason } : {}),
    });

    const [row] = await tx
      .select(jobColumns)
      .from(jobPostings)
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .where(eq(jobPostings.id, id));

    return { ok: true, job: toAdminJob(row) } as const;
  });
}

/* ------------------------------------------------------------------ */
/* Companies                                                           */
/* ------------------------------------------------------------------ */

export const COMPANY_STATUSES = ["pending", "approved", "suspended"] as const;
type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export function isCompanyStatus(value: string): value is CompanyStatus {
  return (COMPANY_STATUSES as readonly string[]).includes(value);
}

const companyColumns = {
  id: companies.id,
  name: companies.name,
  slug: companies.slug,
  location: companies.location,
  industry: companies.industry,
  status: companies.status,
  createdBy: companies.createdBy,
  createdAt: companies.createdAt,
};

function toAdminCompany(row: {
  id: string;
  name: string;
  slug: string;
  location: string;
  industry: string;
  status: CompanyStatus;
  createdBy: string;
  createdAt: Date;
}): AdminCompany {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    location: row.location || undefined,
    industry: row.industry || undefined,
    status: row.status,
    createdBy: row.createdBy,
    createdAt: iso(row.createdAt),
  };
}

export async function listAdminCompanies(opts: { status?: CompanyStatus; q?: string; page: number; limit: number }) {
  const conditions: SQL[] = [];
  if (opts.status) conditions.push(eq(companies.status, opts.status));
  if (opts.q) conditions.push(ilike(companies.name, `%${escapeLike(opts.q)}%`));
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRows, pendingRows] = await Promise.all([
    db
      .select(companyColumns)
      .from(companies)
      .where(where)
      .orderBy(desc(companies.createdAt), desc(companies.id))
      .limit(opts.limit)
      .offset((opts.page - 1) * opts.limit),
    db.select({ value: count() }).from(companies).where(where),
    db.select({ value: count() }).from(companies).where(eq(companies.status, "pending")),
  ]);

  return {
    data: rows.map(toAdminCompany),
    meta: buildMeta(opts.page, opts.limit, totalRows[0]?.value ?? 0),
    summary: { pending: pendingRows[0]?.value ?? 0 },
  };
}

const COMPANY_AUDIT: Record<CompanyStatus, string> = {
  approved: "company.approved",
  suspended: "company.suspended",
  pending: "company.set_pending",
};

/** Sets a company's moderation status. A no-op (no audit entry) if it already has that status. */
export async function setCompanyStatus(
  id: string,
  status: CompanyStatus,
  adminId: string,
): Promise<AdminCompany | null> {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({ status: companies.status })
      .from(companies)
      .where(eq(companies.id, id))
      .for("update");
    if (!current) return null;

    if (current.status !== status) {
      await tx.update(companies).set({ status }).where(eq(companies.id, id));
      await logAdminAction(tx, adminId, COMPANY_AUDIT[status], "company", id, {
        from: current.status,
        to: status,
      });
    }

    const [row] = await tx.select(companyColumns).from(companies).where(eq(companies.id, id));
    return toAdminCompany(row);
  });
}

/* ------------------------------------------------------------------ */
/* Applications (jobseeker applications made against job-board postings) */
/* ------------------------------------------------------------------ */

export function isApplicationStatus(value: string): value is (typeof APPLICATION_STATUSES)[number] {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export async function listAdminApplications(opts: { status?: string; q?: string; page: number; limit: number }) {
  // Only tracked jobs that were created from a public posting are "applications"
  // in the admin sense; a jobseeker's manually-added jobs have no posting.
  const conditions: SQL[] = [];
  if (opts.status) conditions.push(eq(jobs.applicationStatus, opts.status));
  if (opts.q) {
    const pattern = `%${escapeLike(opts.q)}%`;
    conditions.push(
      or(ilike(users.name, pattern), ilike(jobPostings.title, pattern), ilike(companies.name, pattern)) as SQL,
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const appliedAt = sql<Date>`coalesce(${jobs.applicationDate}, ${jobs.createdAt})`;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: jobs.id,
        jobId: jobPostings.id,
        jobTitle: jobPostings.title,
        companyId: companies.id,
        companyName: companies.name,
        applicantId: users.id,
        applicantName: users.name,
        applicantEmail: users.email,
        status: jobs.applicationStatus,
        appliedAt,
      })
      .from(jobs)
      .innerJoin(jobPostings, eq(jobs.jobPostingId, jobPostings.id))
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .innerJoin(users, eq(jobs.userId, users.id))
      .where(where)
      .orderBy(desc(appliedAt), desc(jobs.id))
      .limit(opts.limit)
      .offset((opts.page - 1) * opts.limit),
    db
      .select({ value: count() })
      .from(jobs)
      .innerJoin(jobPostings, eq(jobs.jobPostingId, jobPostings.id))
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .innerJoin(users, eq(jobs.userId, users.id))
      .where(where),
  ]);

  const data: AdminApplication[] = rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    jobTitle: row.jobTitle,
    companyId: row.companyId,
    companyName: row.companyName,
    applicantId: row.applicantId,
    applicantName: row.applicantName,
    applicantEmail: row.applicantEmail,
    status: row.status as AdminApplication["status"],
    // coalesce() comes back as a Date from postgres-js, but guard against a string.
    appliedAt: new Date(row.appliedAt).toISOString(),
  }));

  return { data, meta: buildMeta(opts.page, opts.limit, totalRows[0]?.value ?? 0) };
}

/* ------------------------------------------------------------------ */
/* Audit log                                                           */
/* ------------------------------------------------------------------ */

export async function listAdminAuditLogs(opts: { page: number; limit: number }) {
  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
      .limit(opts.limit)
      .offset((opts.page - 1) * opts.limit),
    db.select({ value: count() }).from(auditLogs),
  ]);

  const data: AuditLogEntry[] = rows.map((log) => ({
    id: log.id,
    actorId: log.actorAdminId ?? log.actorUserId,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    meta: log.meta,
    createdAt: log.createdAt.toISOString(),
  }));

  return { data, meta: buildMeta(opts.page, opts.limit, totalRows[0]?.value ?? 0) };
}
