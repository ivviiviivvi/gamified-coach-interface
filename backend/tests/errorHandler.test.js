const { AppError } = require('../middleware/errorHandler');

// Mock logger before requiring errorHandler
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

const errorHandler = require('../middleware/errorHandler');

function mockReqResNext() {
  const req = {
    originalUrl: '/test',
    method: 'GET',
    ip: '127.0.0.1',
    user: null,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('AppError', () => {
  it('sets message, statusCode, and code', () => {
    const err = new AppError('Not found', 404, 'NOT_FOUND');
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.isOperational).toBe(true);
  });

  it('defaults code to null', () => {
    const err = new AppError('Bad request', 400);
    expect(err.code).toBeNull();
  });

  it('is an instance of Error', () => {
    const err = new AppError('Test', 500);
    expect(err).toBeInstanceOf(Error);
  });

  it('captures stack trace', () => {
    const err = new AppError('Stack test', 500);
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain('Stack test');
  });
});

describe('errorHandler middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('handles AppError with correct status and code', () => {
    const { req, res, next } = mockReqResNext();
    const err = new AppError('Forbidden', 403, 'FORBIDDEN');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'FORBIDDEN',
        message: 'Forbidden',
      })
    );
  });

  it('handles SequelizeValidationError', () => {
    const { req, res, next } = mockReqResNext();
    const err = new Error('Validation error');
    err.name = 'SequelizeValidationError';
    err.errors = [{ message: 'Name is required' }, { message: 'Email is invalid' }];

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'VALIDATION_ERROR',
        message: expect.stringContaining('Name is required'),
      })
    );
  });

  it('handles SequelizeUniqueConstraintError', () => {
    const { req, res, next } = mockReqResNext();
    const err = new Error('Unique constraint');
    err.name = 'SequelizeUniqueConstraintError';
    err.errors = [{ path: 'email' }];

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'DUPLICATE_ENTRY',
        message: 'email already exists',
      })
    );
  });

  it('handles JsonWebTokenError', () => {
    const { req, res, next } = mockReqResNext();
    const err = new Error('jwt malformed');
    err.name = 'JsonWebTokenError';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'INVALID_TOKEN' })
    );
  });

  it('handles TokenExpiredError', () => {
    const { req, res, next } = mockReqResNext();
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'TOKEN_EXPIRED' })
    );
  });

  it('handles Stripe errors', () => {
    const { req, res, next } = mockReqResNext();
    const err = new Error('Card declined');
    err.type = 'StripeCardError';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'PAYMENT_ERROR' })
    );
  });

  it('defaults to 500 for unknown errors', () => {
    const { req, res, next } = mockReqResNext();
    const err = new Error('Something broke');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Something broke',
      })
    );
  });

  it('includes stack trace in development mode', () => {
    process.env.NODE_ENV = 'development';
    const { req, res, next } = mockReqResNext();
    const err = new Error('Dev error');

    errorHandler(err, req, res, next);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.stack).toBeDefined();
  });

  it('excludes stack trace in production mode', () => {
    process.env.NODE_ENV = 'production';
    const { req, res, next } = mockReqResNext();
    const err = new Error('Prod error');

    errorHandler(err, req, res, next);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.stack).toBeUndefined();
  });
});
