const express = require('express');
const request = require('supertest');
const { authLimiter } = require('../../middleware/rateLimiters');

// Mock app to test the middleware in isolation
const app = express();
app.use(express.json());

// Apply the limiter to a test route
app.post('/test-login', authLimiter, (req, res) => {
  res.status(200).json({ success: true });
});

describe('Auth Rate Limiter', () => {
  it('should enforce rate limits', async () => {
    const limit = 10;

    // Consume the limit
    for (let i = 0; i < limit; i++) {
      const response = await request(app).post('/test-login');
      expect(response.status).toBe(200);
    }

    // The next request should fail
    const response = await request(app).post('/test-login');
    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      error: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts from this IP, please try again after 15 minutes'
    });
  });
});
