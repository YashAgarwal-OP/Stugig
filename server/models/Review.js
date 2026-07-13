const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  communicationRating: { type: Number, min: 1, max: 5, required: true },
  qualityRating: { type: Number, min: 1, max: 5, required: true },
  timelinessRating: { type: Number, min: 1, max: 5, required: true },
  overallRating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
}, { timestamps: true }); // includes createdAt

module.exports = mongoose.model('Review', reviewSchema);
