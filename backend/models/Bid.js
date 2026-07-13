const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quote: {
    type: Number,
    required: [true, 'Please add a quote amount']
  },
  eta: {
    type: String,
    required: [true, 'Please specify delivery timeline (ETA)']
  },
  message: {
    type: String,
    required: [true, 'Please add a cover letter / proposal message']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bid', BidSchema);
