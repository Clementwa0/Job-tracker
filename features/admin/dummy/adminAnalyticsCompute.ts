import type {
  AdminAnalytics,
  AdminAnalyticsCharts,
  AdminAnalyticsOverview,
  AdminAnalyticsPeriod,
  AdminCompany,
  AdminJobPosting,
  AdminUser,
  AuditLogEntry,
  TrendCounts,
} from "@/types/admin";

const DAY_MS = 24 * 60 * 60 * 1000;

function trendCounts(dates: (string | undefined)[]): TrendCounts {
  const now = Date.now();
  let month = 0;
  let week = 0;
  let today = 0;
  for (const d of dates) {
    if (!d) continue;
    const t = new Date(d).getTime();
    if (Number.isNaN(t)) continue;
    const age = now - t;
    if (age <= 30 * DAY_MS) month += 1;
    if (age <= 7 * DAY_MS) week += 1;
    if (age <= DAY_MS) today += 1;
  }
  return { month, week, today };
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export function computeOverview(
  users: AdminUser[],
  companies: AdminCompany[],
  jobs: AdminJobPosting[],
): AdminAnalyticsOverview {
  const employers = users.filter((u) => u.role === "employer");
  const byStatus = countBy(jobs, (j) => j.status);

  return {
    totalUsers: users.length,
    totalEmployers: employers.length,
    totalCompanies: companies.length,
    totalJobs: jobs.length,
    publishedJobs: byStatus.published ?? 0,
    pendingJobs: byStatus.pending_review ?? 0,
    draftJobs: byStatus.draft ?? 0,
    closedJobs: byStatus.closed ?? 0,
    trends: {
      users: trendCounts(users.map((u) => u.createdAt)),
      employers: trendCounts(employers.map((u) => u.createdAt)),
      companies: trendCounts(companies.map((c) => c.createdAt)),
      jobs: trendCounts(jobs.map((j) => j.createdAt)),
    },
  };
}

export function computeAnalytics(
  users: AdminUser[],
  companies: AdminCompany[],
  jobs: AdminJobPosting[],
  auditLog: AuditLogEntry[],
): AdminAnalytics {
  const byRole = countBy(users, (u) => u.role);
  const byJobStatus = countBy(jobs, (j) => j.status);
  const byCompanyStatus = countBy(companies, (c) => c.status);

  return {
    users: {
      total: users.length,
      byRole,
      suspended: users.filter((u) => u.accountStatus === "suspended").length,
    },
    jobPostings: {
      total: jobs.length,
      byStatus: byJobStatus,
      pendingReview: byJobStatus.pending_review ?? 0,
      totalViews: jobs.reduce((sum, j) => sum + j.viewCount, 0),
    },
    companies: {
      total: companies.length,
      byStatus: byCompanyStatus,
      pending: byCompanyStatus.pending ?? 0,
    },
    trackerJobs: 0,
    recentAuditLogs: auditLog.slice(0, 10),
  };
}

const PERIOD_DAYS: Record<AdminAnalyticsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
  all: 36500,
};

function withinPeriod(date: string | undefined, period: AdminAnalyticsPeriod): boolean {
  if (!date) return false;
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= PERIOD_DAYS[period] * DAY_MS;
}

const STATUS_LABELS: Record<string, string> = {
  published: "Published",
  pending_review: "Pending review",
  draft: "Draft",
  closed: "Closed",
};

export function computeCharts(
  users: AdminUser[],
  jobs: AdminJobPosting[],
  period: AdminAnalyticsPeriod,
): AdminAnalyticsCharts {
  const jobsInPeriod = jobs.filter((j) => withinPeriod(j.createdAt, period));
  const employersInPeriod = users.filter((u) => u.role === "employer" && withinPeriod(u.createdAt, period));
  const usersInPeriod = users.filter((u) => u.role === "user" && withinPeriod(u.createdAt, period));

  const statusCounts = countBy(jobs, (j) => j.status);
  const jobStatusDistribution = Object.entries(statusCounts).map(([status, value]) => ({
    name: STATUS_LABELS[status] ?? status,
    value,
    status,
  }));

  const byDay = (items: { createdAt?: string }[]) => {
    const buckets = countBy(
      items.filter((i) => i.createdAt),
      (i) => new Date(i.createdAt as string).toISOString().slice(0, 10),
    );
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  };

  const jobsOverTime = byDay(jobsInPeriod);
  const userGrowth = byDay(usersInPeriod).map(({ date, count }) => ({ period: date, count }));
  const employerGrowth = byDay(employersInPeriod).map(({ date, count }) => ({ period: date, count }));

  const topLocations = Object.entries(countBy(jobs.filter((j) => j.location), (j) => j.location as string))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    period,
    jobStatusDistribution,
    jobsOverTime,
    userGrowth,
    employerGrowth,
    topCategories: [], // Dummy jobs don't carry tags in the admin model - left empty rather than fabricated.
    topLocations,
  };
}
