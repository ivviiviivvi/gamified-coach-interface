const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Mock external dependencies before requiring the server
jest.mock('../../config/database', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    define: jest.fn().mockImplementation((name, schema, options) => {
      class MockModel {}
      return MockModel;
    })
  }
}));

// Mock logger to reduce noise
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  stream: { write: jest.fn() }
}));

// Import the actual server components
const { server, io: sio } = require('../../server');

describe('Socket.IO XSS Vulnerability Check', () => {
  let clientSocket, port;
  const testUser = {
    userId: 'user1',
    email: 'test@example.com',
    username: 'User One',
    role: 'member',
    guilds: ['guild1']
  };

  beforeAll((done) => {
    // Generate a valid token for the test user
    process.env.JWT_SECRET = 'test-secret';

    // server.listen(0) will pick a random available port
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    // If the server failed to start, this might be called.
    // server.close() is async.
    if (server.listening) {
      server.close(() => {
        // sio.close() is also async but usually fast
        sio.close(() => {
           done();
        });
      });
    } else {
      // If server is not listening, just try closing sio and done
      sio.close(() => {});
      done();
    }
  });

  beforeEach((done) => {
    const token = jwt.sign(testUser, process.env.JWT_SECRET);

    clientSocket = io(`http://localhost:${port}`, {
      auth: { token }
    });

    clientSocket.on('connect', done);
    clientSocket.on('connect_error', (err) => {
      done(err);
    });
  });

  afterEach(() => {
    clientSocket.close();
  });

  test('should sanitize XSS in direct messages', (done) => {
    const xssPayload = '<script>alert("xss")</script>hello';
    const expectedSafe = 'hello';

    clientSocket.on('new_message', (data) => {
      if (data.message === expectedSafe) {
        done();
      } else {
        done(new Error(`Payload NOT sanitized properly. Got: ${data.message}`));
      }
    });

    clientSocket.emit('send_message', {
      recipientId: 'user1',
      message: xssPayload
    });
  });

  test('should sanitize XSS in guild messages', (done) => {
    const xssPayload = '<img src=x onerror=alert(1)>world';
    const expectedSafe = 'world';

    clientSocket.on('new_guild_message', (data) => {
      if (data.message === expectedSafe) {
        done();
      } else {
        done(new Error(`Payload NOT sanitized properly. Got: ${data.message}`));
      }
    });

    clientSocket.emit('guild_message', {
      guildId: 'guild1',
      message: xssPayload
    });
  });
});
