const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, requireRole } = require('../middleware/auth');

// Matchmaker route (freelancer only)
router.get('/matchmaker/jobs', protect, requireRole('freelancer'), aiController.getJobMatches);

// Bidding Assistant route (freelancer only)
router.get('/bidding-assistant/:jobId', protect, requireRole('freelancer'), aiController.getBiddingSuggestions);

module.exports = router;
