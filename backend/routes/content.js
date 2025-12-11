const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.get('/', async (req, res) => {
  res.json({ success: true, data: { content: [] } });
});

router.get('/:contentId', async (req, res) => {
  res.json({ success: true, data: { content: {} } });
});

router.post('/:contentId/progress', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Progress updated' });
});

module.exports = router;
