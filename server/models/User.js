const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['freelancer', 'client', 'admin'], required: true },
  skills: [{ type: String }],
  bio: { type: String },
  avatarUrl: { type: String },
  rating: { type: Number, default: 0 },
  university: { type: String },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
}, { timestamps: true }); // createdAt and updatedAt

module.exports = mongoose.model('User', userSchema);
