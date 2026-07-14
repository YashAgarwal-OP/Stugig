const express = require('express');
const { updateBid, getMyBids } = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// my-bids must be before /:id to avoid param collision
router.get('/my-bids', protect, authorize('freelancer'), getMyBids);
router.put('/:id', protect, authorize('client'), updateBid);

module.exports = router;
