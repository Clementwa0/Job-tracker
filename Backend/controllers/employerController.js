const Company = require("../models/Company");
const JobPosting = require("../models/JobPosting");
const { enqueueNotification } = require("../services/notificationService");
const {
  buildUniqueJobSlug,
  validateApplyMethod,
  validatePublishable,
  assertCanPublish,
  assertCanUnpublish,
  assertCanClose,
  assertCanUpdate,
  assertCanDelete,
} = require("../services/employerJobService");
const { slugify } = require("../utils/slugify");

const JOB_FIELDS = [
  "title", "description", "requirements", "location",
  "salaryMin", "salaryMax", "salaryCurrency",
  "jobType", "workMode", "tags", "applyMethod", "applicationDeadline",
];

function parseApplicationDeadline(value) {
  if (value === null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

function pickJobFields(body) {
  const out = {};
  for (const key of JOB_FIELDS) {
    if (key === "applicationDeadline") continue;
    if (body[key] !== undefined) out[key] = body[key];
  }
  if (body.applicationDeadline !== undefined) {
    const parsed = parseApplicationDeadline(body.applicationDeadline);
    if (parsed !== undefined) out.applicationDeadline = parsed;
  }
  return out;
}

function handleServiceError(res, error, fallback) {
  const status = error.statusCode || 500;
  if (status >= 500) console.error(fallback + ":", error);
  return res.status(status).json({
    success: false,
    message: error.message || fallback,
    ...(error.errors ? { errors: error.errors } : {}),
  });
}

async function resolveEmployerCompany(userId, user) {
  if (user.employerCompanyId) {
    const company = await Company.findById(user.employerCompanyId);
    if (company) return company;
  }
  return Company.findOne({ createdBy: userId });
}

function toCompanyClient(company) {
  if (!company) return null;
  const obj = company.toObject ? company.toObject() : company;
  return {
    id: String(obj._id),
    name: obj.name,
    slug: obj.slug,
    description: obj.description,
    website: obj.website,
    location: obj.location,
    industry: obj.industry,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

function toPostingClient(doc, company = null) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(obj._id),
    title: obj.title,
    slug: obj.slug,
    companyId: String(obj.companyId),
    description: obj.description,
    requirements: obj.requirements,
    location: obj.location,
    salaryMin: obj.salaryMin,
    salaryMax: obj.salaryMax,
    salaryCurrency: obj.salaryCurrency,
    jobType: obj.jobType,
    workMode: obj.workMode,
    tags: obj.tags || [],
    applyMethod: obj.applyMethod,
    status: obj.status,
    publishedAt: obj.publishedAt,
    closedAt: obj.closedAt,
    applicationDeadline: obj.applicationDeadline,
    viewCount: obj.viewCount || 0,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    company: company ? { id: String(company._id), name: company.name, slug: company.slug } : undefined,
  };
}

async function assertPostingOwnership(postingId, userId, companyId) {
  const posting = await JobPosting.findOne({ _id: postingId, companyId, createdBy: userId });
  return posting;
}

/**
 * GET /api/employer/dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) {
      return res.json({
        success: true,
        data: {
          hasCompany: false,
          stats: { totalJobs: 0, published: 0, drafts: 0, pendingReview: 0, closed: 0, totalViews: 0 },
          recentPostings: [],
        },
      });
    }

    const [statsAgg, recent] = await Promise.all([
      JobPosting.aggregate([
        { $match: { companyId: company._id, createdBy: req.userId } },
        {
          $group: {
            _id: null,
            totalJobs: { $sum: 1 },
            published: { $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] } },
            drafts: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
            pendingReview: { $sum: { $cond: [{ $eq: ["$status", "pending_review"] }, 1, 0] } },
            closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
            totalViews: { $sum: "$viewCount" },
          },
        },
      ]),
      JobPosting.find({ companyId: company._id, createdBy: req.userId })
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

    const stats = statsAgg[0] || {
      totalJobs: 0, published: 0, drafts: 0, pendingReview: 0, closed: 0, totalViews: 0,
    };

    res.json({
      success: true,
      data: {
        hasCompany: true,
        company: toCompanyClient(company),
        stats: {
          totalJobs: stats.totalJobs,
          published: stats.published,
          drafts: stats.drafts,
          pendingReview: stats.pendingReview,
          closed: stats.closed,
          totalViews: stats.totalViews,
        },
        recentPostings: recent.map((p) => toPostingClient(p, company)),
      },
    });
  } catch (error) {
    console.error("getDashboard:", error);
    res.status(500).json({ success: false, message: "Failed to load dashboard", error: error.message });
  }
};

/**
 * GET /api/employer/company
 */
exports.getCompany = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.json({ success: true, data: toCompanyClient(company) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch company", error: error.message });
  }
};

/**
 * POST /api/employer/company
 */
exports.createCompany = async (req, res) => {
  try {
    const existing = await resolveEmployerCompany(req.userId, req.user);
    if (existing) {
      return res.status(409).json({ success: false, message: "Company already exists" });
    }

    const { name, description, website, location, industry } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Company name is required" });
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let n = 0;
    while (await Company.findOne({ slug })) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const autoApprove = process.env.EMPLOYER_AUTO_APPROVE_COMPANY !== "false";
    const company = await Company.create({
      name: name.trim(),
      slug,
      description,
      website,
      location,
      industry,
      createdBy: req.userId,
      status: autoApprove ? "approved" : "pending",
    });

    const User = require("../models/User");
    await User.updateOne({ _id: req.userId }, { employerCompanyId: company._id, role: "employer" });
    req.user.employerCompanyId = company._id;

    res.status(201).json({ success: true, data: toCompanyClient(company) });
  } catch (error) {
    console.error("createCompany:", error);
    res.status(500).json({ success: false, message: "Failed to create company", error: error.message });
  }
};

/**
 * PUT /api/employer/company
 */
exports.updateCompany = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    const { name, description, website, location, industry } = req.body;
    if (name !== undefined) company.name = name.trim();
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (location !== undefined) company.location = location;
    if (industry !== undefined) company.industry = industry;
    await company.save();

    res.json({ success: true, data: toCompanyClient(company) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update company", error: error.message });
  }
};

/**
 * GET /api/employer/jobs
 */
exports.listJobs = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) {
      return res.status(400).json({ success: false, message: "Create a company profile first" });
    }

    const filter = { companyId: company._id, createdBy: req.userId };
    if (req.query.status) {
      filter.status = { $in: String(req.query.status).split(",") };
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      JobPosting.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      JobPosting.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: jobs.map((j) => toPostingClient(j, company)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list jobs", error: error.message });
  }
};

/**
 * POST /api/employer/jobs
 */
exports.createJob = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) {
      return res.status(400).json({ success: false, message: "Create a company profile first" });
    }

    const data = pickJobFields(req.body);
    if (!data.title?.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!data.description?.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }
    if (!data.jobType) data.jobType = "full-time";
    if (!data.workMode) data.workMode = "remote";
    if (!data.applyMethod) {
      data.applyMethod = { type: "external_link", value: company.website || "https://example.com/apply" };
    }

    const applyErr = validateApplyMethod(data.applyMethod);
    if (applyErr) return res.status(400).json({ success: false, message: applyErr });

    const baseSlug = await buildUniqueJobSlug(
      data.title,
      company.name,
      data.location || company.location || "",
    );

    const posting = await JobPosting.create({
      ...data,
      slug: baseSlug,
      companyId: company._id,
      status: "draft",
      createdBy: req.userId,
    });

    res.status(201).json({ success: true, data: toPostingClient(posting, company) });
  } catch (error) {
    console.error("createJob:", error);
    res.status(500).json({ success: false, message: "Failed to create job posting", error: error.message });
  }
};

/**
 * GET /api/employer/jobs/:id
 */
exports.getJob = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const posting = await assertPostingOwnership(req.params.id, req.userId, company._id);
    if (!posting) return res.status(404).json({ success: false, message: "Job posting not found" });

    res.json({ success: true, data: toPostingClient(posting, company) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch job posting", error: error.message });
  }
};

/**
 * PUT /api/employer/jobs/:id
 */
exports.updateJob = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const posting = await assertPostingOwnership(req.params.id, req.userId, company._id);
    if (!posting) return res.status(404).json({ success: false, message: "Job posting not found" });

    try {
      assertCanUpdate(posting);
    } catch (err) {
      return handleServiceError(res, err, "Failed to update job posting");
    }

    const data = pickJobFields(req.body);
    if (data.applyMethod) {
      const applyErr = validateApplyMethod(data.applyMethod);
      if (applyErr) return res.status(400).json({ success: false, message: applyErr });
    }

    Object.assign(posting, data);

    if (data.title || data.location) {
      posting.slug = await buildUniqueJobSlug(
        posting.title,
        company.name,
        posting.location || company.location || "",
        posting._id,
      );
    }

    await posting.save();
    res.json({ success: true, data: toPostingClient(posting, company) });
  } catch (error) {
    console.error("updateJob:", error);
    res.status(500).json({ success: false, message: "Failed to update job posting", error: error.message });
  }
};

/**
 * PATCH /api/employer/jobs/:id/publish
 */
exports.publishJob = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    if (company.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Company must be approved before publishing jobs",
      });
    }

    const posting = await assertPostingOwnership(req.params.id, req.userId, company._id);
    if (!posting) return res.status(404).json({ success: false, message: "Job posting not found" });

    try {
      assertCanPublish(posting);
    } catch (err) {
      return handleServiceError(res, err, "Failed to publish job");
    }

    const errors = validatePublishable(posting);
    if (errors.length) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    const requiresReview = process.env.JOB_POSTING_REQUIRES_APPROVAL === "true";
    posting.status = requiresReview ? "pending_review" : "published";
    posting.closedAt = undefined;
    if (!requiresReview) {
      posting.publishedAt = new Date();
    }
    await posting.save();

    const notifyType = requiresReview ? "job.pending_review" : "job.published";
    const notifyTitle = requiresReview
      ? "Job submitted for review"
      : "Job published";
    const notifyBody = requiresReview
      ? `"${posting.title}" is awaiting platform approval.`
      : `"${posting.title}" is now live on the job board.`;

    enqueueNotification({
      userId: posting.createdBy,
      type: notifyType,
      title: notifyTitle,
      body: notifyBody,
      payload: { jobPostingId: String(posting._id), slug: posting.slug },
      channel: requiresReview ? "in_app" : "email",
    }).catch((err) => console.error("publishJob notification:", err));

    res.json({
      success: true,
      message: requiresReview ? "Job submitted for review" : "Job published",
      data: toPostingClient(posting, company),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to publish job", error: error.message });
  }
};

/**
 * PATCH /api/employer/jobs/:id/unpublish
 */
exports.unpublishJob = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const posting = await assertPostingOwnership(req.params.id, req.userId, company._id);
    if (!posting) return res.status(404).json({ success: false, message: "Job posting not found" });

    try {
      assertCanUnpublish(posting);
    } catch (err) {
      return handleServiceError(res, err, "Failed to unpublish job");
    }

    posting.status = "draft";
    posting.publishedAt = undefined;
    await posting.save();

    res.json({ success: true, message: "Job unpublished", data: toPostingClient(posting, company) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to unpublish job", error: error.message });
  }
};

/**
 * PATCH /api/employer/jobs/:id/close
 */
exports.closeJob = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const posting = await assertPostingOwnership(req.params.id, req.userId, company._id);
    if (!posting) return res.status(404).json({ success: false, message: "Job posting not found" });

    try {
      assertCanClose(posting);
    } catch (err) {
      return handleServiceError(res, err, "Failed to close job");
    }

    posting.status = "closed";
    posting.closedAt = new Date();
    await posting.save();

    res.json({ success: true, message: "Job closed", data: toPostingClient(posting, company) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to close job", error: error.message });
  }
};

/**
 * DELETE /api/employer/jobs/:id
 */
exports.deleteJob = async (req, res) => {
  try {
    const company = await resolveEmployerCompany(req.userId, req.user);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const posting = await assertPostingOwnership(req.params.id, req.userId, company._id);
    if (!posting) return res.status(404).json({ success: false, message: "Job posting not found" });

    try {
      assertCanDelete(posting);
    } catch (err) {
      return handleServiceError(res, err, "Failed to delete job");
    }

    await posting.deleteOne();
    res.json({ success: true, message: "Job posting deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete job", error: error.message });
  }
};

module.exports.resolveEmployerCompany = resolveEmployerCompany;
