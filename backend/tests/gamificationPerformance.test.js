// Move mocks to top
jest.mock('../models/User', () => ({
  findByPk: jest.fn(),
  addXP: jest.fn()
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  stream: { write: jest.fn() }
}));

jest.mock('../services/analyticsService');

// Mock database with define support
jest.mock('../config/database', () => ({
  sequelize: {
    query: jest.fn(),
    define: jest.fn(() => ({
      prototype: {}
    }))
  }
}));

const gamificationController = require('../controllers/gamificationController');
const User = require('../models/User');
const { sequelize } = require('../config/database');

describe('gamificationController.checkAchievements Performance', () => {
  let req, res, next;
  let mockUser;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock User instance
    mockUser = {
      id: 1,
      login_streak: 5,
      level: 2,
      addXP: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue({})
    };

    // Setup User.findByPk to return our mock user
    // Note: Since we provided a factory for User mock, we need to access the mocked function
    User.findByPk.mockResolvedValue(mockUser);

    // Mock Request/Response
    req = {
      user: { id: 1 }
    };
    res = {
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should process multiple achievements', async () => {
    // 1. Mock sequelize.query for User Stats
    // Returns [stats, metadata]
    const userStats = [{
      quests_completed: 10,
      posts_created: 5,
      workouts_logged: 5,
      guilds_created: 1,
      likes_received: 20,
      login_streak: 5,
      level: 2
    }];

    // 2. Mock sequelize.query for Achievements
    // Returns 3 achievements that should be unlocked
    const achievements = [
      {
        id: 101,
        name: 'Quest Beginner',
        xp_reward: 100,
        requirements: { quests_completed: 1 }
      },
      {
        id: 102,
        name: 'Quest Master',
        xp_reward: 200,
        requirements: { quests_completed: 10 }
      },
      {
        id: 103,
        name: 'Social Butterfly',
        xp_reward: 50,
        requirements: { posts_created: 1 }
      }
    ];

    // Setup sequelize.query mock implementation
    sequelize.query
      .mockResolvedValueOnce([userStats]) // First call: Get user stats
      .mockResolvedValueOnce([achievements]); // Second call: Get achievements

    // Default response for subsequent insert queries
    sequelize.query.mockResolvedValue([[], 1]);

    await gamificationController.checkAchievements(req, res, next);

    // Verify response
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        unlockedCount: 3
      })
    }));

    // Verify User.addXP calls
    console.log(`User.addXP called ${mockUser.addXP.mock.calls.length} times`);

    // Verify total XP awarded (should be 350 regardless of implementation)
    const totalXP = achievements.reduce((sum, a) => sum + a.xp_reward, 0);

    if (mockUser.addXP.mock.calls.length === 1) {
        expect(mockUser.addXP).toHaveBeenCalledWith(totalXP);
    } else {
        const totalCalled = mockUser.addXP.mock.calls.reduce((sum, args) => sum + args[0], 0);
        expect(totalCalled).toBe(totalXP);
    }
  });
});
