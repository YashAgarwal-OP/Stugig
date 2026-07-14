const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Design', 'Development', 'Backend', 'Marketing', 'Writing', 'Video', 'Other']
  },
  budgetMin: {
    type: Number,
    required: [true, 'Please add a minimum budget']
  },
  budgetMax: {
    type: Number,
    required: [true, 'Please add a maximum budget']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline']
  },
  skillsRequired: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'in-progress', 'completed', 'closed', 'disputed'],
    default: 'open'
  },
  // Reference to the accepted bid
  acceptedBidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Text index for full-text search
JobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', JobSchema);
