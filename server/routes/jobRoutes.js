const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJobStatus,
  getClientJobs,
} = require('../controllers/jobController');
const { protect, requireRole } = require('../middleware/auth');

router.route('/client/my-jobs')
  .get(protect, requireRole('client'), getClientJobs);

router.route('/')
  .get(getJobs)
  .post(protect, requireRole('client'), createJob);

router.route('/:id')
  .get(getJobById);

// Only clients (or admins checked inside controller) may manually update job status
router.route('/:id/status')
  .put(protect, requireRole('client'), updateJobStatus);

module.exports = router;
