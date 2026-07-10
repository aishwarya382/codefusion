const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getProject, updateProject, deleteProject,
  inviteMember, removeMember, toggleArchive, exploreProjects,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/explore', exploreProjects);
router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);
router.patch('/:id/archive', toggleArchive);

module.exports = router;
