const express = require('express');
const router = express.Router();
const { createBot, getBots, updateBot, deleteBot } = require('../controllers/botController');
const { protect } = require('../middleware/firebaseAuth');

// All bot routes are private! You must be logged in to manage bots.
router.route('/')
    .post(protect, createBot)
    .get(protect, getBots);

router.route('/:id')
    .put(protect, updateBot)
    .delete(protect, deleteBot);

module.exports = router;
