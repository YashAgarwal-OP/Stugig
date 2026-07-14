const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['freelancer', 'client', 'admin'],
    required: [true, 'Please select a role']
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  // Profile fields
  tagline: { type: String, default: '' },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  profilePhotoUrl: { type: String, default: '' },
  // Freelancer-specific
  skills: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  yearsOfExperience: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
