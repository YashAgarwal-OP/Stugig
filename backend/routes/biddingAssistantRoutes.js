const express = require('express');
const { getBiddingAssistance } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/bidding-assistant/:jobId
router.get('/:jobId', protect, authorize('freelancer'), getBiddingAssistance);

module.exports = router;
