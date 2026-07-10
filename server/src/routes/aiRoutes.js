const express = require('express');
const router = express.Router();
const { chat, explainCode, fixCode, optimizeCode, generateTests, addDocumentation } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/chat', chat);
router.post('/explain', explainCode);
router.post('/fix', fixCode);
router.post('/optimize', optimizeCode);
router.post('/tests', generateTests);
router.post('/document', addDocumentation);

module.exports = router;
