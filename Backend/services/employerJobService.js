const JobPosting = require("../models/JobPosting");
const { buildJobSlug } = require("../utils/slugify");

const APPLY_TYPES = ["external_link", "email", "whatsapp"];

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug;
  let attempt = 0;
  while (attempt < 20) {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await JobPosting.findOne(filter).select("_id");
    if (!exists) return slug;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
  return `${baseSlug}-${Date.now().toString(36)}`;
}

async function buildUniqueJobSlug(title, companyName, location, excludeId = null) {
  const baseSlug = buildJobSlug(title, companyName, location || "");
  return ensureUniqueSlug(baseSlug, excludeId);
}

function validateApplyMethod(applyMethod) {
  if (!applyMethod?.type || !applyMethod?.value?.trim()) {
    return "Apply method type and value are required";
  }
  if (!APPLY_TYPES.includes(applyMethod.type)) return "Invalid apply method type";
  if (applyMethod.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applyMethod.value)) {
    return "Invalid email for apply method";
  }
  if (applyMethod.type === "external_link" && !/^https?:\/\/.+/i.test(applyMethod.value)) {
    return "Application URL must start with http:// or https://";
  }
  return null;
}

function validatePublishable(posting) {
  const errors = [];
  if (!posting.title?.trim()) errors.push("Title is required");
  if (!posting.description?.trim()) errors.push("Description is required");
  if (!posting.location?.trim()) errors.push("Location is required");
  if (!posting.jobType) errors.push("Job type is required");
  if (!posting.workMode) errors.push("Work mode is required");
  const applyErr = validateApplyMethod(posting.applyMethod);
  if (applyErr) errors.push(applyErr);
  if (
    posting.salaryMin != null &&
    posting.salaryMax != null &&
    posting.salaryMin > posting.salaryMax
  ) {
    errors.push("Minimum salary cannot exceed maximum salary");
  }
  if (posting.applicationDeadline) {
    const deadline = new Date(posting.applicationDeadline);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    deadline.setUTCHours(0, 0, 0, 0);
    if (deadline < today) {
      errors.push("Application deadline must be today or in the future");
    }
  }
  return errors;
}

function assertCanPublish(posting) {
  if (!["draft", "closed"].includes(posting.status)) {
    const err = new Error("Only draft or closed jobs can be published");
    err.statusCode = 400;
    throw err;
  }
}

function assertCanUnpublish(posting) {
  if (!["published", "pending_review"].includes(posting.status)) {
    const err = new Error("Only published or pending jobs can be unpublished");
    err.statusCode = 400;
    throw err;
  }
}

function assertCanClose(posting) {
  if (posting.status !== "published") {
    const err = new Error("Only published jobs can be closed");
    err.statusCode = 400;
    throw err;
  }
}

function assertCanUpdate(posting) {
  if (posting.status === "closed") {
    const err = new Error("Closed postings cannot be edited");
    err.statusCode = 400;
    throw err;
  }
}

function assertCanDelete(posting) {
  if (posting.status !== "draft") {
    const err = new Error("Only draft postings can be deleted");
    err.statusCode = 400;
    throw err;
  }
}

module.exports = {
  ensureUniqueSlug,
  buildUniqueJobSlug,
  validateApplyMethod,
  validatePublishable,
  assertCanPublish,
  assertCanUnpublish,
  assertCanClose,
  assertCanUpdate,
  assertCanDelete,
};
