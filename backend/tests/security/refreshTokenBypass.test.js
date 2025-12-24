const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app } = require('../../server'); // Ensure we can import app
const User = require('../../models/User');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('jsonwebtoken');

describe('Security: Refresh Token Status Validation', () => {
  let mockUser;
  let refreshToken;

  beforeEach(() => {
    // Setup mock user
    mockUser = {
      id: 'user-123',
      email: 'banned@example.com',
      status: 'suspended',
      save: jest.fn(),
      comparePassword: jest.fn().mockResolvedValue(true)
    };

    refreshToken = 'valid_refresh_token';

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should REJECT token refresh if user is suspended (status != active)', async () => {
    // 1. Mock JWT verification to return a valid payload
    jwt.verify.mockReturnValue({ userId: mockUser.id });

    // 2. Mock User.findByPk to return the suspended user
    User.findByPk.mockResolvedValue(mockUser);

    // 3. Make request
    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    // 4. Expectation
    // If vulnerable, this will be 200. If fixed, it should be 403.
    expect(response.status).toBe(403);
    expect(response.body).toEqual(expect.objectContaining({
      success: false,
      error: 'ACCOUNT_INACTIVE'
    }));
  });

  it('should REJECT token refresh if user is deleted (status == deleted)', async () => {
     mockUser.status = 'deleted';

    // 1. Mock JWT verification
    jwt.verify.mockReturnValue({ userId: mockUser.id });

    // 2. Mock User.findByPk
    User.findByPk.mockResolvedValue(mockUser);

    // 3. Make request
    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('ACCOUNT_INACTIVE');
  });

  it('should ALLOW token refresh if user is active', async () => {
    mockUser.status = 'active';

    // 1. Mock JWT verification
    jwt.verify.mockReturnValue({ userId: mockUser.id });

    // 2. Mock User.findByPk
    User.findByPk.mockResolvedValue(mockUser);

    // 3. Mock jwt.sign for new token
    jwt.sign.mockReturnValue('new_access_token');

    // 4. Make request
    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
