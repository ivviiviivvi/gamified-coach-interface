const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Socket.IO authentication middleware
const authenticateSocket = (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to socket
    socket.user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
      guilds: decoded.guilds || []
    };

    logger.debug(`Socket authenticated for user: ${socket.user.id}`);
    next();
  } catch (error) {
    logger.error('Socket authentication failed:', error.message);
    next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = authenticateSocket;
