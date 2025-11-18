# Legion Command Center - Gamified Fitness Coaching Platform

A comprehensive gamified fitness coaching platform combining document analysis, backend API, and interactive web applications.

## Overview

This repository contains a full-stack fitness coaching platform with:

### Backend API
- **50+ REST API endpoints** for authentication, gamification, community, and more
- **PostgreSQL database** with 30+ tables and comprehensive schema
- **Real-time features** with Socket.IO (chat, notifications)
- **AI strategy tools** powered by Gemini API
- **Payment integration** with Stripe
- **Analytics & tracking** for user behavior and platform metrics

### Frontend Applications
- **Legion Command Center**: Gamified coaching dashboard with 7 strategy terminals
- **Client Portal**: User-facing gamified fitness application
- **Index Page**: Project overview and navigation

### Document Analysis System
- **Document Ingestion**: Reads and analyzes Word documents (.docx)
- **Content Extraction**: Extracts key topics and generates summaries
- **Path Suggestion**: Recommends development paths based on content analysis
- **Caching**: File hash-based caching for performance optimization

## Requirements

### Backend
- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis (optional, for caching)

### Document Analysis
- Python 3.11+
- python-docx library

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ivi374forivi/gamified-coach-interface.git
cd gamified-coach-interface
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration (database, API keys, etc.)

# Set up PostgreSQL database
psql -U postgres -c "CREATE DATABASE legion_command_center;"
psql -U postgres -d legion_command_center -f database/schema.sql
psql -U postgres -d legion_command_center -f database/seed.sql

# Start development server
npm run dev

# Or start production server
npm start
```

### 3. Document Analysis Setup
```bash
# From project root
pip install -r requirements.txt

# Run the document analyzer
python3 analyze_docs.py
```

## Usage

### Backend API
The backend server runs on `http://localhost:3000` (configurable via PORT env variable).

API endpoints include:
- `/api/v1/auth/*` - Authentication (register, login, refresh)
- `/api/v1/users/*` - User management and XP
- `/api/v1/achievements/*` - Achievement tracking
- `/api/v1/quests/*` - Quest management
- `/api/v1/skills/*` - Skill tree progression
- `/api/v1/community/*` - Guilds, posts, comments
- `/api/v1/strategy/*` - AI strategy generation
- `/api/v1/fitness/*` - Workout and nutrition tracking
- `/api/v1/payments/*` - Subscription management
- `/api/v1/analytics/*` - Platform analytics

See `/backend/README.md` and `FRONTEND_INTEGRATION.md` for complete API documentation.

### Frontend Applications
Open the HTML files directly in a web browser:
- `legion-command-center-evolved.html` - Coach dashboard
- `client.html` - Client portal
- `index.html` - Project overview

### Document Analysis
The analyzer scans for `.docx` files and:
1. Ingests and parses each document
2. Extracts key topics and statistics
3. Categorizes content (fitness, business, gamification)
4. Suggests development paths based on analysis

## Features

### Gamification System
- **XP & Leveling**: Dynamic XP system with exponential level progression
- **Achievements**: 15+ unlockable achievements with progress tracking
- **Skill Trees**: 6 RPG-style skill trees (Strength, Endurance, Nutrition, Mindset, Charisma, Wisdom)
- **Quests**: Main quests, side quests, daily/weekly challenges, boss battles
- **Habits**: Habit tracking with streak management and rewards

### Community Features
- **Guilds**: Create and join communities with member management
- **Forum**: Posts, comments, likes with nested replies
- **Real-time Chat**: Socket.IO integration for DMs and guild chat
- **Leaderboards**: XP, level, streak, and activity-based rankings

### AI Strategy Tools (Gemini Integration)
- **7 Strategy Terminals**:
  1. Hero Class - Customer avatar definition
  2. Loot Table - Monetization/value ladder
  3. Propaganda - Brand narrative
  4. Threat Analysis - Competitor research
  5. Mission Logs - Weekly planning
  6. Guild Charter - Community design
  7. Scriptorium - Content generation
- **Context-Aware AI**: Multi-turn conversations with session history
- **Workspace Management**: Save and organize strategy sessions

### Business Features
- **Stripe Integration**: Subscription and payment management
- **Multi-tier Access**: Free, Potion, Core Quest, Raid, Mastermind tiers
- **Analytics Dashboard**: User behavior and business metrics
- **Email Automation**: Transactional and drip campaigns

### Code Quality & Optimization
- **Linting**: ESLint, Prettier, Pylint configurations
- **Performance**: Memory leak fixes, event delegation, caching
- **Repository Hygiene**: Optimized .gitignore, removed large binaries

See `OPTIMIZATIONS.md` for detailed performance improvements and `backend/README.md` for complete backend documentation.

## Project Structure

```
gamified-coach-interface/
├── backend/                           # Node.js backend API
│   ├── config/                       # Database configuration
│   ├── controllers/                  # Business logic
│   ├── database/                     # SQL schema and seed data
│   ├── middleware/                   # Auth, error handling
│   ├── models/                       # Data models
│   ├── routes/                       # API routes (12 route files)
│   ├── services/                     # Business services
│   ├── utils/                        # Logger, helpers
│   ├── server.js                     # Express app entry point
│   ├── package.json                  # Dependencies
│   └── README.md                     # Backend documentation
├── .editorconfig                     # Editor configuration
├── .eslintrc.json                    # ESLint rules
├── .prettierrc                       # Code formatting
├── .pylintrc                         # Python linting
├── .gitignore                        # Git ignore rules
├── analyze_docs.py                   # Document analysis tool
├── client.html                       # Client portal
├── index.html                        # Project overview
├── legion-command-center-evolved.html # Coach dashboard
├── requirements.txt                  # Python dependencies
├── FRONTEND_INTEGRATION.md           # Frontend integration guide
├── OPTIMIZATIONS.md                  # Performance optimizations
└── README.md                         # This file
```

## Development

### Code Quality
The project includes linting and formatting tools:

```bash
# Python linting
pylint analyze_docs.py

# JavaScript linting (in backend/)
npm run lint

# Code formatting
npx prettier --write "**/*.{js,json,md}"
```

### Testing
```bash
# Backend tests
cd backend
npm test
```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and tests
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - See repository for details.

## Documentation

### Core Philosophy
- **`NORTH_STAR.md`** - 🌟 Core guiding principles and logical framework (START HERE)
- **`LOGIC_ARCHITECTURE.md`** - 🏛️ Logical design patterns and decision-making framework
- **`LOGIC_AUDIT.md`** - 🔍 Compliance audit against North Star principles

### Technical Documentation
- `/backend/README.md` - Complete backend API documentation
- `FRONTEND_INTEGRATION.md` - Frontend integration guide with code examples
- `OPTIMIZATIONS.md` - Performance optimization details
- `legion-cc-v3-design-spec.md` - Design specifications

## Contact

For questions or suggestions, please open an issue in the repository.
