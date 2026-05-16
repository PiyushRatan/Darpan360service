const express = require('express');
const router = express.Router();
const { createBot, getBots, updateBot, deleteBot, generateReferenceDraft } = require('../controllers/botController');
const { protect } = require('../middleware/firebaseAuth');

// Bot management routes require authentication
router.route('/')
    .post(protect, createBot)
    .get(protect, getBots);

router.post('/generate-reference', protect, generateReferenceDraft);

router.route('/:id')
    .put(protect, updateBot)
    .delete(protect, deleteBot);

module.exports = router;
