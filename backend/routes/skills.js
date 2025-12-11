const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/trees', gamificationController.getSkillTrees);

// Protected routes
router.get('/user/:userId', authenticate, gamificationController.getUserSkills);
router.post('/unlock', authenticate, gamificationController.unlockSkill);

module.exports = router;
