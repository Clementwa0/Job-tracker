const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  listResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
} = require("../controllers/resumeController");

router.get("/", auth, listResumes);
router.post("/", auth, createResume);
router.get("/:id", auth, getResume);
router.put("/:id", auth, updateResume);
router.delete("/:id", auth, deleteResume);

module.exports = router;
