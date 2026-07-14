const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  // Messages are scoped to a job thread (job acts as the conversation room)
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content cannot be empty'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

MessageSchema.index({ jobId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
