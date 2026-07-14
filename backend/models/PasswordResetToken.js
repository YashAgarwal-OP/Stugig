const mongoose = require('mongoose');

const PasswordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    // Auto-delete expired documents (MongoDB TTL index)
    index: { expireAfterSeconds: 0 }
  }
});

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
