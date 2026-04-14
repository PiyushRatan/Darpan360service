const express = require('express');
const router = express.Router();
const { handleIncomingChat, getBotConfig, getChatHistory } = require('../controllers/chatController');

// Public route for widget configuration retrieval
router.get('/:botId/config', getBotConfig);

// Fetch historical messages for an existing client session
router.get('/:botId/history/:clientSessionId', getChatHistory);

router.post('/:botId', handleIncomingChat);

module.exports = router;
