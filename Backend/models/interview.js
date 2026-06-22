const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    stage: {
      type: String,
      // Expanded to include phone, behavioral, and onsite interview paths
      enum: ["phone", "hr", "technical", "behavioral", "onsite", "final"],
      default: "hr",
    },

    status: {
      type: String,
      // Expanded to sync perfectly with frontend track parameters
      enum: ["scheduled", "completed", "canceled", "passed", "failed", "rescheduled"],
      default: "scheduled",
    },

    interviewDate: Date,

    location: {
      type: String,
      default: "online",
    },

    notes: String,
  },
  { timestamps: true },
);

interviewSchema.index({ userId: 1, interviewDate: 1 });
interviewSchema.index({ jobId: 1 });
interviewSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Interview", interviewSchema);