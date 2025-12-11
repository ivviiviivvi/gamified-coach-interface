const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// User analytics
router.get('/user/:userId', authenticate, async (req, res) => {
  res.json({ success: true, data: { analytics: {} } });
});

// Platform analytics (admin only)
router.get('/platform', authenticate, authorize('admin', 'founder'), async (req, res) => {
  res.json({ success: true, data: { analytics: {} } });
});

module.exports = router;
