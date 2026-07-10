const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: { type: String, default: 'javascript' },
  message: {
    type: String,
    default: 'Auto-saved snapshot',
    maxlength: 200,
  },
  versionNumber: { type: Number, required: true },
  diff: { type: String, default: '' },
  linesAdded: { type: Number, default: 0 },
  linesRemoved: { type: Number, default: 0 },
  isManual: { type: Boolean, default: false },
}, {
  timestamps: true,
});

versionSchema.index({ project: 1, versionNumber: -1 });

module.exports = mongoose.model('Version', versionSchema);
