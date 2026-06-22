const mongoose = require("mongoose");

const applyMethodSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["external_link", "email", "whatsapp"],
      required: true,
      default: "external_link",
    },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const jobPostingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    description: { type: String, required: true },
    requirements: String,
    location: String,
    salaryMin: Number,
    salaryMax: Number,
    salaryCurrency: { type: String, default: "USD" },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      required: true,
    },
    workMode: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      required: true,
    },
    tags: { type: [String], default: [] },
    applyMethod: { type: applyMethodSchema, required: true },
    status: {
      type: String,
      enum: ["draft", "pending_review", "published", "closed"],
      default: "draft",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: Date,
    closedAt: Date,
    applicationDeadline: Date,
    viewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

jobPostingSchema.index({ createdAt: -1 });
jobPostingSchema.index({ createdBy: 1, status: 1 });
jobPostingSchema.index({ status: 1, publishedAt: -1 });
jobPostingSchema.index({ companyId: 1, status: 1 });
jobPostingSchema.index({ location: 1 });
jobPostingSchema.index({ jobType: 1, workMode: 1 });
jobPostingSchema.index({ salaryMin: 1, salaryMax: 1 });
jobPostingSchema.index({ applicationDeadline: 1 });

module.exports = mongoose.model("JobPosting", jobPostingSchema);
