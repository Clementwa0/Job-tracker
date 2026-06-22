const Notification = require("../models/Notification");
const { toClient } = require("../services/notificationService");

/**
 * GET /api/notifications
 */
exports.listNotifications = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === "true";

    const filter = { userId: req.userId };
    if (unreadOnly) filter.status = { $ne: "read" };

    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.userId, status: { $ne: "read" } }),
    ]);

    res.json({
      success: true,
      data: items.map(toClient),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0, unreadCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to list notifications",
      error: error.message,
    });
  }
};

/**
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: req.userId,
      status: { $ne: "read" },
    });
    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
exports.markRead = async (req, res) => {
  try {
    const note = await Notification.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ success: false, message: "Notification not found" });

    note.status = "read";
    note.readAt = new Date();
    await note.save();

    res.json({ success: true, data: toClient(note) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notification read",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 */
exports.markAllRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.userId, status: { $ne: "read" } },
      { $set: { status: "read", readAt: new Date() } },
    );
    res.json({ success: true, data: { modified: result.modifiedCount } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark all read",
      error: error.message,
    });
  }
};
