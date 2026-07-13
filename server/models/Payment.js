const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // Net amount to freelancer
  commissionAmount: { type: Number, required: true }, // 15% platform fee
  totalCharged: { type: Number, required: true }, // amount + commissionAmount
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending', index: true },
  stripePaymentIntentId: { type: String, required: true, unique: true },
}, { timestamps: true }); // includes createdAt

module.exports = mongoose.model('Payment', paymentSchema);
