const express = require('express');
const router = express.Router();
const strategyController = require('../controllers/strategyController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// All strategy routes require authentication
router.post('/generate', authenticate, strategyController.generateStrategy);
router.get('/workspaces', authenticate, strategyController.getWorkspaces);
router.post('/workspaces', authenticate, strategyController.createWorkspace);
router.get('/history', authenticate, strategyController.getHistory);
router.get('/workspaces/:id/export', authenticate, strategyController.exportWorkspace);

// Progressive enhancement fallbacks (no JS required)
router.get('/offline', optionalAuth, strategyController.offlineForm);
router.post('/offline', optionalAuth, strategyController.offlineAnalysis);

module.exports = router;
