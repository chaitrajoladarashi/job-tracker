const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  company: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: false,
  },
  dateApplied: {
    type: Date,
    required: true,
    default: Date.now
  },
  source: {
    type: String,
  },
  referralName: {
    type: String,
  },
  link: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Assessment', 'Selected', 'Rejected', 'Interview'],
    default: 'Pending',
  },
  notes: {
    type: String,
  },

  assessmentDate: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
