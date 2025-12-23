
const { createServer } = require("http");
const Client = require("socket.io-client");
const jwt = require("jsonwebtoken");

// Mock database to avoid connection attempts and missing models
jest.mock('../../config/database', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    // define needs to return a class so that .prototype assignments work
    define: jest.fn().mockReturnValue(class MockModel {
      static findOne = jest.fn();
      static create = jest.fn();
      static save = jest.fn();
      static findByPk = jest.fn();
    }),
    close: jest.fn().mockResolvedValue(true),
  }
}));

// Mock logger to suppress output
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  stream: { write: jest.fn() }
}));

// Import the actual server components
// Note: We need to require this AFTER mocks
const { server, io } = require('../../server');

describe("Socket Security Integration", () => {
  let clientSocket;
  let port;
  const SECRET = process.env.JWT_SECRET || 'test_secret';

  beforeAll((done) => {
    // Ensure we have a secret
    process.env.JWT_SECRET = SECRET;

    // Listen on random port
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    io.close();
    server.close(done);
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  test("should BLOCK unauthorized user from sending message to guild", (done) => {
    // User is in guild 'guild_A'
    const token = jwt.sign({
        userId: "user_1",
        username: "hacker",
        role: "member",
        guilds: ["guild_A"]
    }, SECRET);

    clientSocket = new Client(`http://localhost:${port}`, {
        auth: { token }
    });

    clientSocket.on("connect", () => {
        // Expect an error event
        clientSocket.on("error", (data) => {
            try {
                expect(data.message).toBe("You are not a member of this guild");
                done();
            } catch (e) {
                done(e);
            }
        });

        // Hacker sends message to Guild B (which they are NOT in)
        clientSocket.emit("guild_message", {
            guildId: "guild_B", // Not in guild_A
            message: "Hello Guild B from outsider"
        });
    });
  });

  test("should ALLOW authorized user to send message to guild", (done) => {
     // User is in guild 'guild_B'
    const token = jwt.sign({
        userId: "user_2",
        username: "member",
        role: "member",
        guilds: ["guild_B"]
    }, SECRET);

    clientSocket = new Client(`http://localhost:${port}`, {
        auth: { token }
    });

    // We need another client to receive the message to verify it was sent
    const receiverToken = jwt.sign({
        userId: "user_3",
        username: "receiver",
        role: "member",
        guilds: ["guild_B"]
    }, SECRET);

    const receiverSocket = new Client(`http://localhost:${port}`, {
        auth: { token: receiverToken }
    });

    let connectedCount = 0;
    const checkStart = () => {
        connectedCount++;
        if (connectedCount === 2) {
             clientSocket.emit("guild_message", {
                guildId: "guild_B",
                message: "Hello Guild B"
            });
        }
    };

    clientSocket.on("connect", checkStart);
    receiverSocket.on("connect", checkStart);

    receiverSocket.on("new_guild_message", (data) => {
        try {
            expect(data.message).toBe("Hello Guild B");
            expect(data.senderId).toBe("user_2");
            receiverSocket.close();
            done();
        } catch(e) {
            done(e);
        }
    });
  });
});
