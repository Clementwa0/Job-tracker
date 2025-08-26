const express = require('express');
const upload = require("../config/multer");
const { addJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobControllers');
const router = express.Router();
const auth = require('../middleware/auth');


router.post(
  "/",
  upload.fields([
    { name: "resumeFile", maxCount: 1 },
    { name: "coverLetterFile", maxCount: 1 },
  ]),
  addJob
);
router.get('/', auth, getJobs);
router.get('/:id', auth, getJobById);
router.put('/:id', auth, updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;