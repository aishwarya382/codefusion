const express = require('express');
const router = express.Router();

// Sessions are mostly handled via Socket.IO
// REST endpoints for session management
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @desc    Get session info
router.get('/:projectId', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'username avatar')
      .populate('members.user', 'username avatar');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user.id.toString());
    if (!isMember && !project.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    project.stats.totalSessions += 1;
    project.lastActivity = new Date();
    await project.save();

    res.json({ success: true, session: { project, currentCode: project.currentCode } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
