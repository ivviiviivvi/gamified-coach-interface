const jwt = require('jsonwebtoken');

// Mock logger
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

const { authenticate, authorize, requireTier, optionalAuth } = require('../middleware/auth');

const JWT_SECRET = 'test-secret-key';

function mockReqResNext(overrides = {}) {
  const req = {
    headers: {},
    user: null,
    ...overrides,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

function makeToken(payload = {}) {
  return jwt.sign(
    {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user',
      subscriptionTier: 'free',
      ...payload,
    },
    JWT_SECRET
  );
}

describe('authenticate', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it('rejects requests with no authorization header', async () => {
    const { req, res, next } = mockReqResNext();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, code: 'NO_TOKEN' })
    );
  });

  it('rejects requests with non-Bearer auth header', async () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: 'Basic abc123' },
    });

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'NO_TOKEN' })
    );
  });

  it('attaches user to request for valid token', async () => {
    const token = makeToken({ userId: 'u1', email: 'a@b.com', role: 'admin', subscriptionTier: 'raid' }); // allow-secret
    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({
      id: 'u1',
      email: 'a@b.com',
      role: 'admin',
      subscriptionTier: 'raid',
    });
  });

  it('rejects expired tokens', async () => {
    const token = jwt.sign({ userId: 'u1' }, JWT_SECRET, { expiresIn: '-1s' }); // allow-secret
    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'TOKEN_EXPIRED' })
    );
  });

  it('rejects invalid tokens', async () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: 'Bearer invalid.token.here' },
    });

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'INVALID_TOKEN' })
    );
  });
});

describe('authorize', () => {
  it('allows users with matching role', () => {
    const middleware = authorize('admin', 'moderator');
    const { req, res, next } = mockReqResNext();
    req.user = { role: 'admin' };

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects users with non-matching role', () => {
    const middleware = authorize('admin');
    const { req, res, next } = mockReqResNext();
    req.user = { role: 'user' };

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' })
    );
  });

  it('rejects unauthenticated users', () => {
    const middleware = authorize('admin');
    const { req, res, next } = mockReqResNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, code: 'NOT_AUTHENTICATED' })
    );
  });
});

describe('requireTier', () => {
  it('allows users at or above required tier', () => {
    const middleware = requireTier('core_quest');
    const { req, res, next } = mockReqResNext();
    req.user = { subscriptionTier: 'raid' }; // raid (3) >= core_quest (2)

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('allows users at exact required tier', () => {
    const middleware = requireTier('potion');
    const { req, res, next } = mockReqResNext();
    req.user = { subscriptionTier: 'potion' };

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects users below required tier', () => {
    const middleware = requireTier('mastermind');
    const { req, res, next } = mockReqResNext();
    req.user = { subscriptionTier: 'free' };

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, code: 'UPGRADE_REQUIRED' })
    );
  });

  it('accepts multiple tiers (uses minimum)', () => {
    const middleware = requireTier('potion', 'raid');
    const { req, res, next } = mockReqResNext();
    req.user = { subscriptionTier: 'potion' }; // potion (1) >= min(potion(1), raid(3)) = 1

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('treats unknown tiers as free (level 0)', () => {
    const middleware = requireTier('potion');
    const { req, res, next } = mockReqResNext();
    req.user = { subscriptionTier: 'unknown_tier' };

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'UPGRADE_REQUIRED' })
    );
  });

  it('rejects unauthenticated users', () => {
    const middleware = requireTier('free');
    const { req, res, next } = mockReqResNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'NOT_AUTHENTICATED' })
    );
  });
});

describe('optionalAuth', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it('attaches user when valid token provided', async () => {
    const token = makeToken({ userId: 'u1', email: 'a@b.com', role: 'user', subscriptionTier: 'potion' }); // allow-secret
    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      id: 'u1',
      email: 'a@b.com',
      role: 'user',
      subscriptionTier: 'potion',
    });
  });

  it('proceeds without user when no token', async () => {
    const { req, res, next } = mockReqResNext();

    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeNull();
  });

  it('proceeds without user when token is invalid', async () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: 'Bearer bad.token' },
    });

    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeNull();
  });
});
