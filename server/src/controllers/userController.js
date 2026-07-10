const User = require('../models/User');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/:username
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username avatar bio')
      .populate('following', 'username avatar bio')
      .select('-password -emailVerificationToken -passwordResetToken');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const projects = await Project.find({
      $or: [
        { owner: user._id },
        { 'members.user': user._id, isPublic: true },
      ],
      isArchived: false,
    }).select('title description language tags stats createdAt').limit(12);

    res.json({
      success: true,
      user: { ...user.toObject(), avatar: user.getAvatarUrl() },
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { bio, skills, location, website, githubUsername, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio, skills, location, website, githubUsername, preferences },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated', user: { ...user.toObject(), avatar: user.getAvatarUrl() } });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });

    const user = await User.findById(req.user.id);
    // Delete old avatar from cloudinary
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    user.avatar = { url: req.file.path, publicId: req.file.filename };
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Avatar updated', avatar: req.file.path });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow / Unfollow user
// @route   POST /api/users/:id/follow
exports.toggleFollow = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user.id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      currentUser.following.pull(req.params.id);
      targetUser.followers.pull(req.user.id);
    } else {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user.id);
      await Notification.create({
        recipient: targetUser._id,
        sender: req.user.id,
        type: 'follow',
        title: 'New Follower',
        message: `${currentUser.username} started following you`,
        link: `/profile/${currentUser.username}`,
      });
    }

    await currentUser.save({ validateBeforeSave: false });
    await targetUser.save({ validateBeforeSave: false });

    res.json({ success: true, isFollowing: !isFollowing });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users list
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };

    const users = await User.find(query)
      .select('username email avatar bio skills role stats createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users: users.map(u => ({ ...u.toObject(), avatar: u.getAvatarUrl() })), total, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/users/dashboard-stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [projectCount, user] = await Promise.all([
      Project.countDocuments({ $or: [{ owner: userId }, { 'members.user': userId }], isArchived: false }),
      User.findById(userId).select('stats weeklyActivity badges'),
    ]);

    res.json({ success: true, stats: { ...user.stats, projectsJoined: projectCount }, weeklyActivity: user.weeklyActivity, badges: user.badges });
  } catch (error) {
    next(error);
  }
};
