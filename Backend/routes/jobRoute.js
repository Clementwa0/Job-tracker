const express = require('express'); // Import express
const { addJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobControllers'); // Import job controllers
const router = express.Router(); // Initialize router
const auth = require('../middleware/auth'); // Import auth middleware

router.post("/", auth, addJob); // Create job
router.get('/', auth, getJobs); // Get all jobs
router.get('/:id', auth, getJobById); // Get job by ID
router.put('/:id', auth, updateJob); // Update job by ID
router.delete('/:id', auth, deleteJob); // Delete job by ID

module.exports = router; // Export router
