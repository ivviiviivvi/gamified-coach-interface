const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    error = new AppError(`Validation Error: ${messages.join(', ')}`, 400, 'VALIDATION_ERROR');
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    error = new AppError(`${field} already exists`, 400, 'DUPLICATE_ENTRY');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    error = new AppError('Payment processing error', 400, 'PAYMENT_ERROR');
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    error: code,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
module.exports.AppError = AppError;
