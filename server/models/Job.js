const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  budgetMin: { type: Number, required: true },
  budgetMax: { type: Number, required: true },
  deadline: { type: Date, required: true },
  attachments: [{ type: String }],
  status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open', index: true },
  skillsRequired: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
