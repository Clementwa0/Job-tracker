const Job = require("../models/Jobs");

// Allowed fields to write — keeps requests safe
const ALLOWED_FIELDS = [
  "jobTitle", "companyName", "companyLogo", "location", "jobType", "workMode",
  "applicationDate", "applicationDeadline", "source", "applicationStatus",
  "priority", "tags",
  "salaryMin", "salaryMax", "salaryCurrency", "salaryRange",
  "contactPerson", "contactEmail", "contactPhone", "recruiterLinkedIn",
  "resumeFile", "coverLetterFile", "attachments",
  "jobPostingUrl", "jobDescription", "matchScore", "matchAnalysis",
  "jobPostingId",
  "notes", "reminders", "isArchived",
];

function pickFields(body) {
  const out = {};
  for (const k of ALLOWED_FIELDS) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

const NO_RESPONSE_STATUSES = ["applied", "waiting_response", "ghosted"];

const SORT_MAP = {
  createdAt: "createdAt",
  "-createdAt": "-createdAt",
  priority: "priority",
  "-priority": "-priority",
  status: "applicationStatus",
  "-status": "-applicationStatus",
  applicationDate: "applicationDate",
  "-applicationDate": "-applicationDate",
};

function resolveSort(sortParam) {
  return SORT_MAP[sortParam] || SORT_MAP["-applicationDate"];
}

const addJob = async (req, res) => {
  try {
    const data = pickFields(req.body);
    const job = new Job({
      ...data,
      userId: req.userId,
      activity: [{ type: "system", message: "Job added" }],
    });
    await job.save();
    res.status(201).json({ success: true, message: "Job saved", data: { job: job.toJSON() } });
  } catch (error) {
    console.error("addJob:", error);
    res.status(500).json({ success: false, message: "Failed to add job", error: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const {
      q,
      status,
      company,
      jobType,
      workMode,
      priority,
      tag,
      from,
      to,
      minSalary,
      maxSalary,
      archived,
      sort: sortParam = "-applicationDate",
      page = 1,
      limit = 50,
    } = req.query;

    const sort = resolveSort(sortParam);

    const filter = { userId: req.userId };
    if (archived === "true") filter.isArchived = true;
    else if (archived === "all") {} // include both
    else filter.isArchived = { $ne: true };

    if (status) filter.applicationStatus = { $in: String(status).split(",") };
    if (company) filter.companyName = new RegExp(String(company), "i");
    if (jobType) filter.jobType = { $in: String(jobType).split(",") };
    if (workMode) filter.workMode = { $in: String(workMode).split(",") };
    if (priority) filter.priority = { $in: String(priority).split(",") };
    if (tag) filter.tags = { $in: String(tag).split(",") };
    if (req.query.jobPostingId) filter.jobPostingId = req.query.jobPostingId;
    if (from || to) {
      filter.applicationDate = {};
      if (from) filter.applicationDate.$gte = new Date(from);
      if (to) filter.applicationDate.$lte = new Date(to);
    }
    if (minSalary) filter.salaryMax = { ...(filter.salaryMax || {}), $gte: Number(minSalary) };
    if (maxSalary) filter.salaryMin = { ...(filter.salaryMin || {}), $lte: Number(maxSalary) };

    if (q) {
      const rx = new RegExp(String(q), "i");
      filter.$or = [
        { jobTitle: rx }, { companyName: rx }, { location: rx },
        { notes: rx }, { tags: rx }, { jobDescription: rx },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const lim = Math.min(500, Math.max(1, Number(limit)));

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort(sort).skip((pageNum - 1) * lim).limit(lim),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, data: jobs, meta: { page: pageNum, limit: lim, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch jobs", error: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.userId });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch job", error: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const data = pickFields(req.body);
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, message: "Job updated", data: job });
  } catch (error) {
    console.error("updateJob:", error);
    res.status(500).json({ success: false, message: "Failed to update job", error: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete job", error: error.message });
  }
};

const duplicateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.userId });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    const data = job.toObject();
    delete data._id; delete data.createdAt; delete data.updatedAt;
    data.jobTitle = `${data.jobTitle} (copy)`;
    data.applicationStatus = "applied";
    data.activity = [{ type: "system", message: "Duplicated from another job" }];
    const created = await Job.create({ ...data, userId: req.userId });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to duplicate", error: error.message });
  }
};

const archiveJob = async (req, res) => {
  try {
    const archive = req.body?.archive !== false;
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { isArchived: archive, archivedAt: archive ? new Date() : null } },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to archive", error: error.message });
  }
};

const bulkUpdate = async (req, res) => {
  try {
    const { ids = [], patch = {} } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids required" });
    }
    const safePatch = pickFields(patch);
    const result = await Job.updateMany(
      { _id: { $in: ids }, userId: req.userId },
      { $set: safePatch }
    );
    res.json({ success: true, data: { matched: result.matchedCount, modified: result.modifiedCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Bulk update failed", error: error.message });
  }
};

const bulkDelete = async (req, res) => {
  try {
    const { ids = [] } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids required" });
    }
    const result = await Job.deleteMany({ _id: { $in: ids }, userId: req.userId });
    res.json({ success: true, data: { deleted: result.deletedCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Bulk delete failed", error: error.message });
  }
};

const addActivity = async (req, res) => {
  try {
    const { type = "note", message, meta } = req.body || {};
    if (!message) return res.status(400).json({ success: false, message: "message required" });
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $push: { activity: { type, message, meta } } },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add activity", error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const baseFilter = { userId: req.userId, isArchived: { $ne: true } };

    const [statusAgg, total] = await Promise.all([
      Job.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: { $toLower: { $ifNull: ["$applicationStatus", "applied"] } },
            count: { $sum: 1 },
          },
        },
      ]),
      Job.countDocuments(baseFilter),
    ]);

    const statusCounts = {};
    for (const row of statusAgg) {
      statusCounts[row._id] = row.count;
    }

    const responseCount = statusAgg
      .filter((row) => !NO_RESPONSE_STATUSES.includes(row._id))
      .reduce((sum, row) => sum + row.count, 0);

    res.json({
      success: true,
      data: {
        total,
        statusCounts,
        responseRate: total ? Math.round((responseCount / total) * 100) : 0,
        interviewCount: statusCounts.interviewing || 0,
        offerCount: statusCounts.offer || 0,
        rejectedCount: statusCounts.rejected || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load stats", error: error.message });
  }
};

const getAnalyticsSummary = async (req, res) => {
  try {
    const baseFilter = { userId: req.userId, isArchived: { $ne: true } };
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const [
      statusAgg,
      companyAgg,
      locationAgg,
      jobTypeAgg,
      timelineAgg,
      total,
    ] = await Promise.all([
      Job.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: { $ifNull: ["$applicationStatus", "applied"] },
            count: { $sum: 1 },
          },
        },
      ]),
      Job.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$companyName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Job.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Job.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$jobType", count: { $sum: 1 } } },
      ]),
      Job.aggregate([
        {
          $match: {
            ...baseFilter,
            applicationDate: { $gte: weekAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$applicationDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Job.countDocuments(baseFilter),
    ]);

    const statusCounts = {};
    for (const row of statusAgg) {
      const key = (row._id || "applied").toLowerCase();
      statusCounts[key] = row.count;
    }

    const responseCount = Object.entries(statusCounts)
      .filter(([s]) => !NO_RESPONSE_STATUSES.includes(s))
      .reduce((sum, [, c]) => sum + c, 0);

    const interviewRate = total
      ? Number((((statusCounts.interviewing || 0) / total) * 100).toFixed(1))
      : 0;
    const offerRate = total
      ? Number((((statusCounts.offer || 0) / total) * 100).toFixed(1))
      : 0;

    // Cache-friendly shape: version + generatedAt for ETag/If-None-Match later
    res.json({
      success: true,
      data: {
        version: 1,
        generatedAt: now.toISOString(),
        metrics: {
          totalJobs: total,
          statusCounts,
          responseRate: total ? Math.round((responseCount / total) * 100) : 0,
          interviewRate,
          offerRate,
          activeApplications: statusCounts.applied || 0,
          interviewCount: statusCounts.interviewing || 0,
          offerCount: statusCounts.offer || 0,
          rejectedCount: statusCounts.rejected || 0,
        },
        charts: {
          status: Object.entries(statusCounts).map(([status, count]) => ({
            key: status,
            status: status.charAt(0).toUpperCase() + status.slice(1),
            count,
          })),
          companies: companyAgg.map((r) => ({
            company: r._id || "Unknown",
            count: r.count,
          })),
          locations: locationAgg.map((r) => ({
            location: r._id || "Unknown",
            count: r.count,
          })),
          jobTypes: jobTypeAgg.map((r) => ({
            type: r._id || "Unknown",
            count: r.count,
          })),
          timeline: timelineAgg.map((r) => ({
            date: r._id,
            count: r.count,
          })),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load analytics",
      error: error.message,
    });
  }
};

module.exports = {
  addJob, getJobs, getJobById, updateJob, deleteJob,
  duplicateJob, archiveJob, bulkUpdate, bulkDelete, addActivity, getStats,
  getAnalyticsSummary, resolveSort,
};
