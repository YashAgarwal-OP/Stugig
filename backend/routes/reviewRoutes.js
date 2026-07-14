const express = require('express');
const { getReviewsByUser, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/user/:userId', getReviewsByUser);
router.post('/', protect, createReview);

module.exports = router;
