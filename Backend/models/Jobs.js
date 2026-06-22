const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, default: "note" }, // note | status | reminder | system
    message: String,
    meta: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const reminderSchema = new mongoose.Schema(
  {
    title: String,
    dueAt: Date,
    done: { type: Boolean, default: false },
  },
  { _id: true }
);

const jobSchema = new mongoose.Schema(
  {
    jobTitle: String,
    companyName: String,
    companyLogo: String,
    location: String,
    jobType: String, // Full-time | Part-time | Contract | Internship
    workMode: { type: String, enum: ["remote", "onsite", "hybrid", ""], default: "" },
    applicationDate: Date,
    applicationDeadline: Date,
    source: String,
    applicationStatus: { type: String, default: "applied" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    tags: { type: [String], default: [] },

    salaryMin: Number,
    salaryMax: Number,
    salaryCurrency: { type: String, default: "USD" },
    salaryRange: String, // legacy display string (kept for backward compat)

    contactPerson: String,
    contactEmail: String,
    contactPhone: String,
    recruiterLinkedIn: String,

    resumeFile: String,
    coverLetterFile: String,
    attachments: { type: [attachmentSchema], default: [] },

    jobPostingUrl: String,
    jobDescription: String,
    matchScore: { type: Number, min: 0, max: 100, default: null },
    matchAnalysis: mongoose.Schema.Types.Mixed, // { strengths, gaps, keywords, suggestions }

    notes: String,
    activity: { type: [activitySchema], default: [] },
    reminders: { type: [reminderSchema], default: [] },

    isArchived: { type: Boolean, default: false },
    archivedAt: Date,

    interviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interview" }],

    // Optional link to public job board listing (Phase 2)
    jobPostingId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPosting" },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

jobSchema.index({ userId: 1 });
jobSchema.index({ userId: 1, applicationStatus: 1 });
jobSchema.index({ userId: 1, isArchived: 1 });
jobSchema.index({ userId: 1, companyName: 1 });
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ userId: 1, priority: 1 });
jobSchema.index({ userId: 1, applicationDate: -1 });
jobSchema.index({ jobTitle: "text", companyName: "text", notes: "text", tags: "text" });
jobSchema.index({ userId: 1, jobPostingId: 1 });

module.exports = mongoose.model("Job", jobSchema);
