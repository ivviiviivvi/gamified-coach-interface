-- Legion Command Center - Seed Data
-- Initial data for achievements, quests, skill trees, and content

-- ============================================
-- ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (name, description, category, rarity, xp_reward, requirements) VALUES
-- Milestone Achievements
('First Steps', 'Complete your first quest', 'milestone', 'common', 50, '{"quests_completed": 1}'),
('Rising Star', 'Reach level 5', 'milestone', 'common', 100, '{"level": 5}'),
('Warrior', 'Reach level 10', 'milestone', 'uncommon', 250, '{"level": 10}'),
('Elite', 'Reach level 25', 'milestone', 'rare', 750, '{"level": 25}'),
('Legend', 'Reach level 50', 'milestone', 'epic', 2500, '{"level": 50}'),

-- Social Achievements
('Social Butterfly', 'Make your first forum post', 'social', 'common', 25, '{"posts_created": 1}'),
('Guild Founder', 'Create a guild', 'social', 'uncommon', 200, '{"guilds_created": 1}'),
('Community Champion', 'Get 100 likes on your posts', 'social', 'rare', 500, '{"likes_received": 100}'),
('Influencer', 'Get 500 likes on your posts', 'social', 'epic', 2000, '{"likes_received": 500}'),

-- Streak Achievements
('Week Warrior', 'Maintain a 7-day login streak', 'streak', 'uncommon', 150, '{"login_streak": 7}'),
('Dedication', 'Maintain a 30-day login streak', 'streak', 'rare', 500, '{"login_streak": 30}'),
('Iron Will', 'Maintain a 100-day login streak', 'streak', 'epic', 2000, '{"login_streak": 100}'),
('Legendary Commitment', 'Maintain a 365-day login streak', 'streak', 'legendary', 10000, '{"login_streak": 365}'),

-- Fitness Achievements
('Fitness Initiate', 'Log your first workout', 'fitness', 'common', 50, '{"workouts_logged": 1}'),
('Gym Rat', 'Log 30 workouts', 'fitness', 'uncommon', 300, '{"workouts_logged": 30}'),
('Powerlifter', 'Log 100 workouts', 'fitness', 'rare', 1000, '{"workouts_logged": 100}'),
('Iron Warrior', 'Log 365 workouts', 'fitness', 'epic', 5000, '{"workouts_logged": 365}'),

-- Learning Achievements
('Knowledge Seeker', 'Complete the Training Simulator quiz', 'learning', 'common', 100, '{"quiz_completed": true}'),
('Student', 'Complete 5 content pieces', 'learning', 'common', 150, '{"content_completed": 5}'),
('Scholar', 'Complete 25 content pieces', 'learning', 'uncommon', 500, '{"content_completed": 25}'),

-- Special Achievements
('Early Adopter', 'Join during beta launch', 'special', 'legendary', 5000, '{"is_beta_user": true}'),
('Quest Master', 'Complete 50 quests', 'special', 'epic', 3000, '{"quests_completed": 50}');

-- ============================================
-- SKILL TREES
-- ============================================

-- Strength Tree
INSERT INTO skill_trees (name, category, description, icon_url, max_level) VALUES
('Strength Mastery', 'strength', 'Build raw power and muscle', '/icons/strength.png', 10);

SET @strength_tree_id = (SELECT id FROM skill_trees WHERE name = 'Strength Mastery');

INSERT INTO skill_nodes (skill_tree_id, name, description, tier, position_x, position_y, xp_cost, benefits) VALUES
(@strength_tree_id, 'Foundation Strength', 'Learn basic compound movements', 1, 0, 0, 50, '{"unlock": "compound_workout_plans"}'),
(@strength_tree_id, 'Progressive Overload', 'Master progressive training principles', 2, 0, 1, 100, '{"unlock": "advanced_programs"}'),
(@strength_tree_id, 'Power Development', 'Explosive strength training', 3, 0, 2, 200, '{"unlock": "olympic_lifts"}'),
(@strength_tree_id, 'Max Strength', 'Peak strength protocols', 4, 0, 3, 400, '{"unlock": "powerlifting_programs"}'),
(@strength_tree_id, 'Legendary Power', 'Elite strength mastery', 5, 0, 4, 800, '{"unlock": "custom_elite_programs"}');

-- Endurance Tree
INSERT INTO skill_trees (name, category, description, icon_url, max_level) VALUES
('Endurance Mastery', 'endurance', 'Build stamina and cardiovascular fitness', '/icons/endurance.png', 10);

-- Nutrition Tree
INSERT INTO skill_trees (name, category, description, icon_url, max_level) VALUES
('Nutrition Mastery', 'nutrition', 'Master diet and meal planning', '/icons/nutrition.png', 10);

-- Mindset Tree
INSERT INTO skill_trees (name, category, description, icon_url, max_level) VALUES
('Mindset Mastery', 'mindset', 'Develop mental resilience and discipline', '/icons/mindset.png', 10);

-- Charisma Tree (for coaches)
INSERT INTO skill_trees (name, category, description, icon_url, max_level) VALUES
('Charisma Mastery', 'charisma', 'Build influence and leadership', '/icons/charisma.png', 10);

-- Wisdom Tree (business/strategy)
INSERT INTO skill_trees (name, category, description, icon_url, max_level) VALUES
('Wisdom Mastery', 'wisdom', 'Strategic thinking and business acumen', '/icons/wisdom.png', 10);

-- ============================================
-- QUESTS
-- ============================================

-- Main Quests
INSERT INTO quests (title, description, quest_type, difficulty, xp_reward, currency_reward, required_level, completion_criteria, is_repeatable) VALUES
('The Hero Journey Begins', 'Complete your first workout and log it in the system', 'main', 'trivial', 100, 0, 1, '{"workouts_logged": 1}', false),
('Define Your Target', 'Use Strategy Forge Terminal 01 to define your ideal customer', 'main', 'easy', 150, 0, 1, '{"hero_class_completed": true}', false),
('Build Your Value Ladder', 'Use Terminal 02 to design your monetization strategy', 'main', 'moderate', 200, 0, 3, '{"loot_table_completed": true}', false),
('Craft Your Origin Myth', 'Use Terminal 03 to create your brand narrative', 'main', 'moderate', 200, 0, 5, '{"propaganda_completed": true}', false),
('Know Your Enemy', 'Use Terminal 04 for competitive analysis', 'main', 'moderate', 200, 0, 5, '{"threat_analysis_completed": true}', false),
('Join the Legion', 'Join or create a guild', 'main', 'easy', 150, 0, 3, '{"guild_joined": true}', false);

-- Daily Quests
INSERT INTO quests (title, description, quest_type, difficulty, xp_reward, required_level, completion_criteria, is_repeatable, estimated_duration) VALUES
('Daily Training', 'Complete one workout today', 'daily', 'easy', 50, 1, '{"daily_workout": 1}', true, 60),
('Daily Nourishment', 'Log all your meals today', 'daily', 'easy', 30, 1, '{"meals_logged": 3}', true, 15),
('Daily Wisdom', 'Read one article or watch one training video', 'daily', 'trivial', 25, 1, '{"content_consumed": 1}', true, 30),
('Daily Connection', 'Make one forum post or comment', 'daily', 'trivial', 20, 1, '{"social_interactions": 1}', true, 10);

-- Weekly Quests
INSERT INTO quests (title, description, quest_type, difficulty, xp_reward, required_level, completion_criteria, is_repeatable) VALUES
('Weekly Warrior', 'Complete 5 workouts this week', 'weekly', 'moderate', 250, 1, '{"weekly_workouts": 5}', true),
('Weekly Strategist', 'Complete one Strategy Forge session', 'weekly', 'moderate', 200, 3, '{"strategy_sessions": 1}', true),
('Community Builder', 'Make 10 meaningful forum posts or comments', 'weekly', 'moderate', 200, 5, '{"weekly_posts": 10}', true);

-- Side Quests
INSERT INTO quests (title, description, quest_type, difficulty, xp_reward, required_level, completion_criteria, is_repeatable) VALUES
('Knowledge Quest: Training Sim', 'Complete the Training Simulator quiz with 80%+', 'side', 'moderate', 200, 1, '{"quiz_score": 80}', false),
('Achievement Hunter', 'Unlock 10 achievements', 'side', 'hard', 500, 5, '{"achievements_unlocked": 10}', false),
('Skill Collector', 'Unlock 5 skill nodes', 'side', 'moderate', 300, 5, '{"skills_unlocked": 5}', false),
('Social Climber', 'Get 50 likes on your posts', 'side', 'hard', 400, 3, '{"likes_received": 50}', false);

-- Boss Battles (Long-term challenges)
INSERT INTO quests (title, description, quest_type, difficulty, xp_reward, required_level, completion_criteria, is_repeatable, estimated_duration) VALUES
('30-Day Transformation', 'Complete 30 consecutive days of workouts', 'boss_battle', 'legendary', 3000, 1, '{"consecutive_workout_days": 30}', true, 43200),
('Launch Your Empire', 'Complete all 7 Strategy Forge terminals', 'boss_battle', 'legendary', 5000, 5, '{"all_terminals_completed": true}', false, 10080),
('Build Your Legion', 'Grow your guild to 50 members', 'boss_battle', 'legendary', 4000, 10, '{"guild_members": 50}', false, NULL);

-- Community Quests
INSERT INTO quests (title, description, quest_type, difficulty, xp_reward, max_participants, completion_criteria, is_repeatable) VALUES
('Community Raid: 1 Million Calories', 'Collectively burn 1 million calories', 'community', 'legendary', 1000, NULL, '{"total_calories_burned": 1000000}', true),
('Forum Frenzy', 'Create 100 forum posts as a community this week', 'community', 'moderate', 500, NULL, '{"community_posts": 100}', true);

-- ============================================
-- CONTENT LIBRARY
-- ============================================

INSERT INTO content_library (title, description, content_type, required_tier, tags, categories, is_published, published_at) VALUES
-- Free Content
('Welcome to Legion Command Center', 'Getting started guide for new recruits', 'article', 'free', '["beginner", "guide"]', '["onboarding"]', true, NOW()),
('The Gamified Life Philosophy', 'Understanding the RPG approach to fitness', 'article', 'free', '["philosophy", "mindset"]', '["mindset"]', true, NOW()),
('Basic Workout Fundamentals', 'Introduction to compound movements', 'article', 'free', '["beginner", "strength"]', '["fitness"]', true, NOW()),

-- Potion Tier Content
('Advanced Nutrition Guide', 'Deep dive into macros and meal planning', 'article', 'potion', '["nutrition", "intermediate"]', '["nutrition"]', true, NOW()),
('30-Day Beginner Program', 'Structured 30-day workout plan', 'workout_plan', 'potion', '["beginner", "program"]', '["fitness"]', true, NOW()),

-- Core Quest Tier
('Elite Powerlifting Program', '12-week powerlifting specialization', 'workout_plan', 'core_quest', '["advanced", "strength"]', '["fitness"]', true, NOW()),
('Business Launch Masterclass', 'Complete guide to launching your coaching business', 'video', 'core_quest', '["business", "strategy"]', '["business"]', true, NOW()),

-- Raid Tier
('1-on-1 Coaching Session Template', 'Complete framework for coaching sessions', 'template', 'raid', '["coaching", "template"]', '["business"]', true, NOW());

-- ============================================
-- SAMPLE USERS (for testing)
-- ============================================

-- Create test admin user (password: admin123)
INSERT INTO users (email, username, password_hash, role, first_name, last_name, level, total_xp, subscription_tier) VALUES
('admin@legioncommand.com', 'LegionAdmin', '$2a$10$YourHashedPasswordHere', 'admin', 'Admin', 'User', 25, 50000, 'mastermind');

-- Create test coach user (password: coach123)
INSERT INTO users (email, username, password_hash, role, first_name, last_name, level, total_xp, subscription_tier) VALUES
('coach@legioncommand.com', 'CoachRob', '$2a$10$YourHashedPasswordHere', 'coach', 'Rob', 'Bonav', 30, 75000, 'mastermind');

-- Create test member (password: member123)
INSERT INTO users (email, username, password_hash, role, first_name, last_name, level, total_xp, subscription_tier) VALUES
('member@legioncommand.com', 'GamerWarrior', '$2a$10$YourHashedPasswordHere', 'member', 'John', 'Doe', 5, 500, 'free');

-- ============================================
-- SAMPLE GUILD
-- ============================================

SET @admin_id = (SELECT id FROM users WHERE username = 'LegionAdmin');

INSERT INTO guilds (name, description, charter, is_public, created_by) VALUES
('The Founding Legion',
 'The original guild for beta users and early adopters',
 'We are the pioneers of the gamified fitness revolution. Our mission: transform lives through the power of gaming psychology and proven fitness principles.',
 true,
 @admin_id);

SET @guild_id = (SELECT id FROM guilds WHERE name = 'The Founding Legion');

INSERT INTO guild_members (guild_id, user_id, role) VALUES
(@guild_id, @admin_id, 'owner');

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Welcome notifications for new users would be created via triggers or application logic

-- ============================================
-- ANALYTICS SETUP
-- ============================================

-- Sample leaderboard data would be generated from user activity

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE achievements IS 'Achievement definitions with unlock requirements';
COMMENT ON TABLE quests IS 'Quest/challenge definitions for gamification';
COMMENT ON TABLE skill_trees IS 'RPG-style skill progression trees';
COMMENT ON TABLE content_library IS 'Educational content and resources';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_quests_type_active ON quests(quest_type, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_content_published ON content_library(is_published, content_type) WHERE is_published = TRUE;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Legion Command Center - Seed Data Loaded';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Achievements: %', (SELECT COUNT(*) FROM achievements);
  RAISE NOTICE 'Quests: %', (SELECT COUNT(*) FROM quests);
  RAISE NOTICE 'Skill Trees: %', (SELECT COUNT(*) FROM skill_trees);
  RAISE NOTICE 'Content Items: %', (SELECT COUNT(*) FROM content_library);
  RAISE NOTICE '========================================';
END $$;
