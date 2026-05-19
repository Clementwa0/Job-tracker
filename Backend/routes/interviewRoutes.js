const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createInterview,
  getInterviews,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");

router.post("/", auth, createInterview);
router.get("/", auth, getInterviews);
router.put("/:id", auth, updateInterview);
router.delete("/:id", auth, deleteInterview);

module.exports = router;