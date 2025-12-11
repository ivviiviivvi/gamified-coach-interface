const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { authenticate } = require('../middleware/auth');

// XP routes
router.post('/xp/award', authenticate, gamificationController.awardXP);
router.get('/xp/history', authenticate, gamificationController.getXPHistory);

module.exports = router;
