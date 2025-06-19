const express = require('express');
const { addJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobControllers');
const router = express.Router();

router.post('/jobs', addJob);
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobById);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

module.exports = router;