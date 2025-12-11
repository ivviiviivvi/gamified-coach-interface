const express = require('express');
const router = express.Router();
const strategyController = require('../controllers/strategyController');
const { authenticate } = require('../middleware/auth');

// All strategy routes require authentication
router.post('/generate', authenticate, strategyController.generateStrategy);
router.get('/workspaces', authenticate, strategyController.getWorkspaces);
router.post('/workspaces', authenticate, strategyController.createWorkspace);
router.get('/history', authenticate, strategyController.getHistory);

module.exports = router;
