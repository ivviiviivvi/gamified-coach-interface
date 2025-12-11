const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, questController.getAllQuests);
router.get('/my-quests', authenticate, questController.getMyQuests);
router.post('/:questId/start', authenticate, questController.startQuest);
router.put('/:questId/progress', authenticate, questController.updateQuestProgress);
router.post('/:questId/complete', authenticate, questController.completeQuest);
router.delete('/:questId/abandon', authenticate, questController.abandonQuest);

// Admin/Coach only routes
router.post('/', authenticate, authorize('admin', 'coach', 'founder'), questController.createQuest);

module.exports = router;
