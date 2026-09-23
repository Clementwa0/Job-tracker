import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, companies, jobPostings, jobs, users } from "@/lib/db/schema";
import type { AdminAnalytics, AdminAnalyticsCharts, AdminAnalyticsOverview, AdminAnalyticsPeriod } from "@/types/admin";

const PERIOD_DAYS: Record<AdminAnalyticsPeriod, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365, all: 36500 };

function countBy(values: string[]) {
  const counts: Record<string, number> = {};
  for (const value of values) if (value) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function trendCounts(dates: (Date | null)[]) {
  const now = Date.now();
  return dates.reduce((trend, date) => {
    if (!date) return trend;
    const age = now - date.getTime();
    if (age <= 30 * 86400000) trend.month += 1;
    if (age <= 7 * 86400000) trend.week += 1;
    if (age <= 86400000) trend.today += 1;
    return trend;
  }, { month: 0, week: 0, today: 0 });
}

export async function getAdminOverview(): Promise<AdminAnalyticsOverview> {
  const [allUsers, allCompanies, allJobs, employers, published, pending, draft, closed] = await Promise.all([
    db.select({ createdAt: users.createdAt }).from(users),
    db.select({ createdAt: companies.createdAt }).from(companies),
    db.select({ createdAt: jobPostings.createdAt }).from(jobPostings),
    db.select({ createdAt: users.createdAt }).from(users).where(eq(users.role, "employer")),
    db.select({ count: sql<number>`count(*)::int` }).from(jobPostings).where(eq(jobPostings.status, "published")),
    db.select({ count: sql<number>`count(*)::int` }).from(jobPostings).where(eq(jobPostings.status, "pending_review")),
    db.select({ count: sql<number>`count(*)::int` }).from(jobPostings).where(eq(jobPostings.status, "draft")),
    db.select({ count: sql<number>`count(*)::int` }).from(jobPostings).where(eq(jobPostings.status, "closed")),
  ]);
  const total = (rows: { count: number }[]) => rows[0]?.count ?? 0;
  return {
    totalUsers: allUsers.length, totalEmployers: employers.length, totalCompanies: allCompanies.length, totalJobs: allJobs.length,
    publishedJobs: total(published), pendingJobs: total(pending), draftJobs: total(draft), closedJobs: total(closed),
    trends: { users: trendCounts(allUsers.map((row) => row.createdAt)), employers: trendCounts(employers.map((row) => row.createdAt)), companies: trendCounts(allCompanies.map((row) => row.createdAt)), jobs: trendCounts(allJobs.map((row) => row.createdAt)) },
  };
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const [userRows, jobRows, companyRows, tracker, logs] = await Promise.all([
    db.select({ role: users.role, accountStatus: users.accountStatus }).from(users),
    db.select({ status: jobPostings.status, viewCount: jobPostings.viewCount }).from(jobPostings),
    db.select({ status: companies.status }).from(companies),
    db.select({ count: sql<number>`count(*)::int` }).from(jobs),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(10),
  ]);
  const byRole = countBy(userRows.map((row) => row.role));
  const byJobStatus = countBy(jobRows.map((row) => row.status));
  const byCompanyStatus = countBy(companyRows.map((row) => row.status));
  return {
    users: { total: userRows.length, byRole, suspended: userRows.filter((row) => row.accountStatus === "suspended").length },
    jobPostings: { total: jobRows.length, byStatus: byJobStatus, pendingReview: byJobStatus.pending_review ?? 0, totalViews: jobRows.reduce((sum, row) => sum + row.viewCount, 0) },
    companies: { total: companyRows.length, byStatus: byCompanyStatus, pending: byCompanyStatus.pending ?? 0 },
    trackerJobs: tracker[0]?.count ?? 0,
    recentAuditLogs: logs.map((log) => ({ id: log.id, actorId: log.actorAdminId ?? log.actorUserId, action: log.action, targetType: log.targetType, targetId: log.targetId, meta: log.meta, createdAt: log.createdAt.toISOString() })),
  };
}

export async function getAdminCharts(period: AdminAnalyticsPeriod): Promise<AdminAnalyticsCharts> {
  const since = new Date(Date.now() - PERIOD_DAYS[period] * 86400000);
  const [jobRows, userRows, employerRows] = await Promise.all([
    db.select({ status: jobPostings.status, category: jobPostings.category, location: jobPostings.location, createdAt: jobPostings.createdAt }).from(jobPostings).where(gte(jobPostings.createdAt, since)),
    db.select({ createdAt: users.createdAt }).from(users).where(and(eq(users.role, "jobseeker"), gte(users.createdAt, since))),
    db.select({ createdAt: users.createdAt }).from(users).where(and(eq(users.role, "employer"), gte(users.createdAt, since))),
  ]);
  const top = (values: string[]) => Object.entries(countBy(values)).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  const daily = (dates: (Date | null)[]) => top(dates.map((date) => date?.toISOString().slice(0, 10) ?? "")).sort((a, b) => a.name.localeCompare(b.name)).map(({ name, count }) => ({ date: name, count }));
  const statuses = top(jobRows.map((row) => row.status));
  return {
    period,
    jobStatusDistribution: statuses.map(({ name, count }) => ({ name, value: count, status: name })),
    jobsOverTime: daily(jobRows.map((row) => row.createdAt)),
    userGrowth: daily(userRows.map((row) => row.createdAt)).map(({ date, count }) => ({ period: date, count })),
    employerGrowth: daily(employerRows.map((row) => row.createdAt)).map(({ date, count }) => ({ period: date, count })),
    topCategories: top(jobRows.map((row) => row.category)), topLocations: top(jobRows.map((row) => row.location)),
  };
}