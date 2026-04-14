const express = require('express');
const router = express.Router();
const { syncUser } = require('../controllers/authController');
const { protect } = require('../middleware/firebaseAuth');

// When the frontend logs in, it hits this route with its Firebase Token
router.post('/sync', protect, syncUser);

module.exports = router;
