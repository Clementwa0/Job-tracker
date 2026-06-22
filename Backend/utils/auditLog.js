const AuditLog = require("../models/AuditLog");

async function logAudit({ actorId, action, targetType, targetId, meta }) {
  try {
    await AuditLog.create({ actorId, action, targetType, targetId, meta });
  } catch (err) {
    console.error("logAudit:", err);
  }
}

module.exports = { logAudit };
