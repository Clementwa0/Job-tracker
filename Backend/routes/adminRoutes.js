const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const { loginValidation } = require("../middleware/validation");
const roleAuth = require("../controllers/roleAuthController");
const {
  getAnalytics,
  listUsers,
  updateUserStatus,
  updateUserRole,
  listJobs,
  approveJob,
  rejectJob,
  closeJob,
  listCompanies,
  updateCompanyStatus,
  listAuditLogs,
} = require("../controllers/adminController");
const adminAnalytics = require("../controllers/adminAnalyticsController");

router.post("/login", authLimiter, loginValidation, roleAuth.adminLogin);

const guard = [auth, requireRole("admin")];

router.get("/analytics", guard, getAnalytics);
router.get("/analytics/overview", guard, adminAnalytics.getOverview);
router.get("/analytics/charts", guard, adminAnalytics.getCharts);
router.get("/users", guard, listUsers);
router.patch("/users/:id/status", guard, updateUserStatus);
router.patch("/users/:id/role", guard, updateUserRole);
router.get("/jobs", guard, listJobs);
router.patch("/jobs/:id/approve", guard, approveJob);
router.patch("/jobs/:id/reject", guard, rejectJob);
router.patch("/jobs/:id/close", guard, closeJob);
router.get("/companies", guard, listCompanies);
router.patch("/companies/:id/status", guard, updateCompanyStatus);
router.get("/audit-logs", guard, listAuditLogs);

module.exports = router;
