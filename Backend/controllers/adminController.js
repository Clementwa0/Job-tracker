const User = require("../models/User");
const Company = require("../models/Company");
const JobPosting = require("../models/JobPosting");
const Job = require("../models/Jobs");
const AuditLog = require("../models/AuditLog");
const { logAudit } = require("../utils/auditLog");
const { enqueueNotification } = require("../services/notificationService");

function toUserClient(user) {
  const obj = user.toJSON ? user.toJSON() : user;
  return {
    id: String(obj._id || obj.id),
    name: obj.name,
    email: obj.email,
    role: obj.role,
    accountStatus: obj.accountStatus,
    emailVerified: obj.emailVerified,
    createdAt: obj.createdAt,
    lastLoginAt: obj.lastLoginAt,
  };
}

function toCompanyClient(company) {
  const obj = company.toObject ? company.toObject() : company;
  return {
    id: String(obj._id),
    name: obj.name,
    slug: obj.slug,
    location: obj.location,
    industry: obj.industry,
    status: obj.status,
    createdBy: String(obj.createdBy),
    createdAt: obj.createdAt,
  };
}

function toPostingClient(doc, company = null) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(obj._id),
    title: obj.title,
    slug: obj.slug,
    companyId: String(obj.companyId),
    status: obj.status,
    location: obj.location,
    jobType: obj.jobType,
    workMode: obj.workMode,
    viewCount: obj.viewCount || 0,
    publishedAt: obj.publishedAt,
    createdBy: String(obj.createdBy),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    company: company
      ? { id: String(company._id), name: company.name, slug: company.slug }
      : undefined,
  };
}

function toAuditClient(log) {
  const obj = log.toObject ? log.toObject() : log;
  return {
    id: String(obj._id),
    actorId: obj.actorId ? String(obj.actorId) : null,
    action: obj.action,
    targetType: obj.targetType,
    targetId: String(obj.targetId),
    meta: obj.meta,
    createdAt: obj.createdAt,
  };
}

/**
 * GET /api/admin/analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const [
      userStats,
      postingStats,
      companyStats,
      trackerJobs,
      totalViews,
      recentLogs,
    ] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),
      JobPosting.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Company.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Job.countDocuments(),
      JobPosting.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }]),
      AuditLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const usersByRole = Object.fromEntries(userStats.map((s) => [s._id, s.count]));
    const postingsByStatus = Object.fromEntries(postingStats.map((s) => [s._id, s.count]));
    const companiesByStatus = Object.fromEntries(companyStats.map((s) => [s._id, s.count]));

    res.json({
      success: true,
      data: {
        users: {
          total: Object.values(usersByRole).reduce((a, b) => a + b, 0),
          byRole: usersByRole,
          suspended: await User.countDocuments({ accountStatus: "suspended" }),
        },
        jobPostings: {
          total: Object.values(postingsByStatus).reduce((a, b) => a + b, 0),
          byStatus: postingsByStatus,
          pendingReview: postingsByStatus.pending_review || 0,
          totalViews: totalViews[0]?.total || 0,
        },
        companies: {
          total: Object.values(companiesByStatus).reduce((a, b) => a + b, 0),
          byStatus: companiesByStatus,
          pending: companiesByStatus.pending || 0,
        },
        trackerJobs,
        recentAuditLogs: recentLogs.map(toAuditClient),
      },
    });
  } catch (error) {
    console.error("getAnalytics:", error);
    res.status(500).json({ success: false, message: "Failed to load analytics", error: error.message });
  }
};

/**
 * GET /api/admin/users
 */
exports.listUsers = async (req, res) => {
  try {
    const { role, status, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = { $in: String(role).split(",") };
    if (status) filter.accountStatus = status;
    if (q) {
      const rx = new RegExp(String(q), "i");
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const pageNum = Math.max(1, Number(page));
    const lim = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * lim;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users.map(toUserClient),
      meta: { page: pageNum, limit: lim, total, totalPages: Math.ceil(total / lim) || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list users", error: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/status
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    if (String(req.params.id) === String(req.userId)) {
      return res.status(400).json({ success: false, message: "Cannot change your own account status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus: status },
      { new: true },
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await logAudit({
      actorId: req.userId,
      action: `user.${status}`,
      targetType: "User",
      targetId: user._id,
    });

    res.json({ success: true, data: toUserClient(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user", error: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/role
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "employer", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    if (String(req.params.id) === String(req.userId)) {
      return res.status(400).json({ success: false, message: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await logAudit({
      actorId: req.userId,
      action: `user.role.${role}`,
      targetType: "User",
      targetId: user._id,
    });

    res.json({ success: true, data: toUserClient(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update role", error: error.message });
  }
};

/**
 * GET /api/admin/jobs
 */
exports.listJobs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = { $in: String(req.query.status).split(",") };
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      JobPosting.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      JobPosting.countDocuments(filter),
    ]);

    const companyIds = [...new Set(jobs.map((j) => String(j.companyId)))];
    const companies = await Company.find({ _id: { $in: companyIds } });
    const companyMap = new Map(companies.map((c) => [String(c._id), c]));

    res.json({
      success: true,
      data: jobs.map((j) => toPostingClient(j, companyMap.get(String(j.companyId)))),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list jobs", error: error.message });
  }
};

/**
 * PATCH /api/admin/jobs/:id/approve
 */
exports.approveJob = async (req, res) => {
  try {
    const posting = await JobPosting.findById(req.params.id);
    if (!posting) return res.status(404).json({ success: false, message: "Job not found" });

    if (!["pending_review", "draft"].includes(posting.status)) {
      return res.status(400).json({ success: false, message: "Job cannot be approved in current status" });
    }

    posting.status = "published";
    posting.publishedAt = new Date();
    posting.closedAt = undefined;
    await posting.save();

    const company = await Company.findById(posting.companyId);
    await logAudit({
      actorId: req.userId,
      action: "job.approve",
      targetType: "JobPosting",
      targetId: posting._id,
      meta: { title: posting.title },
    });

    enqueueNotification({
      userId: posting.createdBy,
      type: "job.approved",
      title: "Job approved",
      body: `"${posting.title}" has been approved and is now published.`,
      payload: { jobPostingId: String(posting._id), slug: posting.slug },
      channel: "email",
    }).catch((err) => console.error("approveJob notification:", err));

    res.json({ success: true, data: toPostingClient(posting, company) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to approve job", error: error.message });
  }
};

/**
 * PATCH /api/admin/jobs/:id/reject
 */
exports.rejectJob = async (req, res) => {
  try {
    const posting = await JobPosting.findById(req.params.id);
    if (!posting) return res.status(404).json({ success: false, message: "Job not found" });

    posting.status = "draft";
    posting.publishedAt = undefined;
    await posting.save();

    await logAudit({
      actorId: req.userId,
      action: "job.reject",
      targetType: "JobPosting",
      targetId: posting._id,
      meta: { reason: req.body.reason || "" },
    });

    enqueueNotification({
      userId: posting.createdBy,
      type: "job.rejected",
      title: "Job needs changes",
      body: `"${posting.title}" was returned to draft. ${req.body.reason ? `Reason: ${req.body.reason}` : ""}`.trim(),
      payload: { jobPostingId: String(posting._id), reason: req.body.reason || "" },
      channel: "in_app",
    }).catch((err) => console.error("rejectJob notification:", err));

    const company = await Company.findById(posting.companyId);
    res.json({ success: true, data: toPostingClient(posting, company) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to reject job", error: error.message });
  }
};

/**
 * PATCH /api/admin/jobs/:id/close
 */
exports.closeJob = async (req, res) => {
  try {
    const posting = await JobPosting.findByIdAndUpdate(
      req.params.id,
      { status: "closed", closedAt: new Date() },
      { new: true },
    );
    if (!posting) return res.status(404).json({ success: false, message: "Job not found" });

    await logAudit({
      actorId: req.userId,
      action: "job.close",
      targetType: "JobPosting",
      targetId: posting._id,
    });

    const company = await Company.findById(posting.companyId);
    res.json({ success: true, data: toPostingClient(posting, company) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to close job", error: error.message });
  }
};

/**
 * GET /api/admin/companies
 */
exports.listCompanies = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Company.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: companies.map(toCompanyClient),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list companies", error: error.message });
  }
};

/**
 * PATCH /api/admin/companies/:id/status
 */
exports.updateCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const company = await Company.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    await logAudit({
      actorId: req.userId,
      action: `company.${status}`,
      targetType: "Company",
      targetId: company._id,
      meta: { name: company.name },
    });

    if (status === "approved") {
      enqueueNotification({
        userId: company.createdBy,
        type: "company.approved",
        title: "Company approved",
        body: `${company.name} can now publish jobs on the platform.`,
        payload: { companyId: String(company._id), slug: company.slug },
        channel: "email",
      }).catch((err) => console.error("company.approved notification:", err));
    } else if (status === "suspended") {
      enqueueNotification({
        userId: company.createdBy,
        type: "company.suspended",
        title: "Company suspended",
        body: `${company.name} has been suspended. Contact support for details.`,
        payload: { companyId: String(company._id) },
        channel: "in_app",
      }).catch((err) => console.error("company.suspended notification:", err));
    }

    res.json({ success: true, data: toCompanyClient(company) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update company", error: error.message });
  }
};

/**
 * GET /api/admin/audit-logs
 */
exports.listAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(),
    ]);

    res.json({
      success: true,
      data: logs.map(toAuditClient),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list audit logs", error: error.message });
  }
};
