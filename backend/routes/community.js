const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticate } = require('../middleware/auth');

// Guild routes
router.get('/guilds', communityController.getAllGuilds);
router.get('/guilds/:guildId', communityController.getGuild);
router.post('/guilds', authenticate, communityController.createGuild);
router.post('/guilds/:guildId/join', authenticate, communityController.joinGuild);

// Forum routes
router.get('/posts', communityController.getPosts);
router.post('/posts', authenticate, communityController.createPost);
router.post('/posts/:postId/like', authenticate, communityController.likePost);
router.get('/posts/:postId/comments', communityController.getComments);
router.post('/posts/:postId/comments', authenticate, communityController.addComment);

module.exports = router;
