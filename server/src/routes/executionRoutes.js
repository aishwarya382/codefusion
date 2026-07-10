const express = require('express');
const router = express.Router();
const { executeCode, getSupportedLanguages } = require('../controllers/executionController');
const { protect } = require('../middleware/auth');

router.get('/languages', getSupportedLanguages);
router.post('/', protect, executeCode);

module.exports = router;
