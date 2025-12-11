const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.get('/:type/:period', async (req, res) => {
  res.json({ success: true, data: { leaderboard: [] } });
});

module.exports = router;
