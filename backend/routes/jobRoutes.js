const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJobStatus
} = require('../controllers/jobController');
const { createBid, getBidsForJob } = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// IMPORTANT: specific paths must come before /:id param routes
router.get('/client/my-jobs', protect, authorize('client'), getMyJobs);

router.route('/')
  .get(getJobs)
  .post(protect, authorize('client'), createJob);

router.get('/:id', getJobById);
router.put('/:id/status', protect, authorize('client', 'admin'), updateJobStatus);

// Bid sub-routes
router.post('/:id/bids', protect, authorize('freelancer'), createBid);
router.get('/:id/bids', protect, authorize('client'), getBidsForJob);

module.exports = router;
