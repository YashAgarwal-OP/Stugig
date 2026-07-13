const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  getPaymentHistory,
  stripeWebhook
} = require('../controllers/paymentController');
const { protect, requireRole } = require('../middleware/auth');

// Note: webhook uses raw body, so we will mount it directly on the main app with express.raw() in server.js
// But we can define the route here if we handle the body parsing carefully.
// A common approach is to mount the webhook separately in server.js before express.json() is applied globally.
// However, if we mount it here, we must ensure express.json() isn't run before it.
// To do that, we will remove this route from here and place it directly in server.js

router.route('/create-intent')
  .post(protect, requireRole('client'), createPaymentIntent);

router.route('/history')
  .get(protect, getPaymentHistory);

module.exports = router;
