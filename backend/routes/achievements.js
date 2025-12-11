const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', gamificationController.getAllAchievements);

// Protected routes
router.get('/user/:userId', authenticate, gamificationController.getUserAchievements);
router.post('/check', authenticate, gamificationController.checkAchievements);

module.exports = router;
