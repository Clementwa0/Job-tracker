const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "job.published",
        "job.pending_review",
        "job.approved",
        "job.rejected",
        "company.approved",
        "company.suspended",
        "interview.reminder",
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ["in_app", "email"],
      default: "in_app",
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, trim: true, maxlength: 2000 },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "sent", "read", "failed"],
      default: "pending",
    },
    scheduledAt: { type: Date, default: Date.now },
    sentAt: Date,
    readAt: Date,
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
