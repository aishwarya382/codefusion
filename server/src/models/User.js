const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'mentor', 'developer', 'student'],
    default: 'developer',
  },
  avatar: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  bio: { type: String, maxlength: 500, default: '' },
  skills: [{ type: String, trim: true }],
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  githubUsername: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  badges: [{
    name: String,
    icon: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
  }],
  stats: {
    projectsCreated: { type: Number, default: 0 },
    linesOfCode: { type: Number, default: 0 },
    collaborations: { type: Number, default: 0 },
    hoursCoded: { type: Number, default: 0 },
    aiUsage: { type: Number, default: 0 },
    codingStreak: { type: Number, default: 0 },
  },
  subscription: {
    plan: { type: String, enum: ['hobby', 'pro', 'team'], default: 'hobby' },
    stripeCustomerId: { type: String, default: '' },
    stripeSubscriptionId: { type: String, default: '' },
  },
  preferences: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    editorTheme: { type: String, default: 'vs-dark' },
    fontSize: { type: Number, default: 14 },
    language: { type: String, default: 'javascript' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
  },
  weeklyActivity: [{
    date: Date,
    linesWritten: Number,
    sessionsJoined: Number,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: full name
userSchema.virtual('displayName').get(function () {
  return this.username;
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate avatar fallback
userSchema.methods.getAvatarUrl = function () {
  if (this.avatar?.url) return this.avatar.url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.username)}&background=6366f1&color=fff&bold=true&size=128`;
};

userSchema.index({ username: 'text', bio: 'text', skills: 'text' });

module.exports = mongoose.model('User', userSchema);
