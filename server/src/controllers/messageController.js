const Message = require('../models/Message');
const Project = require('../models/Project');

// @desc    Get messages for project
// @route   GET /api/messages/:projectId
exports.getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isMember = project.members.some(m => m.user.toString() === req.user.id.toString());
    if (!isMember && !project.isPublic) return res.status(403).json({ success: false, message: 'Access denied' });

    const messages = await Message.find({ project: req.params.projectId, deletedAt: null })
      .populate('sender', 'username avatar')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, messages: messages.reverse(), total: messages.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { projectId, content, type = 'text', codeLanguage, replyTo } = req.body;
    const message = await Message.create({
      project: projectId,
      sender: req.user.id,
      content,
      type,
      codeLanguage,
      replyTo,
      readBy: [req.user.id],
    });
    await message.populate('sender', 'username avatar');
    if (replyTo) await message.populate('replyTo', 'content sender');

    await Project.findByIdAndUpdate(projectId, {
      $inc: { 'stats.totalMessages': 1 },
      lastActivity: new Date(),
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reaction
// @route   POST /api/messages/:id/react
exports.addReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      const userIndex = existingReaction.users.indexOf(req.user.id);
      if (userIndex > -1) {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(req.user.id);
      }
    } else {
      message.reactions.push({ emoji, users: [req.user.id] });
    }

    await message.save();
    res.json({ success: true, reactions: message.reactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Pin message
// @route   PATCH /api/messages/:id/pin
exports.pinMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    message.isPinned = !message.isPinned;
    await message.save();

    if (message.isPinned) {
      await Project.findByIdAndUpdate(message.project, { pinnedMessage: message._id });
    }

    res.json({ success: true, isPinned: message.isPinned });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (message.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    message.deletedAt = new Date();
    message.content = '[Message deleted]';
    await message.save();
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};
