const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  client: {
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
  budget: {
    type: Number,
    required: [true, 'Please add a budget']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'negotiating', 'hired', 'submitted', 'completed', 'closed', 'disputed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);
