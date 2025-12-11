-- Legion Command Center Database Schema
-- Comprehensive schema for gamified coaching platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TYPE user_role AS ENUM ('member', 'coach', 'admin', 'founder');
CREATE TYPE subscription_tier AS ENUM ('free', 'potion', 'core_quest', 'raid', 'mastermind');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    role user_role DEFAULT 'member',
    status user_status DEFAULT 'active',

    -- Profile Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Gamification Stats
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    current_xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 100,
    title VARCHAR(100) DEFAULT 'Recruit',

    -- Subscription
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    stripe_customer_id VARCHAR(255),

    -- Tracking
    last_login TIMESTAMP,
    login_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_tokens (user_id),
    INDEX idx_token_expiry (expires_at)
);

-- ============================================
-- GAMIFICATION SYSTEM
-- ============================================

CREATE TYPE achievement_category AS ENUM ('fitness', 'social', 'learning', 'streak', 'milestone', 'special');
CREATE TYPE achievement_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category achievement_category NOT NULL,
    rarity achievement_rarity DEFAULT 'common',
    icon_url TEXT,
    xp_reward INTEGER DEFAULT 0,
    requirements JSONB, -- Flexible requirement definitions
    unlock_condition TEXT, -- SQL or code-based unlock logic
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,

    UNIQUE(user_id, achievement_id),
    INDEX idx_user_achievements (user_id)
);

CREATE TYPE skill_category AS ENUM ('strength', 'endurance', 'nutrition', 'mindset', 'charisma', 'wisdom');

CREATE TABLE skill_trees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category skill_category NOT NULL,
    description TEXT,
    icon_url TEXT,
    max_level INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skill_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_tree_id UUID NOT NULL REFERENCES skill_trees(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tier INTEGER NOT NULL, -- 1-5 (beginner to master)
    position_x INTEGER, -- For UI rendering
    position_y INTEGER,
    parent_node_id UUID REFERENCES skill_nodes(id), -- Prerequisites
    xp_cost INTEGER DEFAULT 0,
    requirements JSONB,
    benefits JSONB, -- What unlocking this provides
    icon_url TEXT,

    INDEX idx_skill_tree (skill_tree_id)
);

CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_node_id UUID NOT NULL REFERENCES skill_nodes(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 0,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP,

    UNIQUE(user_id, skill_node_id),
    INDEX idx_user_skills (user_id)
);

-- ============================================
-- QUEST & HABIT SYSTEM
-- ============================================

CREATE TYPE quest_type AS ENUM ('main', 'side', 'daily', 'weekly', 'community', 'boss_battle');
CREATE TYPE quest_status AS ENUM ('available', 'active', 'completed', 'failed', 'expired');
CREATE TYPE quest_difficulty AS ENUM ('trivial', 'easy', 'moderate', 'hard', 'legendary');

CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    quest_type quest_type NOT NULL,
    difficulty quest_difficulty DEFAULT 'moderate',

    -- Rewards
    xp_reward INTEGER DEFAULT 0,
    currency_reward INTEGER DEFAULT 0,
    achievement_id UUID REFERENCES achievements(id),

    -- Requirements
    required_level INTEGER DEFAULT 1,
    prerequisites JSONB, -- Quest IDs or other requirements

    -- Tracking
    max_participants INTEGER, -- NULL for unlimited
    current_participants INTEGER DEFAULT 0,
    completion_criteria JSONB, -- Flexible criteria definitions

    -- Timing
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    estimated_duration INTEGER, -- In minutes

    -- Metadata
    is_repeatable BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_quest_type (quest_type),
    INDEX idx_quest_status (is_active)
);

CREATE TABLE user_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    status quest_status DEFAULT 'available',

    -- Progress tracking
    progress JSONB, -- Flexible progress data
    progress_percentage INTEGER DEFAULT 0,

    -- Timing
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,

    -- Rewards claimed
    rewards_claimed BOOLEAN DEFAULT FALSE,

    INDEX idx_user_quests (user_id),
    INDEX idx_quest_status (status)
);

CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'custom');

CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    frequency habit_frequency DEFAULT 'daily',
    target_count INTEGER DEFAULT 1, -- How many times per frequency period
    xp_per_completion INTEGER DEFAULT 10,

    -- Tracking
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,

    -- Timing
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMP, -- NULL for ongoing

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_habits (user_id)
);

CREATE TABLE habit_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    INDEX idx_habit_completions (habit_id, completed_at)
);

-- ============================================
-- COMMUNITY SYSTEM
-- ============================================

CREATE TYPE guild_role AS ENUM ('owner', 'officer', 'member');

CREATE TABLE guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    charter TEXT, -- Guild rules and culture
    avatar_url TEXT,
    banner_url TEXT,

    -- Stats
    total_members INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,

    -- Settings
    is_public BOOLEAN DEFAULT TRUE,
    max_members INTEGER DEFAULT 100,

    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_guild_public (is_public)
);

CREATE TABLE guild_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role guild_role DEFAULT 'member',

    -- Contribution tracking
    xp_contributed INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(guild_id, user_id),
    INDEX idx_guild_members (guild_id)
);

CREATE TYPE post_type AS ENUM ('discussion', 'achievement', 'progress', 'question', 'announcement');

CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE, -- NULL for public posts
    post_type post_type DEFAULT 'discussion',

    title VARCHAR(300),
    content TEXT NOT NULL,
    media_urls JSONB, -- Array of image/video URLs

    -- Engagement
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,

    -- Moderation
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_forum_posts (guild_id, created_at),
    INDEX idx_user_posts (user_id)
);

CREATE TABLE forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES forum_comments(id), -- For nested replies

    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,

    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_post_comments (post_id, created_at)
);

CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id),
    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_dm_recipient (recipient_id, is_read),
    INDEX idx_dm_conversation (sender_id, recipient_id, created_at)
);

-- ============================================
-- STRATEGY FORGE & AI INTERACTIONS
-- ============================================

CREATE TYPE terminal_type AS ENUM (
    'hero_class', 'loot_table', 'propaganda', 'threat_analysis',
    'mission_logs', 'guild_charter', 'scriptorium'
);

CREATE TABLE strategy_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    terminal_type terminal_type NOT NULL,

    -- Input/Output
    user_input JSONB,
    ai_response JSONB,
    prompt_used TEXT,

    -- Metadata
    tokens_used INTEGER,
    response_time_ms INTEGER,
    was_cached BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_sessions (user_id, terminal_type)
);

CREATE TABLE strategy_workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    terminal_type terminal_type NOT NULL,

    name VARCHAR(200) DEFAULT 'Untitled Strategy',
    data JSONB, -- All user inputs and AI outputs for this workspace

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_workspaces (user_id)
);

-- ============================================
-- FITNESS & HEALTH TRACKING
-- ============================================

CREATE TYPE workout_type AS ENUM ('strength', 'cardio', 'flexibility', 'sports', 'other');
CREATE TYPE nutrition_goal AS ENUM ('weight_loss', 'muscle_gain', 'maintenance', 'performance');

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Physical stats
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    age INTEGER,
    gender VARCHAR(50),

    -- Goals
    fitness_goal TEXT,
    nutrition_goal nutrition_goal,
    target_weight_kg DECIMAL(5,2),
    target_date DATE,

    -- Preferences
    workout_frequency INTEGER, -- Per week
    preferred_workout_types JSONB, -- Array of workout_type
    dietary_restrictions JSONB,

    -- Third-party integrations
    fitbit_user_id VARCHAR(255),
    apple_health_enabled BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(300),
    workout_type workout_type NOT NULL,
    duration_minutes INTEGER,
    calories_burned INTEGER,

    -- Exercise details
    exercises JSONB, -- Array of exercises with sets/reps
    notes TEXT,

    -- Gamification
    xp_earned INTEGER DEFAULT 0,
    difficulty_rating INTEGER, -- 1-10

    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_workouts (user_id, completed_at)
);

CREATE TABLE nutrition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    meal_name VARCHAR(200),
    meal_type VARCHAR(50), -- breakfast, lunch, dinner, snack

    -- Macros
    calories INTEGER,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),

    -- Details
    foods JSONB, -- Array of food items
    notes TEXT,

    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_nutrition (user_id, logged_at)
);

CREATE TABLE body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),

    -- Measurements in cm
    chest_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    arms_cm DECIMAL(5,2),
    thighs_cm DECIMAL(5,2),

    photos JSONB, -- URLs to before/after photos
    notes TEXT,

    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_measurements (user_id, measured_at)
);

-- ============================================
-- CONTENT & EDUCATION
-- ============================================

CREATE TYPE content_type AS ENUM ('video', 'article', 'workout_plan', 'nutrition_plan', 'template', 'resource');
CREATE TYPE content_access AS ENUM ('free', 'potion', 'core_quest', 'raid', 'mastermind');

CREATE TABLE content_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    content_type content_type NOT NULL,

    -- Content
    content_url TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    file_size_mb DECIMAL(8,2),

    -- Access control
    required_tier content_access DEFAULT 'free',
    required_level INTEGER DEFAULT 1,

    -- Metadata
    tags JSONB,
    categories JSONB,

    -- Engagement
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,

    created_by UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_content_type (content_type, is_published)
);

CREATE TABLE user_content_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content_library(id) ON DELETE CASCADE,

    progress_percentage INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_position INTEGER, -- For videos: seconds

    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    UNIQUE(user_id, content_id),
    INDEX idx_user_content (user_id)
);

CREATE TABLE quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    quiz_name VARCHAR(200),
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2),

    answers JSONB, -- User's answers
    time_taken_seconds INTEGER,
    xp_earned INTEGER DEFAULT 0,

    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_quizzes (user_id)
);

-- ============================================
-- PAYMENTS & SUBSCRIPTIONS
-- ============================================

CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    tier subscription_tier NOT NULL,
    status subscription_status DEFAULT 'active',

    -- Stripe integration
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),

    -- Billing
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',

    -- Timing
    trial_ends_at TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    canceled_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_subscriptions (user_id),
    INDEX idx_stripe_subscription (stripe_subscription_id)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),

    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status payment_status DEFAULT 'pending',

    -- Stripe
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),

    -- Metadata
    description TEXT,
    receipt_url TEXT,

    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_payments (user_id),
    INDEX idx_payment_status (status)
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),

    invoice_number VARCHAR(100) UNIQUE NOT NULL,

    amount_cents INTEGER NOT NULL,
    tax_cents INTEGER DEFAULT 0,
    total_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Stripe
    stripe_invoice_id VARCHAR(255),

    invoice_url TEXT,
    pdf_url TEXT,

    due_date DATE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_invoices (user_id)
);

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

CREATE TYPE event_type AS ENUM (
    'page_view', 'button_click', 'quest_started', 'quest_completed',
    'achievement_unlocked', 'level_up', 'workout_logged', 'login', 'logout',
    'subscription_created', 'subscription_canceled', 'payment_succeeded'
);

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    event_type event_type NOT NULL,
    event_name VARCHAR(200),

    -- Context
    properties JSONB,
    page_url TEXT,
    referrer TEXT,

    -- Device info
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_events_user (user_id, created_at),
    INDEX idx_events_type (event_type, created_at)
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    session_token VARCHAR(500) UNIQUE NOT NULL,

    -- Session info
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,

    -- Device
    user_agent TEXT,
    ip_address INET,

    INDEX idx_user_sessions (user_id, started_at)
);

-- ============================================
-- NOTIFICATIONS & COMMUNICATIONS
-- ============================================

CREATE TYPE notification_type AS ENUM (
    'achievement', 'level_up', 'quest_available', 'quest_expiring',
    'community_post', 'direct_message', 'payment', 'system'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    notification_type notification_type NOT NULL,
    title VARCHAR(300) NOT NULL,
    message TEXT,

    -- Action
    action_url TEXT,
    action_label VARCHAR(100),

    -- Metadata
    data JSONB,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_notifications (user_id, is_read, created_at)
);

CREATE TABLE email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,

    -- Template info
    template_name VARCHAR(200),
    template_data JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    sent_at TIMESTAMP,
    error_message TEXT,

    scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_email_status (status, scheduled_for)
);

-- ============================================
-- LEADERBOARDS
-- ============================================

CREATE TYPE leaderboard_type AS ENUM ('xp', 'level', 'streak', 'workouts', 'community');
CREATE TYPE leaderboard_period AS ENUM ('daily', 'weekly', 'monthly', 'all_time');

CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leaderboard_type leaderboard_type NOT NULL,
    period leaderboard_period NOT NULL,

    rank INTEGER,
    score INTEGER NOT NULL,

    -- Metadata
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, leaderboard_type, period, period_start),
    INDEX idx_leaderboard (leaderboard_type, period, rank)
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategy_workspaces_updated_at BEFORE UPDATE ON strategy_workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Level up trigger (calculate XP requirements)
CREATE OR REPLACE FUNCTION calculate_xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Formula: 100 * level^1.5 (exponential growth)
    RETURN FLOOR(100 * POWER(level, 1.5));
END;
$$ LANGUAGE plpgsql;

-- User XP update trigger
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    WHILE NEW.current_xp >= NEW.xp_to_next_level LOOP
        NEW.current_xp := NEW.current_xp - NEW.xp_to_next_level;
        NEW.level := NEW.level + 1;
        NEW.total_xp := NEW.total_xp + NEW.xp_to_next_level;
        NEW.xp_to_next_level := calculate_xp_for_level(NEW.level + 1);

        -- Insert level up notification
        INSERT INTO notifications (user_id, notification_type, title, message)
        VALUES (
            NEW.id,
            'level_up',
            'LEVEL UP!',
            'Congratulations! You reached level ' || NEW.level || '!'
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_level_up BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.current_xp IS DISTINCT FROM NEW.current_xp)
    EXECUTE FUNCTION update_user_level();

-- Increment post comment count
CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE forum_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_post_comments AFTER INSERT ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION increment_comment_count();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_user_subscription_active ON users(id, subscription_tier) WHERE status = 'active';
CREATE INDEX idx_active_quests ON quests(is_active, quest_type, starts_at) WHERE is_active = TRUE;
CREATE INDEX idx_user_active_quests ON user_quests(user_id, status) WHERE status IN ('active', 'available');
CREATE INDEX idx_guild_public_active ON guilds(is_public, total_members) WHERE is_public = TRUE;

-- Full-text search indexes (for future implementation)
CREATE INDEX idx_forum_posts_content_trgm ON forum_posts USING gin(to_tsvector('english', content));
CREATE INDEX idx_content_library_search ON content_library USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

CREATE VIEW user_stats AS
SELECT
    u.id,
    u.username,
    u.level,
    u.total_xp,
    u.subscription_tier,
    COUNT(DISTINCT ua.id) as total_achievements,
    COUNT(DISTINCT uq.id) FILTER (WHERE uq.status = 'completed') as completed_quests,
    COUNT(DISTINCT h.id) as active_habits,
    u.login_streak,
    u.longest_streak
FROM users u
LEFT JOIN user_achievements ua ON u.id = ua.user_id AND ua.is_completed = TRUE
LEFT JOIN user_quests uq ON u.id = uq.user_id
LEFT JOIN habits h ON u.id = h.user_id AND h.is_active = TRUE
GROUP BY u.id;

CREATE VIEW guild_stats AS
SELECT
    g.id,
    g.name,
    g.total_members,
    g.total_xp,
    g.level,
    COUNT(DISTINCT fp.id) as total_posts,
    COUNT(DISTINCT gm.id) as active_members
FROM guilds g
LEFT JOIN forum_posts fp ON g.id = fp.guild_id
LEFT JOIN guild_members gm ON g.id = gm.guild_id
GROUP BY g.id;

-- ============================================
-- SEED DATA (Initial Achievements)
-- ============================================

INSERT INTO achievements (name, description, category, rarity, xp_reward, requirements) VALUES
('First Steps', 'Complete your first quest', 'milestone', 'common', 50, '{"quests_completed": 1}'),
('Social Butterfly', 'Make your first forum post', 'social', 'common', 25, '{"posts_created": 1}'),
('Knowledge Seeker', 'Complete the Training Simulator quiz', 'learning', 'common', 100, '{"quiz_completed": true}'),
('Week Warrior', 'Maintain a 7-day login streak', 'streak', 'uncommon', 150, '{"login_streak": 7}'),
('Dedication', 'Maintain a 30-day login streak', 'streak', 'rare', 500, '{"login_streak": 30}'),
('Iron Will', 'Maintain a 100-day login streak', 'streak', 'epic', 2000, '{"login_streak": 100}'),
('Legendary Commitment', 'Maintain a 365-day login streak', 'streak', 'legendary', 10000, '{"login_streak": 365}'),
('Fitness Initiate', 'Log your first workout', 'fitness', 'common', 50, '{"workouts_logged": 1}'),
('Gym Rat', 'Log 30 workouts', 'fitness', 'uncommon', 300, '{"workouts_logged": 30}'),
('Powerlifter', 'Log 100 workouts', 'fitness', 'rare', 1000, '{"workouts_logged": 100}'),
('Level 10 Boss', 'Reach level 10', 'milestone', 'uncommon', 250, '{"level": 10}'),
('Level 25 Elite', 'Reach level 25', 'milestone', 'rare', 750, '{"level": 25}'),
('Level 50 Legend', 'Reach level 50', 'milestone', 'epic', 2500, '{"level": 50}'),
('Guild Founder', 'Create a guild', 'social', 'uncommon', 200, '{"guilds_created": 1}'),
('Community Champion', 'Get 100 likes on your posts', 'social', 'rare', 500, '{"likes_received": 100}');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Core user accounts with authentication and gamification stats';
COMMENT ON TABLE achievements IS 'Unlockable achievements with XP rewards';
COMMENT ON TABLE quests IS 'Gamified tasks and goals for users';
COMMENT ON TABLE guilds IS 'User communities with shared goals';
COMMENT ON TABLE skill_trees IS 'RPG-style skill progression system';
COMMENT ON TABLE workouts IS 'Fitness activity tracking';
COMMENT ON TABLE subscriptions IS 'Stripe-integrated subscription management';
COMMENT ON TABLE analytics_events IS 'User behavior and interaction tracking';

-- ============================================
-- GRANTS (Adjust based on your role structure)
-- ============================================

-- Example: Grant permissions to application role
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO legion_app_role;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO legion_app_role;
