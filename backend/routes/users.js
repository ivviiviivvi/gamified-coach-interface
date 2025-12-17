const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// XP routes
router.post('/xp/award', authenticate, gamificationController.awardXP);
router.get('/xp/history', authenticate, gamificationController.getXPHistory);

// Onboarding routes
router.post('/onboarding', authenticate, gamificationController.saveOnboarding);

// Data export
router.get('/export', authenticate, userController.exportUserData);

module.exports = router;
