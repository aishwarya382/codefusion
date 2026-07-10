const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, updateUser, deleteUser, sendAnnouncement } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));
router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/announcement', sendAnnouncement);

module.exports = router;
