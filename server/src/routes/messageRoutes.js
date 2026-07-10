const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, addReaction, pinMessage, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/:projectId', getMessages);
router.post('/', sendMessage);
router.post('/:id/react', addReaction);
router.patch('/:id/pin', pinMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
