const express = require('express');
const { matchmaker, getMatchedJobs, getBiddingAssistance } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Legacy matchmaker endpoint
router.post('/matchmaker', protect, matchmaker);

module.exports = router;
