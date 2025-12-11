const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  res.json({ success: true, data: { notifications: [] } });
});

router.put('/:notificationId/read', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Notification marked as read' });
});

module.exports = router;
