const JobPosting = require("../models/JobPosting");

const SORT_OPTIONS = {
  newest: { publishedAt: -1, createdAt: -1 },
  salary: { salaryMax: -1, salaryMin: -1, publishedAt: -1 },
  relevance: null,
};

function parseListQuery(query) {
  const {
    q,
    location,
    jobType,
    workMode,
    salaryMin,
    salaryMax,
    companyId,
    tags,
    sort = "newest",
    page = 1,
    limit = 20,
  } = query;

  const pageNum = Math.max(1, Number(page) || 1);
  const lim = Math.min(50, Math.max(1, Number(limit) || 20));
  const tagList = tags ? String(tags).split(",").map((t) => t.trim()).filter(Boolean) : [];

  return {
    q: q ? String(q).trim() : "",
    location: location ? String(location).trim() : "",
    jobType: jobType ? String(jobType).split(",") : [],
    workMode: workMode ? String(workMode).split(",") : [],
    salaryMin: salaryMin != null && salaryMin !== "" ? Number(salaryMin) : null,
    salaryMax: salaryMax != null && salaryMax !== "" ? Number(salaryMax) : null,
    companyId: companyId || null,
    tagList,
    sort: Object.prototype.hasOwnProperty.call(SORT_OPTIONS, sort) ? sort : "newest",
    pageNum,
    lim,
  };
}

function buildMatchStage(params) {
  const match = { status: "published" };

  if (params.companyId) {
    match.companyId = params.companyId;
  }
  if (params.jobType.length) {
    match.jobType = { $in: params.jobType };
  }
  if (params.workMode.length) {
    match.workMode = { $in: params.workMode };
  }
  if (params.location) {
    match.location = new RegExp(params.location, "i");
  }
  if (params.tagList.length) {
    match.tags = { $in: params.tagList };
  }
  if (params.salaryMin != null && !Number.isNaN(params.salaryMin)) {
    match.salaryMax = { ...(match.salaryMax || {}), $gte: params.salaryMin };
  }
  if (params.salaryMax != null && !Number.isNaN(params.salaryMax)) {
    match.salaryMin = { ...(match.salaryMin || {}), $lte: params.salaryMax };
  }

  return match;
}

function isDeadlineOpen(deadline) {
  if (!deadline) return true;
  return new Date(deadline).getTime() >= Date.now();
}

function isPostingActive(doc) {
  return doc.status === "published" && isDeadlineOpen(doc.applicationDeadline);
}

function toPublicCompany(company) {
  if (!company) return undefined;
  return {
    id: company._id,
    name: company.name,
    slug: company.slug,
    logo: company.logo,
    location: company.location,
    industry: company.industry,
    website: company.website,
    description: company.description,
  };
}

function toPublicJobListItem(doc) {
  return {
    id: doc._id,
    slug: doc.slug,
    title: doc.title,
    location: doc.location,
    salaryMin: doc.salaryMin,
    salaryMax: doc.salaryMax,
    salaryCurrency: doc.salaryCurrency,
    jobType: doc.jobType,
    workMode: doc.workMode,
    tags: doc.tags,
    publishedAt: doc.publishedAt,
    applicationDeadline: doc.applicationDeadline,
    status: doc.status,
    isActive: isPostingActive(doc),
    company: toPublicCompany(doc.company),
  };
}

function toPublicJobDetail(doc) {
  return {
    id: doc._id,
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    requirements: doc.requirements,
    location: doc.location,
    salaryMin: doc.salaryMin,
    salaryMax: doc.salaryMax,
    salaryCurrency: doc.salaryCurrency,
    jobType: doc.jobType,
    workMode: doc.workMode,
    tags: doc.tags,
    publishedAt: doc.publishedAt,
    closedAt: doc.closedAt,
    applicationDeadline: doc.applicationDeadline,
    status: doc.status,
    isActive: isPostingActive(doc),
    viewCount: doc.viewCount,
    applyMethod: doc.applyMethod,
    company: toPublicCompany(doc.company),
  };
}

/**
 * GET /api/public/jobs
 */
const listPublicJobs = async (req, res) => {
  try {
    const params = parseListQuery(req.query);
    const skip = (params.pageNum - 1) * params.lim;

    const pipeline = [
      { $match: buildMatchStage(params) },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: "$company" },
      { $match: { "company.status": "approved" } },
    ];

    if (params.q) {
      const rx = new RegExp(params.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      pipeline.push({
        $match: {
          $or: [
            { title: rx },
            { description: rx },
            { tags: rx },
            { "company.name": rx },
          ],
        },
      });
    }

    const sortStage =
      params.sort === "relevance" && params.q
        ? { score: -1, publishedAt: -1 }
        : SORT_OPTIONS[params.sort] || SORT_OPTIONS.newest;

    if (params.sort === "relevance" && params.q) {
      pipeline.push({
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $regexMatch: { input: "$title", regex: params.q, options: "i" } }, 10, 0] },
              { $cond: [{ $regexMatch: { input: "$company.name", regex: params.q, options: "i" } }, 5, 0] },
              { $size: { $filter: { input: "$tags", as: "t", cond: { $regexMatch: { input: "$$t", regex: params.q, options: "i" } } } } },
            ],
          },
        },
      });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const dataPipeline = [
      ...pipeline,
      { $sort: sortStage },
      { $skip: skip },
      { $limit: params.lim },
      {
        $project: {
          slug: 1,
          title: 1,
          location: 1,
          salaryMin: 1,
          salaryMax: 1,
          salaryCurrency: 1,
          jobType: 1,
          workMode: 1,
          tags: 1,
          publishedAt: 1,
          applicationDeadline: 1,
          applyMethod: 1,
          company: {
            _id: 1,
            name: 1,
            slug: 1,
            logo: 1,
            location: 1,
            industry: 1,
          },
        },
      },
    ];

    const [countResult, jobs] = await Promise.all([
      JobPosting.aggregate(countPipeline),
      JobPosting.aggregate(dataPipeline),
    ]);

    const total = countResult[0]?.total ?? 0;

    res.status(200).json({
      success: true,
      data: jobs.map(toPublicJobListItem),
      meta: {
        page: params.pageNum,
        limit: params.lim,
        total,
        totalPages: Math.ceil(total / params.lim) || 0,
      },
    });
  } catch (error) {
    console.error("listPublicJobs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch jobs", error: error.message });
  }
};

/**
 * GET /api/public/jobs/:slug
 */
const getPublicJobBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const results = await JobPosting.aggregate([
      { $match: { slug: slug.toLowerCase(), status: { $in: ["published", "closed"] } } },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: "$company" },
      { $match: { "company.status": { $in: ["approved", "pending"] } } },
      { $limit: 1 },
    ]);

    const job = results[0];
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status === "published") {
      await JobPosting.updateOne({ _id: job._id }, { $inc: { viewCount: 1 } });
    }

    res.status(200).json({
      success: true,
      data: toPublicJobDetail({
        ...job,
        viewCount: job.status === "published" ? (job.viewCount || 0) + 1 : job.viewCount,
      }),
    });
  } catch (error) {
    console.error("getPublicJobBySlug:", error);
    res.status(500).json({ success: false, message: "Failed to fetch job", error: error.message });
  }
};

module.exports = { listPublicJobs, getPublicJobBySlug };
