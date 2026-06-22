const User = require("../models/User");
const Company = require("../models/Company");
const JobPosting = require("../models/JobPosting");

const VALID_PERIODS = new Set(["7d", "30d", "90d", "12m", "all"]);

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d = new Date()) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d = new Date()) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function periodSince(period) {
  if (period === "all") return null;
  const now = new Date();
  if (period === "12m") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 12);
    return d;
  }
  const days = { "7d": 7, "30d": 30, "90d": 90 }[period] || 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function dateBucketFormat(period) {
  if (period === "7d" || period === "30d") return "%Y-%m-%d";
  if (period === "90d") return "%Y-W%V";
  return "%Y-%m";
}

async function countSince(model, filter, since) {
  const q = since ? { ...filter, createdAt: { $gte: since } } : filter;
  return model.countDocuments(q);
}

async function trendCounts(model, extraFilter = {}) {
  const [month, week, today] = await Promise.all([
    model.countDocuments({ ...extraFilter, createdAt: { $gte: startOfMonth() } }),
    model.countDocuments({ ...extraFilter, createdAt: { $gte: startOfWeek() } }),
    model.countDocuments({ ...extraFilter, createdAt: { $gte: startOfDay() } }),
  ]);
  return { month, week, today };
}

async function timeSeries(model, period, extraFilter = {}) {
  const since = periodSince(period);
  const match = since ? { ...extraFilter, createdAt: { $gte: since } } : { ...extraFilter };
  const fmt = dateBucketFormat(period);

  const rows = await model.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: fmt, date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((r) => ({ period: r._id, count: r.count }));
}

/**
 * KPI overview with all-time totals and registration trends.
 */
async function getOverview() {
  const [
    userStats,
    postingStats,
    companyTotal,
    employerTotal,
    userTrends,
    employerTrends,
    companyTrends,
    jobTrends,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    JobPosting.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Company.countDocuments(),
    User.countDocuments({ role: "employer" }),
    trendCounts(User),
    trendCounts(User, { role: "employer" }),
    trendCounts(Company),
    trendCounts(JobPosting),
  ]);

  const usersByRole = Object.fromEntries(userStats.map((s) => [s._id, s.count]));
  const byStatus = Object.fromEntries(postingStats.map((s) => [s._id, s.count]));

  return {
    totalUsers: Object.values(usersByRole).reduce((a, b) => a + b, 0),
    totalEmployers: employerTotal,
    totalCompanies: companyTotal,
    totalJobs: Object.values(byStatus).reduce((a, b) => a + b, 0),
    publishedJobs: byStatus.published || 0,
    pendingJobs: byStatus.pending_review || 0,
    draftJobs: byStatus.draft || 0,
    closedJobs: byStatus.closed || 0,
    trends: {
      users: userTrends,
      employers: employerTrends,
      companies: companyTrends,
      jobs: jobTrends,
    },
  };
}

/**
 * Chart data for a given analytics period filter.
 */
async function getCharts(period = "30d") {
  const safePeriod = VALID_PERIODS.has(period) ? period : "30d";
  const since = periodSince(safePeriod);
  const dateFilter = since ? { createdAt: { $gte: since } } : {};

  const [
    postingStats,
    jobsOverTime,
    userGrowth,
    employerGrowth,
    topTags,
    topLocations,
  ] = await Promise.all([
    JobPosting.aggregate([
      ...(since ? [{ $match: dateFilter }] : []),
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    timeSeries(JobPosting, safePeriod),
    timeSeries(User, safePeriod),
    timeSeries(User, safePeriod, { role: "employer" }),
    JobPosting.aggregate([
      ...(since ? [{ $match: dateFilter }] : []),
      { $unwind: { path: "$tags", preserveNullAndEmptyArrays: false } },
      { $group: { _id: { $toLower: "$tags" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    JobPosting.aggregate([
      ...(since ? [{ $match: dateFilter }] : []),
      {
        $project: {
          loc: {
            $cond: [
              { $eq: ["$workMode", "remote"] },
              "Remote",
              {
                $cond: [
                  { $and: [{ $ne: ["$location", null] }, { $ne: ["$location", ""] }] },
                  "$location",
                  "Unspecified",
                ],
              },
            ],
          },
        },
      },
      { $group: { _id: "$loc", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const statusLabels = {
    published: "Published",
    pending_review: "Pending",
    draft: "Draft",
    closed: "Closed",
  };

  const jobStatusDistribution = postingStats.map((s) => ({
    name: statusLabels[s._id] || s._id,
    value: s.count,
    status: s._id,
  }));

  const formatTag = (tag) =>
    tag
      .split(/[\s_-]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return {
    period: safePeriod,
    jobStatusDistribution,
    jobsOverTime: jobsOverTime.map((r) => ({ date: r.period, count: r.count })),
    userGrowth: userGrowth.map((r) => ({ period: r.period, count: r.count })),
    employerGrowth: employerGrowth.map((r) => ({ period: r.period, count: r.count })),
    topCategories: topTags.map((t) => ({
      name: formatTag(t._id),
      count: t.count,
    })),
    topLocations: topLocations.map((l) => ({
      name: l._id,
      count: l.count,
    })),
  };
}

module.exports = { getOverview, getCharts, VALID_PERIODS };
