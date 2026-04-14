const express = require('express');
const router = express.Router();
const { handleIncomingChat, getBotConfig, getChatHistory } = require('../controllers/chatController');

// This route is PUBLIC. The frontend widget will ping it.
router.get('/:botId/config', getBotConfig);

// Dedicated route to fetch previous retained messages on tab refresh
router.get('/:botId/history/:clientSessionId', getChatHistory);

router.post('/:botId', handleIncomingChat);

module.exports = router;
