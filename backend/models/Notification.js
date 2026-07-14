const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'bid_received',      // client receives when a freelancer bids on their job
      'bid_accepted',      // freelancer receives when their bid is accepted
      'bid_rejected',      // freelancer receives when their bid is rejected
      'payment_received',  // freelancer receives when client pays
      'payment_confirmed', // client receives when payment is confirmed
      'job_completed',     // freelancer receives when client marks job complete
      'new_review'         // user receives when someone leaves them a review
    ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-delete notifications older than 60 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', NotificationSchema);
