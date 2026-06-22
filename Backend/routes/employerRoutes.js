const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const { authLimiter, passwordResetLimiter } = require("../middleware/rateLimit");
const { loginValidation, employerRegisterValidation, forgotPasswordValidation } = require("../middleware/validation");
const roleAuth = require("../controllers/roleAuthController");
const {
  getDashboard,
  getCompany,
  createCompany,
  updateCompany,
  listJobs,
  createJob,
  getJob,
  updateJob,
  publishJob,
  unpublishJob,
  closeJob,
  deleteJob,
} = require("../controllers/employerController");
const { generateJobPosting } = require("../controllers/jobPostingAiController");
const { aiUserLimiter } = require("../middleware/aiRateLimit");

router.post("/register", authLimiter, employerRegisterValidation, roleAuth.employerRegister);
router.post("/login", authLimiter, loginValidation, roleAuth.employerLogin);
router.post("/forgot-password", passwordResetLimiter, forgotPasswordValidation, roleAuth.employerForgotPassword);

const guard = [auth, requireRole("employer")];

router.get("/dashboard", guard, getDashboard);
router.get("/company", guard, getCompany);
router.post("/company", guard, createCompany);
router.put("/company", guard, updateCompany);

router.get("/jobs", guard, listJobs);
router.post("/jobs/ai-generate", guard, aiUserLimiter, generateJobPosting);
router.post("/jobs", guard, createJob);
router.get("/jobs/:id", guard, getJob);
router.put("/jobs/:id", guard, updateJob);
router.patch("/jobs/:id/publish", guard, publishJob);
router.patch("/jobs/:id/unpublish", guard, unpublishJob);
router.patch("/jobs/:id/close", guard, closeJob);
router.delete("/jobs/:id", guard, deleteJob);

module.exports = router;
