# Legion Command Center - Backend API

Comprehensive backend API for the gamified coaching platform.

## Features

### ✅ Core Systems
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management
- **Database**: PostgreSQL with comprehensive schema

### ✅ Gamification
- **XP & Leveling**: Dynamic XP system with level progression
- **Achievements**: 15+ unlockable achievements with progress tracking
- **Skills Trees**: RPG-style skill progression with unlockable nodes
- **Quests**: Main quests, side quests, daily/weekly challenges
- **Habits**: Habit tracking with streak management

### ✅ Community
- **Guilds**: Create and join communities
- **Forum**: Posts, comments, likes
- **Real-time Chat**: Socket.IO integration for DMs and guild chat
- **Leaderboards**: XP, level, streak, and activity-based rankings

### ✅ AI Strategy Tools
- **Context-Aware AI**: Multi-turn conversations with conversation history
- **7 Strategy Terminals**:
  1. Hero Class (Target audience definition)
  2. Loot Table (Monetization strategy)
  3. Propaganda (Brand narrative)
  4. Threat Analysis (Competitor research)
  5. Mission Logs (Weekly planning)
  6. Guild Charter (Community design)
  7. Scriptorium (Content generation)
- **Workspace Management**: Save and organize strategy sessions
- **Response Caching**: Redis-based caching for performance

### 🔧 In Progress
- **Fitness Tracking**: Workouts, nutrition, measurements
- **Stripe Payments**: Subscription management
- **Analytics Dashboard**: User behavior and business metrics
- **Email Automation**: Drip campaigns and transactional emails
- **Third-party Integrations**: Fitbit, Apple Health

## Setup

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
psql -U postgres -c "CREATE DATABASE legion_command_center;"
psql -U postgres -d legion_command_center -f database/schema.sql

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` or individual `DB_*` variables
- `JWT_SECRET` and `JWT_REFRESH_SECRET`
- `GEMINI_API_KEY` for AI features
- `STRIPE_SECRET_KEY` for payments (coming soon)
- `REDIS_HOST` for caching (optional)

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

#### Achievements
- `GET /achievements` - Get all achievements
- `GET /achievements/user/:userId` - Get user's achievements
- `POST /achievements/check` - Check and unlock achievements

#### Skills
- `GET /skills/trees` - Get all skill trees
- `GET /skills/user/:userId` - Get user's skill progress
- `POST /skills/unlock` - Unlock a skill node

#### Quests
- `GET /quests` - Get available quests
- `GET /quests/my-quests` - Get user's active quests
- `POST /quests/:questId/start` - Start a quest
- `PUT /quests/:questId/progress` - Update progress
- `POST /quests/:questId/complete` - Complete quest
- `DELETE /quests/:questId/abandon` - Abandon quest

#### Community
- `GET /community/guilds` - Get all guilds
- `POST /community/guilds` - Create guild
- `POST /community/guilds/:guildId/join` - Join guild
- `GET /community/posts` - Get forum posts
- `POST /community/posts` - Create post
- `POST /community/posts/:postId/like` - Like/unlike post
- `POST /community/posts/:postId/comments` - Add comment

#### Strategy (AI)
- `POST /strategy/generate` - Generate AI strategy
- `GET /strategy/workspaces` - Get workspaces
- `POST /strategy/workspaces` - Create workspace
- `GET /strategy/history` - Get session history

#### XP/Leveling
- `POST /users/xp/award` - Award XP
- `GET /users/xp/history` - Get XP history

## Real-time Features (Socket.IO)

Connect to Socket.IO with authentication:
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: '<your_jwt_token>'
  }
});

// Listen for messages
socket.on('new_message', (data) => {
  console.log('New message:', data);
});

// Send message
socket.emit('send_message', {
  recipientId: 'user-id',
  message: 'Hello!'
});
```

## Database Schema

Comprehensive PostgreSQL schema with:
- Users & authentication
- Gamification (achievements, skills, quests, habits)
- Community (guilds, posts, comments)
- Strategy sessions & workspaces
- Fitness tracking
- Payments & subscriptions
- Analytics & notifications

See `database/schema.sql` for complete schema.

## Architecture

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/             # Request handlers
│   ├── authController.js
│   ├── gamificationController.js
│   ├── questController.js
│   ├── communityController.js
│   └── strategyController.js
├── middleware/              # Express middleware
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Global error handling
│   └── socketAuth.js        # Socket.IO auth
├── models/                  # Database models
│   └── User.js
├── routes/                  # API routes
│   ├── auth.js
│   ├── achievements.js
│   ├── quests.js
│   ├── community.js
│   └── ...
├── services/               # Business logic
│   └── analyticsService.js
├── utils/                  # Utilities
│   └── logger.js           # Winston logger
├── database/
│   └── schema.sql          # PostgreSQL schema
├── server.js               # Express app entry point
└── package.json
```

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests (coming soon)
npm test

# Lint code
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use process manager (PM2 recommended)
3. Set up PostgreSQL database
4. Configure environment variables
5. Run migrations
6. Start server

```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "legion-api"
pm2 save
pm2 startup
```

## License

MIT

## Support

For issues and questions, contact the development team.
