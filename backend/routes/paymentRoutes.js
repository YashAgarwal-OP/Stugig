const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
  getPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Webhook must use raw body — registered in app.js before express.json()
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.post('/create-intent', protect, createPaymentIntent);
router.post('/:id/confirm', protect, confirmPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
