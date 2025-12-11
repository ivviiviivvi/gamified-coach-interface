const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

// Verify JWT token middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      subscriptionTier: decoded.subscriptionTier
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    }
    next(error);
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    next();
  };
};

// Subscription tier check middleware
const requireTier = (...tiers) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED'));
    }

    const tierHierarchy = {
      free: 0,
      potion: 1,
      core_quest: 2,
      raid: 3,
      mastermind: 4
    };

    const userTierLevel = tierHierarchy[req.user.subscriptionTier] || 0;
    const requiredTierLevel = Math.min(...tiers.map(t => tierHierarchy[t] || 0));

    if (userTierLevel < requiredTierLevel) {
      return next(new AppError('Subscription upgrade required', 403, 'UPGRADE_REQUIRED'));
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        subscriptionTier: decoded.subscriptionTier
      };
    }
  } catch (error) {
    // Silently fail - user remains unauthenticated
    logger.debug('Optional auth failed:', error.message);
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  requireTier,
  optionalAuth
};
