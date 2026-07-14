const express = require('express');
const { getMatchedJobs } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/matchmaker/jobs — smart job matches for the logged-in freelancer
router.get('/jobs', protect, authorize('freelancer'), getMatchedJobs);

module.exports = router;
