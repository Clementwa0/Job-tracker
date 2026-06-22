const Notification = require("../models/Notification");

/**
 * Queue a notification for delivery. Email channel is logged only until SMTP workers ship.
 */
async function enqueueNotification({
  userId,
  type,
  title,
  body = "",
  payload = {},
  channel = "in_app",
  scheduledAt,
}) {
  if (!userId) return null;

  const doc = await Notification.create({
    userId,
    type,
    channel,
    title,
    body,
    payload,
    scheduledAt: scheduledAt || new Date(),
    status: channel === "in_app" ? "sent" : "pending",
    sentAt: channel === "in_app" ? new Date() : undefined,
  });

  if (channel === "email") {
    console.log("[notification:email:queued]", {
      id: String(doc._id),
      userId: String(userId),
      type,
      title,
    });
  }

  return doc;
}

/**
 * Stub worker — processes pending email notifications (no-op send for now).
 */
async function processPendingEmailNotifications(limit = 20) {
  const pending = await Notification.find({
    channel: "email",
    status: "pending",
    scheduledAt: { $lte: new Date() },
  })
    .sort({ scheduledAt: 1 })
    .limit(limit);

  for (const note of pending) {
    console.log("[notification:email:dev]", {
      id: String(note._id),
      to: String(note.userId),
      type: note.type,
      title: note.title,
    });
    note.status = "sent";
    note.sentAt = new Date();
    await note.save();
  }

  return pending.length;
}

function toClient(doc) {
  return {
    id: String(doc._id),
    type: doc.type,
    channel: doc.channel,
    title: doc.title,
    body: doc.body || "",
    payload: doc.payload || {},
    status: doc.status,
    scheduledAt: doc.scheduledAt?.toISOString(),
    sentAt: doc.sentAt?.toISOString(),
    readAt: doc.readAt?.toISOString(),
    createdAt: doc.createdAt?.toISOString(),
  };
}

module.exports = {
  enqueueNotification,
  processPendingEmailNotifications,
  toClient,
};
