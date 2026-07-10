const express = require('express');
const router = express.Router();
const { createVersion, getVersions, restoreVersion, getVersion } = require('../controllers/versionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createVersion);
router.get('/:projectId', getVersions);
router.get('/single/:id', getVersion);
router.post('/:id/restore', restoreVersion);

module.exports = router;
