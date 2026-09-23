import { NextResponse } from "next/server";
import {
  and,
  arrayOverlaps,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { jobPriorityEnum, jobs } from "@/lib/db/schema";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { countJobs, createJob, listJobs } from "@/lib/jobs/queries";
import { JobInputError, sanitizeJobInput } from "@/lib/jobs/sanitizeJobInput";
import { serializeJob } from "@/lib/jobs/serializeJob";
import { PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION, pgErrorCode } from "@/lib/db/errors";
import { normalizeStatus } from "@/lib/jobs/status";
import { isUuid } from "@/lib/uuid";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const SORT_COLUMNS = {
  createdAt: jobs.createdAt,
  updatedAt: jobs.updatedAt,
  jobTitle: jobs.jobTitle,
  companyName: jobs.companyName,
  applicationDate: jobs.applicationDate,
  applicationDeadline: jobs.applicationDeadline,
  applicationStatus: jobs.applicationStatus,
  priority: jobs.priority,
} as const;

type SortField = keyof typeof SORT_COLUMNS;

const PRIORITIES: readonly string[] = jobPriorityEnum.enumValues;

/** Escapes LIKE/ILIKE wildcards so user input is matched literally. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function csv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseSort(raw: string | null): SQL[] {
  const param = raw || "-createdAt";
  const desc_ = param.startsWith("-");
  const field = desc_ ? param.slice(1) : param;
  const column =
    SORT_COLUMNS[
      (Object.prototype.hasOwnProperty.call(SORT_COLUMNS, field) ? field : "createdAt") as SortField
    ];
  // NULLS LAST both ways (Postgres would otherwise put NULLs first on DESC),
  // then id as a tiebreaker so pagination is stable.
  return [
    desc_ ? sql`${column} DESC NULLS LAST` : sql`${column} ASC NULLS LAST`,
    desc(jobs.id),
  ];
}

export async function GET(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);

  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
  );

  const conditions: SQL[] = [];

  const archived = searchParams.get("archived");
  if (archived === "true") conditions.push(eq(jobs.isArchived, true));
  else if (archived !== "all") conditions.push(eq(jobs.isArchived, false));

  const status = csv(searchParams.get("status"));
  if (status.length) {
    conditions.push(inArray(jobs.applicationStatus, status.map(normalizeStatus)));
  }

  const priority = csv(searchParams.get("priority")).filter((p) => PRIORITIES.includes(p));
  if (searchParams.get("priority")) {
    // Unknown priorities can't match anything (and would be a type error
    // against the enum column), so an all-invalid filter matches nothing.
    conditions.push(
      priority.length
        ? inArray(jobs.priority, priority as (typeof jobPriorityEnum.enumValues)[number][])
        : sql`false`,
    );
  }

  const jobType = csv(searchParams.get("jobType"));
  if (jobType.length) conditions.push(inArray(jobs.jobType, jobType));

  const workMode = csv(searchParams.get("workMode"));
  if (workMode.length) conditions.push(inArray(jobs.workMode, workMode));

  const tag = csv(searchParams.get("tag"));
  if (tag.length) conditions.push(arrayOverlaps(jobs.tags, tag));

  const company = searchParams.get("company");
  if (company) conditions.push(ilike(jobs.companyName, `%${escapeLike(company)}%`));

  const jobPostingId = searchParams.get("jobPostingId");
  if (jobPostingId) {
    conditions.push(isUuid(jobPostingId) ? eq(jobs.jobPostingId, jobPostingId) : sql`false`);
  }

  const q = searchParams.get("q");
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    const match = or(
      ilike(jobs.jobTitle, pattern),
      ilike(jobs.companyName, pattern),
      ilike(jobs.location, pattern),
    );
    if (match) conditions.push(match);
  }

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from && !Number.isNaN(new Date(from).getTime())) {
    conditions.push(gte(jobs.applicationDate, new Date(from)));
  }
  if (to && !Number.isNaN(new Date(to).getTime())) {
    conditions.push(lte(jobs.applicationDate, new Date(to)));
  }

  const minSalary = searchParams.get("minSalary");
  const maxSalary = searchParams.get("maxSalary");
  if (minSalary && !Number.isNaN(Number(minSalary))) {
    conditions.push(gte(jobs.salaryMax, Number(minSalary)));
  }
  if (maxSalary && !Number.isNaN(Number(maxSalary))) {
    conditions.push(lte(jobs.salaryMin, Number(maxSalary)));
  }

  const where = and(...conditions);
  const userId = auth.payload.sub;

  try {
    const [data, total] = await Promise.all([
      listJobs({
        userId,
        where,
        orderBy: parseSort(searchParams.get("sort")),
        limit,
        offset: (page - 1) * limit,
      }),
      countJobs(userId, where),
    ]);

    return NextResponse.json({
      success: true,
      data: data.map(serializeJob),
      meta: { page, limit, total },
    });
  } catch (error) {
    console.error("Failed to list jobs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load your applications." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["user"]);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const jobTitle = String((body as Record<string, unknown>).jobTitle ?? "").trim();
  const companyName = String((body as Record<string, unknown>).companyName ?? "").trim();
  if (!jobTitle || !companyName) {
    return NextResponse.json(
      { success: false, message: "Job title and company name are required." },
      { status: 400 },
    );
  }

  try {
    const job = await createJob(
      auth.payload.sub,
      sanitizeJobInput(body as Record<string, unknown>),
    );

    return NextResponse.json(
      { success: true, data: { job: serializeJob(job) } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof JobInputError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    if (pgErrorCode(error) === PG_UNIQUE_VIOLATION) {
      return NextResponse.json(
        { success: false, message: "You're already tracking this job." },
        { status: 409 },
      );
    }
    if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) {
      return NextResponse.json(
        { success: false, message: "The referenced job posting doesn't exist." },
        { status: 400 },
      );
    }
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create application." },
      { status: 500 },
    );
  }
}
