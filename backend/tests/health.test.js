const request = require('supertest');

// Mock Sequelize and Models BEFORE requiring server
jest.mock('../config/database', () => {
  const mSequelize = {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    define: jest.fn(() => ({
      belongsToMany: jest.fn(),
      hasMany: jest.fn(),
      belongsTo: jest.fn(),
      prototype: {}, // Allow adding methods to prototype
    })),
  };
  return { sequelize: mSequelize };
});

// We also need to mock socket.io
jest.mock('socket.io', () => {
  return jest.fn().mockImplementation(() => ({
    use: jest.fn(),
    on: jest.fn(),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  }));
});

// Now require app
const { app, io, server } = require('../server');
const { sequelize } = require('../config/database');


describe('Server Health Check', () => {
  afterAll(async () => {
    // If the server object is available and open, close it
    if (server && server.listening) {
      server.close();
    }
    // Clean up sequelize mock if needed (though it's a mock)
    await sequelize.close();
  });

  it('GET /health should return online status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('online');
    expect(res.body.database).toEqual('connected');
  });
});
