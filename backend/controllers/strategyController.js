const axios = require('axios');
const { sequelize } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { trackEvent } = require('../services/analyticsService');
const { normalizeWorkspace, workspaceToMarkdown, streamWorkspacePdf } = require('../utils/exportFormatter');
const { validateStrategyResponse } = require('../utils/strategyValidation');
const Redis = require('redis');

// Initialize Redis for caching (optional)
let redisClient;
if (process.env.REDIS_HOST) {
  redisClient = Redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  });
}

// Gemini API schemas for each terminal type
const TERMINAL_SCHEMAS = {
  hero_class: {
    type: 'object',
    properties: {
      targetAudience: { type: 'string' },
      demographics: {
        type: 'object',
        properties: {
          ageRange: { type: 'string' },
          profession: { type: 'string' },
          lifestyle: { type: 'string' }
        }
      },
      painPoints: {
        type: 'array',
        items: { type: 'string' }
      },
      aspirations: {
        type: 'array',
        items: { type: 'string' }
      },
      psychographics: { type: 'string' },
      recommendations: { type: 'string' }
    },
    required: ['targetAudience', 'painPoints', 'aspirations']
  },

  loot_table: {
    type: 'object',
    properties: {
      freeRelic: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          deliveryFormat: { type: 'string' },
          price: { type: 'number' }
        }
      },
      potion: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' }
        }
      },
      coreQuest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'string' },
          price: { type: 'number' }
        }
      },
      raid: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'string' },
          price: { type: 'number' }
        }
      },
      recommendations: { type: 'string' }
    }
  },

  propaganda: {
    type: 'object',
    properties: {
      originMyth: { type: 'string' },
      coreValues: {
        type: 'array',
        items: { type: 'string' }
      },
      enemyIdentity: { type: 'string' },
      heroJourney: { type: 'string' },
      battleCry: { type: 'string' },
      messaging: { type: 'string' }
    }
  },

  threat_analysis: {
    type: 'object',
    properties: {
      competitors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            strengths: {
              type: 'array',
              items: { type: 'string' }
            },
            weaknesses: {
              type: 'array',
              items: { type: 'string' }
            },
            pricing: { type: 'string' },
            positioning: { type: 'string' }
          }
        }
      },
      marketGaps: {
        type: 'array',
        items: { type: 'string' }
      },
      differentiationStrategy: { type: 'string' },
      recommendations: { type: 'string' }
    }
  },

  mission_logs: {
    type: 'object',
    properties: {
      weeklyObjective: { type: 'string' },
      mainQuests: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string' },
            estimatedTime: { type: 'string' }
          }
        }
      },
      sideQuests: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' }
          }
        }
      },
      metrics: {
        type: 'array',
        items: { type: 'string' }
      },
      reflection: { type: 'string' }
    }
  },

  guild_charter: {
    type: 'object',
    properties: {
      missionStatement: { type: 'string' },
      coreValues: {
        type: 'array',
        items: { type: 'string' }
      },
      communityRules: {
        type: 'array',
        items: { type: 'string' }
      },
      onboardingRituals: {
        type: 'array',
        items: { type: 'string' }
      },
      engagementStrategies: {
        type: 'array',
        items: { type: 'string' }
      },
      recommendations: { type: 'string' }
    }
  },

  scriptorium: {
    type: 'object',
    properties: {
      contentPiece: { type: 'string' },
      headline: { type: 'string' },
      hook: { type: 'string' },
      keyPoints: {
        type: 'array',
        items: { type: 'string' }
      },
      callToAction: { type: 'string' },
      additionalVariations: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  }
};

/**
 * Call Gemini API with context-aware prompts
 */
async function callGeminiAPI(prompt, schema, context = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-pro';

  if (!apiKey) {
    throw new AppError('Gemini API key not configured', 500, 'API_NOT_CONFIGURED');
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [
          ...context.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          })),
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.7,
          topK: 40,
          topP: 0.95
        }
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.candidates || response.data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const textResponse = response.data.candidates[0].content.parts[0].text;
    return JSON.parse(textResponse);
  } catch (error) {
    logger.error('Gemini API error:', error.response?.data || error.message);
    throw new AppError('AI generation failed', 500, 'AI_ERROR');
  }
}

/**
 * Build context-aware prompt
 */
function buildContextualPrompt(terminalType, userInput, previousSessions) {
  const basePrompts = {
    hero_class: `You are a strategic business consultant helping define the ideal customer avatar for a fitness coaching business.
The coach is transitioning from MLM (Beachbody) to building an independent brand targeting the "fitness for gamers and nerds" niche.

Based on the user's input and previous context, provide a detailed customer avatar analysis with demographics, pain points, aspirations, and psychographics.`,

    loot_table: `You are a pricing strategist helping design a value ladder for a fitness coaching business.
Create a comprehensive offering structure with:
- Free Relic (Lead Magnet)
- Potion ($27 tripwire)
- Core Quest ($497 group program)
- Raid ($2000+ high-ticket 1-on-1)

Each tier should have a gamified name, clear value proposition, and strategic pricing.`,

    propaganda: `You are a brand storytelling expert helping create a compelling brand narrative for a fitness coaching business.
Design an origin myth, core values, enemy identity (excuses, laziness, mediocrity), and hero journey that resonates with gamers and nerds.`,

    threat_analysis: `You are a competitive intelligence analyst helping identify market opportunities in the fitness coaching space.
Analyze competitors, identify market gaps, and recommend differentiation strategies specifically for the "fitness for gamers" niche.`,

    mission_logs: `You are a productivity coach generating weekly action plans for a fitness entrepreneur.
Create specific, actionable quests (tasks) organized by priority with time estimates and success metrics.`,

    guild_charter: `You are a community architect designing a culture framework for an online fitness community.
Create a mission statement, core values, community rules, onboarding rituals, and engagement strategies that foster belonging and motivation.`,

    scriptorium: `You are a copywriting expert creating persuasive fitness content.
Generate compelling content pieces with strong hooks, clear key points, and powerful calls-to-action.
Adapt the tone to resonate with gamers and nerds (references to gaming, anime, tech culture).`
  };

  let contextSummary = '';
  if (previousSessions.length > 0) {
    contextSummary = `\n\nPREVIOUS CONTEXT:\nThe user has previously worked on: ${previousSessions.map(s => s.terminal_type).join(', ')}.\n`;
    const recentInputs = previousSessions.slice(0, 3).map(s => `${s.terminal_type}: ${JSON.stringify(s.user_input)}`).join('\n');
    contextSummary += `Recent inputs:\n${recentInputs}\n`;
  }

  return `${basePrompts[terminalType]}${contextSummary}\n\nUSER INPUT:\n${JSON.stringify(userInput)}`;
}

function buildOfflineAnalysis(targetAvatar = '', transformationGoals = '', uniqueMethod = '') {
  return `STRATEGIC ANALYSIS // FALLBACK MODE

TARGET AVATAR PROFILE:
${targetAvatar || 'Not provided'}

TRANSFORMATION MISSION:
${transformationGoals || 'Not provided'}

TACTICAL ADVANTAGE:
${uniqueMethod || 'Not provided'}

===[ STRATEGIC RECOMMENDATIONS ]===

PHASE 1: FOUNDATION (Days 1-30)
├─ Establish core brand identity around gamified fitness
├─ Create free lead magnet (PDF guide or assessment tool)
├─ Set up basic communication channel (email + community)
└─ Define 3-tier offering structure

PHASE 2: INITIAL DEPLOYMENT (Days 31-60)
├─ Launch beta cohort with founding members
├─ Implement gamification mechanics (XP, levels, quests)
├─ Develop signature transformation protocol
└─ Gather testimonials and case studies

PHASE 3: SCALE OPERATIONS (Days 61-90)
├─ Refine offering based on beta feedback
├─ Implement automated onboarding sequences
├─ Build community engagement systems
└─ Establish consistent content rhythm

MONETIZATION FRAMEWORK:
├─ FREE: Lead magnet + assessment
├─ TIER 1: Self-guided program ($47-97)
├─ TIER 2: Group coaching ($197-497/mo)
└─ TIER 3: 1-on-1 elite coaching ($997+/mo)

CLIENT ACQUISITION TACTICS:
- Content marketing targeting pain points
- Gamification hooks in marketing (level up, boss battles)
- Community-driven referral mechanics
- Strategic partnerships with complementary services

NEXT IMMEDIATE ACTIONS:
1. Create detailed avatar interview questions
2. Design your free offering (week 1)
3. Map out your signature transformation journey
4. Set up basic tech stack (email, payment, community)
5. Recruit 5 beta testers for validation

===[ END STRATEGIC ANALYSIS ]===`;
}

/**
 * @desc    Generate AI strategy response
 * @route   POST /api/v1/strategy/generate
 * @access  Private
 */
exports.generateStrategy = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { terminalType, userInput, workspaceId } = req.body;

    if (!terminalType || !TERMINAL_SCHEMAS[terminalType]) {
      throw new AppError('Invalid terminal type', 400, 'INVALID_TERMINAL');
    }

    if (!userInput) {
      throw new AppError('User input required', 400, 'MISSING_INPUT');
    }

    const startTime = Date.now();

    // Get previous sessions for context
    const [previousSessions] = await sequelize.query(`
      SELECT terminal_type, user_input, ai_response
      FROM strategy_sessions
      WHERE user_id = :userId
      ORDER BY created_at DESC
      LIMIT 10
    `, {
      replacements: { userId }
    });

    // Build context-aware prompt
    const prompt = buildContextualPrompt(terminalType, userInput, previousSessions);
    const schema = TERMINAL_SCHEMAS[terminalType];

    // Check cache (if Redis is available)
    const cacheKey = `strategy:${terminalType}:${JSON.stringify(userInput)}`;
    let aiResponse;
    let wasCached = false;

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        aiResponse = JSON.parse(cached);
        wasCached = true;
      }
    }

    if (!aiResponse) {
      // Call Gemini API
      const context = previousSessions.slice(0, 3).map(s => ({
        role: 'user',
        content: `Previous ${s.terminal_type} input: ${JSON.stringify(s.user_input)}`
      }));

      aiResponse = await callGeminiAPI(prompt, schema, context);

      // Cache response
      if (redisClient) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(aiResponse)); // 1 hour cache
      }
    }

    const responseTime = Date.now() - startTime;

    // Validate AI response for actionability before persisting
    const validation = validateStrategyResponse(terminalType, aiResponse);
    if (!validation.isValid) {
      logger.warn('AI response validation failed', {
        terminalType,
        issues: validation.issues
      });
      throw new AppError(`AI response incomplete: ${validation.issues.join('; ')}`, 502, 'AI_RESPONSE_INVALID');
    }

    // Save session
    await sequelize.query(`
      INSERT INTO strategy_sessions (user_id, terminal_type, user_input, ai_response, prompt_used, response_time_ms, was_cached)
      VALUES (:userId, :terminalType, :userInput, :aiResponse, :prompt, :responseTime, :wasCached)
    `, {
      replacements: {
        userId,
        terminalType,
        userInput: JSON.stringify(userInput),
        aiResponse: JSON.stringify(aiResponse),
        prompt,
        responseTime,
        wasCached
      }
    });

    // Update workspace if provided
    if (workspaceId) {
      await sequelize.query(`
        UPDATE strategy_workspaces
        SET data = jsonb_set(
          COALESCE(data, '{}'::jsonb),
          '{${terminalType}}',
          :aiResponse::jsonb
        ),
        updated_at = NOW()
        WHERE id = :workspaceId AND user_id = :userId
      `, {
        replacements: {
          workspaceId,
          userId,
          terminalType,
          aiResponse: JSON.stringify(aiResponse)
        }
      });
    }

    // Award XP for using strategy tools
    await sequelize.query(`
      UPDATE users
      SET current_xp = current_xp + 10
      WHERE id = :userId
    `, {
      replacements: { userId }
    });

    // Track event
    await trackEvent({
      userId,
      eventType: 'strategy_generated',
      properties: {
        terminalType,
        responseTime,
        wasCached
      }
    });

    res.json({
      success: true,
      data: {
        response: aiResponse,
        metadata: {
          terminalType,
          responseTime,
          wasCached
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's strategy workspaces
 * @route   GET /api/v1/strategy/workspaces
 * @access  Private
 */
exports.getWorkspaces = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [workspaces] = await sequelize.query(`
      SELECT * FROM strategy_workspaces
      WHERE user_id = :userId AND is_active = TRUE
      ORDER BY updated_at DESC
    `, {
      replacements: { userId }
    });

    res.json({
      success: true,
      data: { workspaces }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new workspace
 * @route   POST /api/v1/strategy/workspaces
 * @access  Private
 */
exports.createWorkspace = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, terminalType } = req.body;

    const [result] = await sequelize.query(`
      INSERT INTO strategy_workspaces (user_id, name, terminal_type, data)
      VALUES (:userId, :name, :terminalType, '{}'::jsonb)
      RETURNING *
    `, {
      replacements: {
        userId,
        name: name || 'Untitled Strategy',
        terminalType
      }
    });

    res.status(201).json({
      success: true,
      data: { workspace: result[0] }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get session history
 * @route   GET /api/v1/strategy/history
 * @access  Private
 */
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { terminalType, limit = 50 } = req.query;

    let query = `
      SELECT * FROM strategy_sessions
      WHERE user_id = :userId
    `;

    const replacements = { userId, limit: parseInt(limit) };

    if (terminalType) {
      query += ' AND terminal_type = :terminalType';
      replacements.terminalType = terminalType;
    }

    query += ' ORDER BY created_at DESC LIMIT :limit';

    const [sessions] = await sequelize.query(query, { replacements });

    res.json({
      success: true,
      count: sessions.length,
      data: { sessions }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export a workspace in JSON, Markdown, or PDF format
 * @route   GET /api/v1/strategy/workspaces/:id/export
 * @access  Private
 */
exports.exportWorkspace = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const format = (req.query.format || 'json').toLowerCase();

    const [rows] = await sequelize.query(`
      SELECT *
      FROM strategy_workspaces
      WHERE id = :id AND user_id = :userId AND is_active = TRUE
      LIMIT 1
    `, {
      replacements: { id, userId }
    });

    if (!rows || rows.length === 0) {
      throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
    }

    const workspace = normalizeWorkspace(rows[0]);
    const exportPayload = {
      ...workspace,
      exported_at: new Date().toISOString()
    };

    if (format === 'markdown' || format === 'md') {
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename=workspace-${workspace.id}.md`);
      return res.send(workspaceToMarkdown(exportPayload));
    }

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=workspace-${workspace.id}.pdf`);
      streamWorkspacePdf(exportPayload, res);
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename=workspace-${workspace.id}.json`);
    return res.json({
      success: true,
      data: { workspace: exportPayload }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Render minimal HTML form for offline analysis (no JS required)
 * @route   GET /api/v1/strategy/offline
 * @access  Public (optional auth)
 */
exports.offlineForm = (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LEGION // Offline Strategy Forge</title>
    <style>
      body { font-family: Arial, sans-serif; background: #0b0f12; color: #e2f1f5; padding: 24px; }
      h1 { color: #4fe3ff; letter-spacing: 0.08em; }
      label { display: block; margin-top: 12px; font-weight: bold; }
      textarea { width: 100%; min-height: 120px; margin-top: 6px; padding: 10px; background: #111922; color: #e2f1f5; border: 1px solid #284b63; }
      button { margin-top: 16px; background: #4fe3ff; color: #0b0f12; border: none; padding: 12px 18px; font-weight: bold; cursor: pointer; }
      .hint { font-size: 0.9rem; color: #a5b8c4; margin-top: 8px; }
    </style>
  </head>
  <body>
    <h1>LEGION // Offline Strategy Forge</h1>
    <p class="hint">JavaScript-free mode. Submit this form to receive a plain-text strategy brief.</p>
    <form method="post" action="/api/${process.env.API_VERSION || 'v1'}/strategy/offline">
      <label for="targetAvatar">Target Avatar</label>
      <textarea id="targetAvatar" name="targetAvatar" required placeholder="Describe your ideal client..."></textarea>

      <label for="transformationGoals">Transformation Objectives</label>
      <textarea id="transformationGoals" name="transformationGoals" required placeholder="What transformation will you guide them through?"></textarea>

      <label for="uniqueMethod">Unique Methodology</label>
      <textarea id="uniqueMethod" name="uniqueMethod" placeholder="What makes your approach different?"></textarea>

      <button type="submit">Generate Offline Brief</button>
    </form>
  </body>
  </html>`);
};

/**
 * @desc    Generate a server-side fallback analysis without JS or Gemini
 * @route   POST /api/v1/strategy/offline
 * @access  Public (optional auth)
 */
exports.offlineAnalysis = async (req, res, next) => {
  try {
    const targetAvatar = req.body.targetAvatar || '';
    const transformationGoals = req.body.transformationGoals || '';
    const uniqueMethod = req.body.uniqueMethod || '';

    const analysis = buildOfflineAnalysis(targetAvatar, transformationGoals, uniqueMethod);
    const payload = {
      mode: 'offline_fallback',
      targetAvatar,
      transformationGoals,
      uniqueMethod,
      analysis,
      generated_at: new Date().toISOString()
    };

    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('application/json')) {
      return res.json({ success: true, data: payload });
    }

    res.type('text/plain').send(analysis);
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
