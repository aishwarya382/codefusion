const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create project
// @route   POST /api/projects
exports.createProject = async (req, res, next) => {
  try {
    const { title, description, language, tags, isPublic } = req.body;
    const project = await Project.create({
      title, description, language, tags, isPublic,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'owner' }],
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.projectsCreated': 1 } });

    await project.populate('owner', 'username avatar');
    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for user
// @route   GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, archived = false } = req.query;
    const query = {
      $or: [{ owner: req.user.id }, { 'members.user': req.user.id }],
      isArchived: archived === 'true',
    };
    if (search) query.$text = { $search: search };

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('owner', 'username avatar')
        .populate('members.user', 'username avatar')
        .sort({ lastActivity: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Project.countDocuments(query),
    ]);

    res.json({ success: true, projects, total, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username avatar bio')
      .populate('members.user', 'username avatar bio role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user.id.toString());
    if (!project.isPublic && !isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.user.id.toString());
    if (!member || !['owner', 'editor'].includes(member.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const { title, description, language, tags, isPublic, settings, currentCode } = req.body;
    Object.assign(project, { title, description, language, tags, isPublic, settings, currentCode, lastActivity: new Date() });
    await project.save();

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this project' });
    }
    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite member to project
// @route   POST /api/projects/:id/invite
exports.inviteMember = async (req, res, next) => {
  try {
    const { username, role = 'editor' } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const ownerMember = project.members.find(m => m.user.toString() === req.user.id.toString());
    if (!ownerMember || ownerMember.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Only the owner can invite members' });
    }

    const targetUser = await User.findOne({ username });
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyMember = project.members.some(m => m.user.toString() === targetUser._id.toString());
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User is already a member' });

    project.members.push({ user: targetUser._id, role });
    project.lastActivity = new Date();
    await project.save();

    await Notification.create({
      recipient: targetUser._id,
      sender: req.user.id,
      type: 'invitation',
      title: 'Project Invitation',
      message: `You've been invited to collaborate on "${project.title}"`,
      link: `/projects/${project._id}`,
      data: { projectId: project._id, role },
    });

    await User.findByIdAndUpdate(targetUser._id, { $inc: { 'stats.collaborations': 1 } });

    res.json({ success: true, message: `${username} invited successfully` });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member
// @route   DELETE /api/projects/:id/members/:userId
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isOwner = project.owner.toString() === req.user.id.toString();
    const isSelf = req.params.userId === req.user.id.toString();
    if (!isOwner && !isSelf) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive/Unarchive project
// @route   PATCH /api/projects/:id/archive
exports.toggleArchive = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can archive' });
    }
    project.isArchived = !project.isArchived;
    await project.save();
    res.json({ success: true, isArchived: project.isArchived });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public projects
// @route   GET /api/projects/explore
exports.exploreProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, language, search } = req.query;
    const query = { isPublic: true, isArchived: false };
    if (language) query.language = language;
    if (search) query.$text = { $search: search };

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('owner', 'username avatar')
        .sort({ lastActivity: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Project.countDocuments(query),
    ]);

    res.json({ success: true, projects, total });
  } catch (error) {
    next(error);
  }
};
