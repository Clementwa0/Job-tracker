const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, default: "Untitled resume", trim: true, maxlength: 120 },
    template: { type: String, default: "modern" },
    accent: { type: String, default: "#2563eb" },
    contact: { type: mongoose.Schema.Types.Mixed, default: {} },
    summary: { type: String, default: "" },
    experience: { type: [mongoose.Schema.Types.Mixed], default: [] },
    education: { type: [mongoose.Schema.Types.Mixed], default: [] },
    projects: { type: [mongoose.Schema.Types.Mixed], default: [] },
    skills: { type: [mongoose.Schema.Types.Mixed], default: [] },
    certifications: { type: [mongoose.Schema.Types.Mixed], default: [] },
    languages: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("Resume", resumeSchema);
