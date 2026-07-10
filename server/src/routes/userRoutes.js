const express = require('express');
const router = express.Router();
const {
  getUserProfile, updateProfile, uploadAvatar, toggleFollow,
  getUsers, changePassword, getDashboardStats,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(protect);
router.get('/dashboard-stats', getDashboardStats);
router.get('/', getUsers);
router.get('/:username', getUserProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/:id/follow', toggleFollow);

module.exports = router;
