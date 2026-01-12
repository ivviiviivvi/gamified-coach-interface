const { sequelize } = require('../../config/database');

// Mock Sequelize and Database
jest.mock('../../config/database', () => {
  const mSequelize = {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    define: jest.fn(() => ({
      belongsToMany: jest.fn(),
      hasMany: jest.fn(),
      belongsTo: jest.fn(),
      prototype: {},
    })),
  };
  return { sequelize: mSequelize };
});

// Mock Socket.IO
let connectionHandler;
const mockSocketIo = jest.fn().mockImplementation(() => {
    return {
        use: jest.fn(),
        on: jest.fn((event, handler) => {
            if (event === 'connection') {
                connectionHandler = handler;
            }
        }),
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
    };
});

jest.mock('socket.io', () => mockSocketIo);

// Import server
const { app, io, server } = require('../../server');

describe('Socket Security: Input Sanitization', () => {
  let mockSocket;
  let sendMessageHandler;
  let guildMessageHandler;

  beforeAll(() => {
    expect(connectionHandler).toBeDefined();
  });

  afterAll(async () => {
    if (server && server.listening) {
      server.close();
    }
  });

  beforeEach(() => {
    // Create a mock socket
    mockSocket = {
      id: 'socket-123',
      join: jest.fn(),
      on: jest.fn((event, handler) => {
        if (event === 'send_message') {
          sendMessageHandler = handler;
        }
        if (event === 'guild_message') {
          guildMessageHandler = handler;
        }
      }),
      emit: jest.fn(),
      user: {
        id: 'user-123',
        username: 'Tester',
        guilds: [100]
      }
    };

    // Simulate connection
    connectionHandler(mockSocket);
  });

  describe('Direct Messages', () => {
    it('should sanitize XSS payload in direct messages', async () => {
      const data = { recipientId: 'user-456', message: '<script>alert(1)</script>' };

      // Clear mocks
      io.to.mockClear();
      io.emit.mockClear();

      await sendMessageHandler(data);

      // Verify message was sanitized
      expect(io.to).toHaveBeenCalledWith('user:user-456');
      expect(io.emit).toHaveBeenCalledWith('new_message', expect.objectContaining({
          message: '&lt;script&gt;alert(1)&lt;/script&gt;',
          senderId: 'user-123'
      }));
    });

    it('should reject non-string messages', async () => {
      const data = { recipientId: 'user-456', message: { hack: true } };

      // Clear mocks
      io.to.mockClear();
      io.emit.mockClear();

      await sendMessageHandler(data);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', expect.any(Object));
      expect(io.to).not.toHaveBeenCalled();
    });

    it('should reject oversized messages', async () => {
      const longMessage = 'a'.repeat(1001);
      const data = { recipientId: 'user-456', message: longMessage };

      // Clear mocks
      io.to.mockClear();
      io.emit.mockClear();

      await sendMessageHandler(data);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', expect.any(Object));
      expect(io.to).not.toHaveBeenCalled();
    });
  });

  describe('Guild Messages', () => {
    it('should sanitize XSS payload in guild messages', async () => {
      const data = { guildId: 100, message: '<b>Bold Hack</b>' };

      // Clear mocks
      io.to.mockClear();
      io.emit.mockClear();

      await guildMessageHandler(data);

      // Verify message was sanitized
      expect(io.to).toHaveBeenCalledWith('guild:100');
      expect(io.emit).toHaveBeenCalledWith('new_guild_message', expect.objectContaining({
          message: '&lt;b&gt;Bold Hack&lt;/b&gt;',
          senderId: 'user-123'
      }));
    });
  });
});
