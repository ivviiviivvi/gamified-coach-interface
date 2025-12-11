const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Track analytics event
 * @param {Object} eventData - Event data
 * @param {string} eventData.userId - User ID
 * @param {string} eventData.eventType - Type of event
 * @param {string} eventData.eventName - Name of event
 * @param {Object} eventData.properties - Additional properties
 * @param {string} eventData.pageUrl - Page URL
 * @param {string} eventData.referrer - Referrer URL
 * @param {Object} eventData.device - Device information
 */
async function trackEvent(eventData) {
  try {
    const query = `
      INSERT INTO analytics_events (
        user_id,
        event_type,
        event_name,
        properties,
        page_url,
        referrer,
        user_agent,
        ip_address,
        device_type,
        browser,
        os
      ) VALUES (
        :userId,
        :eventType,
        :eventName,
        :properties,
        :pageUrl,
        :referrer,
        :userAgent,
        :ipAddress,
        :deviceType,
        :browser,
        :os
      )
    `;

    await sequelize.query(query, {
      replacements: {
        userId: eventData.userId || null,
        eventType: eventData.eventType,
        eventName: eventData.eventName || null,
        properties: JSON.stringify(eventData.properties || {}),
        pageUrl: eventData.pageUrl || null,
        referrer: eventData.referrer || null,
        userAgent: eventData.device?.userAgent || null,
        ipAddress: eventData.device?.ipAddress || null,
        deviceType: eventData.device?.deviceType || null,
        browser: eventData.device?.browser || null,
        os: eventData.device?.os || null
      }
    });

    logger.debug(`Event tracked: ${eventData.eventType} for user ${eventData.userId}`);
  } catch (error) {
    logger.error('Failed to track event:', error);
    // Don't throw - analytics shouldn't break the app
  }
}

/**
 * Get user analytics summary
 * @param {string} userId - User ID
 * @param {number} days - Number of days to look back
 */
async function getUserAnalytics(userId, days = 30) {
  try {
    const query = `
      SELECT
        event_type,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM analytics_events
      WHERE user_id = :userId
        AND created_at >= NOW() - INTERVAL ':days days'
      GROUP BY event_type, DATE(created_at)
      ORDER BY date DESC
    `;

    const [results] = await sequelize.query(query, {
      replacements: { userId, days }
    });

    return results;
  } catch (error) {
    logger.error('Failed to get user analytics:', error);
    throw error;
  }
}

/**
 * Get platform-wide analytics
 * @param {number} days - Number of days to look back
 */
async function getPlatformAnalytics(days = 30) {
  try {
    const query = `
      SELECT
        event_type,
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users,
        DATE(created_at) as date
      FROM analytics_events
      WHERE created_at >= NOW() - INTERVAL ':days days'
      GROUP BY event_type, DATE(created_at)
      ORDER BY date DESC, total_events DESC
    `;

    const [results] = await sequelize.query(query, {
      replacements: { days }
    });

    return results;
  } catch (error) {
    logger.error('Failed to get platform analytics:', error);
    throw error;
  }
}

module.exports = {
  trackEvent,
  getUserAnalytics,
  getPlatformAnalytics
};
