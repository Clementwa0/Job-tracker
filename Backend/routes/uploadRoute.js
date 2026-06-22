const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { uploadFile } = require("../controllers/uploadController");

router.post("/", auth, upload.single("file"), (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ success: false, message: err.message || "Upload failed" });
  }
  next();
}, uploadFile);

module.exports = router;
