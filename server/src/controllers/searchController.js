const User = require('../models/User');
const Project = require('../models/Project');
const Message = require('../models/Message');

// @desc    Global search
// @route   GET /api/search
exports.globalSearch = async (req, res, next) => {
  try {
    const { q, type = 'all', page = 1, limit = 10 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const searchRegex = new RegExp(q, 'i');
    const results = {};

    if (type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [{ username: searchRegex }, { bio: searchRegex }],
        isActive: true,
      }).select('username avatar bio skills role').limit(parseInt(limit));
    }

    if (type === 'all' || type === 'projects') {
      results.projects = await Project.find({
        $and: [
          { $or: [{ title: searchRegex }, { description: searchRegex }, { tags: searchRegex }] },
          { $or: [{ isPublic: true }, { 'members.user': req.user.id }] }
        ],
        isArchived: false,
      }).populate('owner', 'username avatar').select('title description language tags stats').limit(parseInt(limit));
    }

    if (type === 'all' || type === 'messages') {
      const userProjects = await Project.find({ 'members.user': req.user.id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      results.messages = await Message.find({
        project: { $in: projectIds },
        content: searchRegex,
        deletedAt: null,
      }).populate('sender', 'username avatar')
        .populate('project', 'title')
        .select('content type createdAt project sender')
        .limit(parseInt(limit));
    }

    res.json({ success: true, results, query: q });
  } catch (error) {
    next(error);
  }
};
