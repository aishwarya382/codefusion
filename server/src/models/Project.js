const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: { type: String, maxlength: 1000, default: '' },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
    joinedAt: { type: Date, default: Date.now },
  }],
  language: { type: String, default: 'javascript' },
  tags: [{ type: String, trim: true }],
  isPublic: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  thumbnail: { type: String, default: '' },
  currentCode: { type: String, default: '// Welcome to CodeFusion!\n// Start coding here...\n' },
  settings: {
    theme: { type: String, default: 'vs-dark' },
    fontSize: { type: Number, default: 14 },
    tabSize: { type: Number, default: 2 },
    wordWrap: { type: Boolean, default: true },
    autoSave: { type: Boolean, default: true },
    minimap: { type: Boolean, default: true },
  },
  stats: {
    totalVersions: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    linesOfCode: { type: Number, default: 0 },
  },
  pinnedMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastActivity: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ title: 'text', description: 'text', tags: 'text' }, { language_override: 'dummy' });

module.exports = mongoose.model('Project', projectSchema);
