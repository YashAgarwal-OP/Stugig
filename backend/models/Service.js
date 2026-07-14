const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a service title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a service description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Design', 'Development', 'Backend', 'Marketing', 'Writing', 'Video', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  deliveryTime: {
    type: String,
    required: [true, 'Please specify delivery time'],
    default: '3 days'
  },
  tags: {
    type: [String],
    default: []
  },
  imageUrl: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'paused'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ServiceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Service', ServiceSchema);
