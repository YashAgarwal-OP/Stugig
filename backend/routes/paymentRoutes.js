const express = require('express');
const { checkout } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/checkout', protect, authorize('client'), checkout);

module.exports = router;
