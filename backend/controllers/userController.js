const { sequelize } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

async function fetchRows(query, userId) {
  const [rows] = await sequelize.query(query, { replacements: { userId } });
  return rows;
}

/**
 * @desc    Export full user-owned data for portability
 * @route   GET /api/v1/users/export
 * @access  Private
 */
exports.exportUserData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const exportStartedAt = new Date().toISOString();

    const [userResult] = await sequelize.query(`
      SELECT
        id,
        email,
        username,
        role,
        status,
        first_name,
        last_name,
        avatar_url,
        bio,
        timezone,
        level,
        total_xp,
        current_xp,
        xp_to_next_level,
        title,
        subscription_tier,
        subscription_start_date,
        subscription_end_date,
        -- stripe_customer_id excluded for security (sensitive payment info)
        last_login,
        login_streak,
        longest_streak,
        created_at,
        updated_at
      FROM users
      WHERE id = :userId
      LIMIT 1
    `, { replacements: { userId } });

    if (!userResult || userResult.length === 0) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Queries with LIMIT clauses to prevent unbounded exports and performance issues
    const queries = {
      profile: 'SELECT * FROM user_profiles WHERE user_id = :userId',
      achievements: 'SELECT * FROM user_achievements WHERE user_id = :userId',
      skills: 'SELECT * FROM user_skills WHERE user_id = :userId',
      quests: 'SELECT * FROM user_quests WHERE user_id = :userId',
      habits: 'SELECT * FROM habits WHERE user_id = :userId',
      habitCompletions: `
        SELECT * FROM habit_completions 
        WHERE user_id = :userId 
        ORDER BY completed_at DESC 
        LIMIT 10000
      `,
      guildMemberships: 'SELECT * FROM guild_members WHERE user_id = :userId',
      forumPosts: 'SELECT * FROM forum_posts WHERE user_id = :userId',
      forumComments: 'SELECT * FROM forum_comments WHERE user_id = :userId',
      postLikes: 'SELECT * FROM post_likes WHERE user_id = :userId',
      directMessages: `
        SELECT * FROM direct_messages
        WHERE sender_id = :userId OR recipient_id = :userId
        ORDER BY created_at DESC
        LIMIT 10000
      `,
      workspaces: 'SELECT * FROM strategy_workspaces WHERE user_id = :userId',
      sessions: `
        SELECT * FROM strategy_sessions 
        WHERE user_id = :userId 
        ORDER BY created_at DESC 
        LIMIT 1000
      `,
      workouts: 'SELECT * FROM workouts WHERE user_id = :userId',
      nutritionLogs: 'SELECT * FROM nutrition_logs WHERE user_id = :userId',
      bodyMeasurements: 'SELECT * FROM body_measurements WHERE user_id = :userId',
      contentProgress: 'SELECT * FROM user_content_progress WHERE user_id = :userId',
      createdContent: 'SELECT * FROM content_library WHERE created_by = :userId',
      quizResults: 'SELECT * FROM quiz_results WHERE user_id = :userId',
      subscriptions: 'SELECT * FROM subscriptions WHERE user_id = :userId',
      payments: 'SELECT * FROM payments WHERE user_id = :userId',
      invoices: 'SELECT * FROM invoices WHERE user_id = :userId',
      analyticsEvents: `
        SELECT * FROM analytics_events 
        WHERE user_id = :userId 
        ORDER BY created_at DESC 
        LIMIT 10000
      `,
      userSessions: `
        SELECT * FROM user_sessions 
        WHERE user_id = :userId 
        ORDER BY started_at DESC 
        LIMIT 1000
      `,
      notifications: `
        SELECT * FROM notifications 
        WHERE user_id = :userId 
        ORDER BY created_at DESC 
        LIMIT 5000
      `,
      leaderboards: 'SELECT * FROM leaderboards WHERE user_id = :userId',
    };

    // Execute all queries in parallel for better performance
    const queryPromises = Object.entries(queries).map(async ([key, query]) => {
      try {
        const rows = await fetchRows(query, userId);
        return [key, rows];
      } catch (error) {
        // Log error but don't fail entire export if one table is missing
        logger.warn(`Failed to fetch ${key} for user ${userId}:`, error.message);
        return [key, []];
      }
    });

    const resultsArray = await Promise.all(queryPromises);
    const results = Object.fromEntries(resultsArray);

    const exportPayload = {
      meta: {
        exported_at: exportStartedAt,
        user_id: userId,
        format: 'json',
      },
      account: userResult[0],
      profile: results.profile?.[0] || null,
      strategy: {
        workspaces: results.workspaces,
        sessions: results.sessions,
      },
      gamification: {
        achievements: results.achievements,
        skills: results.skills,
        quests: results.quests,
        habits: results.habits,
        habitCompletions: results.habitCompletions,
      },
      community: {
        guildMemberships: results.guildMemberships,
        forumPosts: results.forumPosts,
        forumComments: results.forumComments,
        postLikes: results.postLikes,
        directMessages: results.directMessages,
      },
      fitness: {
        workouts: results.workouts,
        nutritionLogs: results.nutritionLogs,
        bodyMeasurements: results.bodyMeasurements,
      },
      learning: {
        contentAuthored: results.createdContent,
        contentProgress: results.contentProgress,
        quizResults: results.quizResults,
      },
      billing: {
        subscriptions: results.subscriptions,
        payments: results.payments,
        invoices: results.invoices,
      },
      analytics: {
        events: results.analyticsEvents,
        sessions: results.userSessions,
      },
      notifications: results.notifications,
      leaderboards: results.leaderboards,
    };

    res.setHeader('Content-Disposition', `attachment; filename=user-${userId}-export.json`);
    res.json({ success: true, data: exportPayload });
  } catch (error) {
    logger.error('Failed to export user data', error);
    next(error);
  }
};

module.exports = exports;
