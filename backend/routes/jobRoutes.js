const express = require('express');
const { createJob, getJobs } = require('../controllers/jobController');
const { createBid } = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Job routes
router.post('/new', protect, authorize('client'), createJob);
router.get('/', protect, getJobs);

// Bidding route (nested under jobs)
router.post('/:id/bid', protect, authorize('freelancer'), createBid);

module.exports = router;
