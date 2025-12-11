const { sequelize } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const User = require('../models/User');
const logger = require('../utils/logger');
const { trackEvent } = require('../services/analyticsService');

/**
 * @desc    Get all available quests
 * @route   GET /api/v1/quests
 * @access  Private
 */
exports.getAllQuests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questType, difficulty, isActive = 'true' } = req.query;

    let filters = ['q.is_active = :isActive'];
    let replacements = { userId, isActive: isActive === 'true' };

    if (questType) {
      filters.push('q.quest_type = :questType');
      replacements.questType = questType;
    }

    if (difficulty) {
      filters.push('q.difficulty = :difficulty');
      replacements.difficulty = difficulty;
    }

    const query = `
      SELECT
        q.*,
        uq.status as user_status,
        uq.progress,
        uq.progress_percentage,
        uq.started_at as user_started_at,
        (q.required_level <= (SELECT level FROM users WHERE id = :userId)) as level_requirement_met,
        (
          SELECT COUNT(*) FROM user_quests
          WHERE quest_id = q.id AND status = 'completed'
        ) as total_completions
      FROM quests q
      LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = :userId
      WHERE ${filters.join(' AND ')}
        AND (q.starts_at IS NULL OR q.starts_at <= NOW())
        AND (q.expires_at IS NULL OR q.expires_at > NOW())
      ORDER BY
        CASE q.quest_type
          WHEN 'main' THEN 1
          WHEN 'boss_battle' THEN 2
          WHEN 'community' THEN 3
          WHEN 'weekly' THEN 4
          WHEN 'daily' THEN 5
          WHEN 'side' THEN 6
        END,
        q.xp_reward DESC
    `;

    const [quests] = await sequelize.query(query, { replacements });

    res.json({
      success: true,
      count: quests.length,
      data: { quests }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's active quests
 * @route   GET /api/v1/quests/my-quests
 * @access  Private
 */
exports.getMyQuests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status = 'active' } = req.query;

    const query = `
      SELECT
        q.*,
        uq.id as user_quest_id,
        uq.status,
        uq.progress,
        uq.progress_percentage,
        uq.started_at,
        uq.completed_at,
        uq.expires_at as quest_expires_at
      FROM user_quests uq
      JOIN quests q ON uq.quest_id = q.id
      WHERE uq.user_id = :userId
        AND uq.status = :status
      ORDER BY
        CASE q.quest_type
          WHEN 'main' THEN 1
          WHEN 'boss_battle' THEN 2
          WHEN 'daily' THEN 3
          WHEN 'weekly' THEN 4
          ELSE 5
        END,
        uq.started_at DESC
    `;

    const [quests] = await sequelize.query(query, {
      replacements: { userId, status }
    });

    res.json({
      success: true,
      count: quests.length,
      data: { quests }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start a quest
 * @route   POST /api/v1/quests/:questId/start
 * @access  Private
 */
exports.startQuest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questId } = req.params;

    // Get quest details
    const [quests] = await sequelize.query(`
      SELECT * FROM quests WHERE id = :questId AND is_active = TRUE
    `, {
      replacements: { questId }
    });

    if (quests.length === 0) {
      throw new AppError('Quest not found or inactive', 404, 'QUEST_NOT_FOUND');
    }

    const quest = quests[0];

    // Check if quest has already been started
    const [existingQuests] = await sequelize.query(`
      SELECT * FROM user_quests
      WHERE user_id = :userId AND quest_id = :questId
        AND status IN ('active', 'completed')
    `, {
      replacements: { userId, questId }
    });

    if (existingQuests.length > 0 && !quest.is_repeatable) {
      throw new AppError('Quest already started or completed', 400, 'QUEST_ALREADY_STARTED');
    }

    // Check level requirement
    const user = await User.findByPk(userId);
    if (user.level < quest.required_level) {
      throw new AppError(`Requires level ${quest.required_level}`, 400, 'LEVEL_TOO_LOW');
    }

    // Check max participants
    if (quest.max_participants) {
      const [participantCount] = await sequelize.query(`
        SELECT COUNT(*) as count FROM user_quests
        WHERE quest_id = :questId AND status = 'active'
      `, {
        replacements: { questId }
      });

      if (participantCount[0].count >= quest.max_participants) {
        throw new AppError('Quest is full', 400, 'QUEST_FULL');
      }
    }

    // Calculate expiration
    let expiresAt = quest.expires_at;
    if (!expiresAt && quest.estimated_duration) {
      const now = new Date();
      expiresAt = new Date(now.getTime() + quest.estimated_duration * 60000);
    }

    // Create user quest
    await sequelize.query(`
      INSERT INTO user_quests (user_id, quest_id, status, progress, started_at, expires_at)
      VALUES (:userId, :questId, 'active', '{}', NOW(), :expiresAt)
    `, {
      replacements: {
        userId,
        questId,
        expiresAt
      }
    });

    // Update quest participant count
    await sequelize.query(`
      UPDATE quests
      SET current_participants = current_participants + 1
      WHERE id = :questId
    `, {
      replacements: { questId }
    });

    // Track event
    await trackEvent({
      userId,
      eventType: 'quest_started',
      properties: {
        questId,
        questName: quest.title,
        questType: quest.quest_type
      }
    });

    res.json({
      success: true,
      message: 'Quest started successfully',
      data: { quest }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update quest progress
 * @route   PUT /api/v1/quests/:questId/progress
 * @access  Private
 */
exports.updateQuestProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questId } = req.params;
    const { progress, progressPercentage } = req.body;

    // Get user quest
    const [userQuests] = await sequelize.query(`
      SELECT * FROM user_quests
      WHERE user_id = :userId AND quest_id = :questId AND status = 'active'
    `, {
      replacements: { userId, questId }
    });

    if (userQuests.length === 0) {
      throw new AppError('Active quest not found', 404, 'QUEST_NOT_ACTIVE');
    }

    // Update progress
    await sequelize.query(`
      UPDATE user_quests
      SET progress = :progress,
          progress_percentage = :progressPercentage
      WHERE user_id = :userId AND quest_id = :questId
    `, {
      replacements: {
        userId,
        questId,
        progress: JSON.stringify(progress),
        progressPercentage
      }
    });

    res.json({
      success: true,
      message: 'Quest progress updated',
      data: {
        progressPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete a quest
 * @route   POST /api/v1/quests/:questId/complete
 * @access  Private
 */
exports.completeQuest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questId } = req.params;

    // Get quest and user quest details
    const [results] = await sequelize.query(`
      SELECT q.*, uq.status, uq.rewards_claimed
      FROM quests q
      JOIN user_quests uq ON q.id = uq.quest_id
      WHERE q.id = :questId AND uq.user_id = :userId
    `, {
      replacements: { userId, questId }
    });

    if (results.length === 0) {
      throw new AppError('Quest not found', 404, 'QUEST_NOT_FOUND');
    }

    const quest = results[0];

    if (quest.status !== 'active') {
      throw new AppError('Quest is not active', 400, 'QUEST_NOT_ACTIVE');
    }

    if (quest.rewards_claimed) {
      throw new AppError('Rewards already claimed', 400, 'REWARDS_CLAIMED');
    }

    // Mark quest as completed
    await sequelize.query(`
      UPDATE user_quests
      SET status = 'completed',
          completed_at = NOW(),
          progress_percentage = 100,
          rewards_claimed = TRUE
      WHERE user_id = :userId AND quest_id = :questId
    `, {
      replacements: { userId, questId }
    });

    // Award rewards
    const user = await User.findByPk(userId);
    await user.addXP(quest.xp_reward);

    // Create notification
    await sequelize.query(`
      INSERT INTO notifications (user_id, notification_type, title, message, data)
      VALUES (:userId, 'achievement', :title, :message, :data)
    `, {
      replacements: {
        userId,
        title: '✅ QUEST COMPLETED!',
        message: `You completed: ${quest.title}`,
        data: JSON.stringify({
          questId,
          xpReward: quest.xp_reward,
          currencyReward: quest.currency_reward
        })
      }
    });

    // Track event
    await trackEvent({
      userId,
      eventType: 'quest_completed',
      properties: {
        questId,
        questName: quest.title,
        questType: quest.quest_type,
        xpReward: quest.xp_reward
      }
    });

    // Check achievements
    // (This would trigger achievement check in a real implementation)

    res.json({
      success: true,
      message: 'Quest completed successfully!',
      data: {
        quest,
        rewards: {
          xp: quest.xp_reward,
          currency: quest.currency_reward
        },
        newXP: user.current_xp,
        newLevel: user.level
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Abandon a quest
 * @route   DELETE /api/v1/quests/:questId/abandon
 * @access  Private
 */
exports.abandonQuest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questId } = req.params;

    const result = await sequelize.query(`
      UPDATE user_quests
      SET status = 'failed'
      WHERE user_id = :userId AND quest_id = :questId AND status = 'active'
    `, {
      replacements: { userId, questId }
    });

    res.json({
      success: true,
      message: 'Quest abandoned'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new quest (admin/coach only)
 * @route   POST /api/v1/quests
 * @access  Private (Admin/Coach)
 */
exports.createQuest = async (req, res, next) => {
  try {
    const {
      title,
      description,
      questType,
      difficulty,
      xpReward,
      currencyReward,
      requiredLevel,
      maxParticipants,
      completionCriteria,
      startsAt,
      expiresAt,
      estimatedDuration,
      isRepeatable
    } = req.body;

    const [result] = await sequelize.query(`
      INSERT INTO quests (
        title, description, quest_type, difficulty, xp_reward, currency_reward,
        required_level, max_participants, completion_criteria, starts_at,
        expires_at, estimated_duration, is_repeatable, created_by
      )
      VALUES (
        :title, :description, :questType, :difficulty, :xpReward, :currencyReward,
        :requiredLevel, :maxParticipants, :completionCriteria, :startsAt,
        :expiresAt, :estimatedDuration, :isRepeatable, :createdBy
      )
      RETURNING *
    `, {
      replacements: {
        title,
        description,
        questType,
        difficulty,
        xpReward,
        currencyReward,
        requiredLevel,
        maxParticipants,
        completionCriteria: JSON.stringify(completionCriteria),
        startsAt,
        expiresAt,
        estimatedDuration,
        isRepeatable,
        createdBy: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Quest created successfully',
      data: { quest: result[0] }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
