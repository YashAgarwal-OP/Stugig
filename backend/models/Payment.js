const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The accepted bid amount (what the freelancer receives minus commission)
  amount: {
    type: Number,
    required: true
  },
  // 15% platform commission
  commissionAmount: {
    type: Number,
    required: true
  },
  // amount + commissionAmount — what the client is actually charged
  totalCharged: {
    type: Number,
    required: true
  },
  stripePaymentIntentId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);
