const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, index: true }, // Could refer to a Conversation model if extracted
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', index: true },
  content: { type: String, required: true },
  attachmentUrl: { type: String },
  readAt: { type: Date },
}, { timestamps: true }); // includes createdAt

module.exports = mongoose.model('Message', messageSchema);
