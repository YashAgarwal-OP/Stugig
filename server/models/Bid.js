const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quoteAmount: { type: Number, required: true },
  deliveryTime: { type: String, required: true }, // e.g., '3 days'
  coverMessage: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', index: true },
}, { timestamps: true });

module.exports = mongoose.model('Bid', bidSchema);
