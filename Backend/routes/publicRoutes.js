const express = require("express");
const router = express.Router();
const { listPublicJobs, getPublicJobBySlug } = require("../controllers/publicJobController");

// Public job board — no auth required
router.get("/jobs", listPublicJobs);
router.get("/jobs/:slug", getPublicJobBySlug);

module.exports = router;
