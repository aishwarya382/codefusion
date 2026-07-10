const Version = require('../models/Version');
const Project = require('../models/Project');

// @desc    Create version snapshot
// @route   POST /api/versions
exports.createVersion = async (req, res, next) => {
  try {
    const { projectId, code, language, message, isManual = false } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isMember = project.members.some(m => m.user.toString() === req.user.id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const lastVersion = await Version.findOne({ project: projectId }).sort({ versionNumber: -1 });
    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    const version = await Version.create({
      project: projectId,
      author: req.user.id,
      code,
      language,
      message: message || `v${versionNumber} - Auto snapshot`,
      versionNumber,
      isManual,
    });

    project.stats.totalVersions = versionNumber;
    project.currentCode = code;
    project.lastActivity = new Date();
    await project.save();

    await version.populate('author', 'username avatar');
    res.status(201).json({ success: true, version });
  } catch (error) {
    next(error);
  }
};

// @desc    Get version history
// @route   GET /api/versions/:projectId
exports.getVersions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const versions = await Version.find({ project: req.params.projectId })
      .populate('author', 'username avatar')
      .sort({ versionNumber: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Version.countDocuments({ project: req.params.projectId });
    res.json({ success: true, versions, total });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore a version
// @route   POST /api/versions/:id/restore
exports.restoreVersion = async (req, res, next) => {
  try {
    const version = await Version.findById(req.params.id).populate('project');
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });

    // Create new version with restore note
    const lastVersion = await Version.findOne({ project: version.project._id }).sort({ versionNumber: -1 });
    await Version.create({
      project: version.project._id,
      author: req.user.id,
      code: version.code,
      language: version.language,
      message: `Restored from v${version.versionNumber}`,
      versionNumber: lastVersion.versionNumber + 1,
      isManual: true,
    });

    await Project.findByIdAndUpdate(version.project._id, {
      currentCode: version.code,
      lastActivity: new Date(),
    });

    res.json({ success: true, message: `Restored to version ${version.versionNumber}`, code: version.code });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific version
// @route   GET /api/versions/single/:id
exports.getVersion = async (req, res, next) => {
  try {
    const version = await Version.findById(req.params.id).populate('author', 'username avatar');
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });
    res.json({ success: true, version });
  } catch (error) {
    next(error);
  }
};
