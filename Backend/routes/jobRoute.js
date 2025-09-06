const express = require('express');
const { addJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobControllers');
const router = express.Router();
const auth = require('../middleware/auth');



router.get('/', auth, getJobs);
router.get('/:id', auth, getJobById);
router.put('/:id', auth, updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;
