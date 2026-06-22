const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  addJob, getJobs, getJobById, updateJob, deleteJob,
  duplicateJob, archiveJob, bulkUpdate, bulkDelete, addActivity, getStats,
  getAnalyticsSummary,
} = require("../controllers/jobControllers");

router.get("/stats", auth, getStats);
router.get("/analytics/summary", auth, getAnalyticsSummary);

router.post("/bulk/update", auth, bulkUpdate);
router.post("/bulk/delete", auth, bulkDelete);

router.post("/", auth, addJob);
router.get("/", auth, getJobs);
router.get("/:id", auth, getJobById);
router.put("/:id", auth, updateJob);
router.delete("/:id", auth, deleteJob);

router.post("/:id/duplicate", auth, duplicateJob);
router.post("/:id/archive", auth, archiveJob);
router.post("/:id/activity", auth, addActivity);

module.exports = router;
