const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

router.get('/classes/:id/chat', auth, chatController.getMessages);
router.post('/classes/:id/chat', auth, chatController.postMessage);

module.exports = router; 