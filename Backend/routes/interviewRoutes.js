const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createInterview,
  getInterviews,
  getJobInterviews,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");

router.post("/", auth, createInterview);
router.get("/job/:jobId", auth, getJobInterviews);
router.get("/", auth, getInterviews);
router.put("/:id", auth, updateInterview);
router.delete("/:id", auth, deleteInterview);

module.exports = router;