const User = require('../models/User');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const Version = require('../models/Version');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProjects, totalVersions, newUsersThisWeek] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Version.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const recentActivity = await Project.find()
      .populate('owner', 'username avatar')
      .sort({ lastActivity: -1 })
      .limit(10)
      .select('title owner lastActivity stats');

    res.json({
      success: true,
      stats: { totalUsers, totalProjects, totalVersions, newUsersThisWeek },
      usersByRole,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (search) query.$or = [{ username: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({ success: true, users, total });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role / ban
// @route   PATCH /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role && { role }), ...(isActive !== undefined && { isActive }) },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send announcement
// @route   POST /api/admin/announcement
exports.sendAnnouncement = async (req, res, next) => {
  try {
    const { title, message, link } = req.body;
    const users = await User.find({ isActive: true }).select('_id');

    await Notification.insertMany(users.map(u => ({
      recipient: u._id,
      type: 'system',
      title,
      message,
      link: link || '/dashboard',
    })));

    res.json({ success: true, message: `Announcement sent to ${users.length} users` });
  } catch (error) {
    next(error);
  }
};
