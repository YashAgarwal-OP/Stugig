const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quoteAmount: {
    type: Number,
    required: [true, 'Please add a quote amount']
  },
  deliveryTime: {
    type: String,
    required: [true, 'Please specify delivery timeline']
  },
  coverMessage: {
    type: String,
    required: [true, 'Please add a cover message']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// A freelancer can only submit one bid per job
BidSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

module.exports = mongoose.model('Bid', BidSchema);
