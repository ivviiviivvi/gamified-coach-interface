# Logical Architecture: Design Patterns & Principles

**Legion Command Center Platform**

*"Every line of code is a logical proof. Every function is a theorem. Every system is an argument."*

---

## Purpose

This document defines the **logical architecture** of the platform - the formal reasoning patterns that govern how components interact, how data flows, and how decisions are made within the system.

Unlike technical architecture (which describes *what* exists), logical architecture describes *why* things exist and *how* they should behave according to first principles.

---

## Core Logical Layers

### Layer 1: Domain Logic (The "Why")

**Purpose:** Encode business rules as mathematical invariants

**Principle:** Game mechanics are deterministic functions, not arbitrary rules.

**Example:**
```javascript
// WRONG: Arbitrary XP award
function awardXP(user, amount) {
  user.xp += amount; // Why this amount? When does leveling happen?
}

// RIGHT: Deterministic XP award with explicit leveling logic
function awardXP(user, amount, reason) {
  const result = {
    before: { level: user.level, xp: user.xp },
    award: { amount, reason },
    after: null
  };

  user.xp += amount;

  // Leveling is a pure function: f(xp) -> level
  while (user.xp >= calculateXPForLevel(user.level + 1)) {
    user.level++;
    result.leveledUp = true;
  }

  result.after = { level: user.level, xp: user.xp };
  return result; // Audit trail of state transformation
}
```

**Invariants to Maintain:**
1. **XP is monotonic:** User XP never decreases (except explicit resets)
2. **Levels are earned:** Level N implies XP >= threshold(N)
3. **Achievements unlock once:** Cannot un-unlock an achievement
4. **Quest progress is additive:** Progress only increases or completes

---

### Layer 2: Access Control Logic (The "Who")

**Purpose:** Encode permissions as composable predicates

**Principle:** Access is granted by proof, not by checking attributes.

**Pattern:**
```javascript
// WRONG: Implicit permission checking
function deletePost(user, post) {
  if (user.role === 'admin' || post.author_id === user.id) {
    // delete
  }
}

// RIGHT: Explicit permission predicates
const Permissions = {
  canDelete: (user, post) =>
    user.role === 'admin' ||
    user.role === 'founder' ||
    (post.author_id === user.id && user.status === 'active'),

  canEditOthersContent: (user) =>
    ['admin', 'founder'].includes(user.role),

  canAccessTier: (user, tier) => {
    const tierHierarchy = {
      free: 0,
      potion: 1,
      core_quest: 2,
      raid: 3,
      mastermind: 4
    };
    return tierHierarchy[user.subscription_tier] >= tierHierarchy[tier];
  }
};

// Usage
function deletePost(user, post) {
  if (!Permissions.canDelete(user, post)) {
    throw new ForbiddenError('Insufficient permissions');
  }
  // delete
}
```

**Access Control Axioms:**
1. **Deny by default:** Explicit grant required for every action
2. **Composable rules:** Permissions combine via AND/OR logic
3. **Audit-friendly:** Every permission check is a named predicate
4. **Role hierarchy:** Higher roles inherit lower role permissions

---

### Layer 3: Data Transformation Logic (The "How")

**Purpose:** Encode data flows as pure transformations

**Principle:** State changes are explicit, traceable, and reversible.

**Pattern:**
```javascript
// WRONG: Mutation without trace
async function completeQuest(userId, questId) {
  await db.query('UPDATE user_quests SET status = "completed" WHERE ...');
  await db.query('UPDATE users SET xp = xp + 500 WHERE ...');
}

// RIGHT: Event-sourced transformation
async function completeQuest(userId, questId) {
  const quest = await db.findQuest(questId);
  const user = await db.findUser(userId);

  // Validate preconditions (logical gates)
  assert(quest.status === 'active', 'Quest must be active');
  assert(quest.progress >= quest.required, 'Quest not complete');

  // Build event (immutable record of what happened)
  const event = {
    type: 'QUEST_COMPLETED',
    userId,
    questId,
    timestamp: new Date(),
    effects: {
      xpAwarded: quest.xp_reward,
      achievementsUnlocked: []
    }
  };

  // Apply effects (pure functions)
  const updatedUser = applyXP(user, quest.xp_reward);

  // Check achievement unlocks (side effect of completion)
  const newAchievements = await checkAchievements(updatedUser);
  event.effects.achievementsUnlocked = newAchievements;

  // Persist atomically
  await db.transaction(async (trx) => {
    await trx.saveEvent(event);
    await trx.updateUser(updatedUser);
    await trx.updateQuest({ id: questId, status: 'completed' });
    await trx.unlockAchievements(newAchievements);
  });

  return event; // Return immutable proof of transformation
}
```

**Transformation Axioms:**
1. **Explicit effects:** Every state change documented in event
2. **Atomic updates:** All-or-nothing persistence (database transactions)
3. **Traceable history:** Events are append-only audit log
4. **Idempotent operations:** Repeating same input yields same output

---

### Layer 4: AI Integration Logic (The "What")

**Purpose:** Encode AI interactions as validated, structured exchanges

**Principle:** AI is a black box. Wrap it in white box guarantees.

**Pattern:**
```javascript
// WRONG: Unvalidated AI response
async function generateStrategy(userInput) {
  const response = await geminiAPI.generate(userInput);
  return response; // What if it's gibberish? Malicious? Non-actionable?
}

// RIGHT: Validated, structured AI pipeline
async function generateStrategy(terminalType, userInput, userId) {
  // 1. Build deterministic prompt (same input = same prompt)
  const prompt = buildPrompt(terminalType, userInput, userId);

  // 2. Call AI with schema enforcement
  const schema = TERMINAL_SCHEMAS[terminalType];
  const response = await geminiAPI.generate(prompt, { schema });

  // 3. Validate response structure
  if (!validateSchema(response, schema)) {
    throw new AIValidationError('Response does not match schema');
  }

  // 4. Validate actionability (logical requirement)
  if (!isActionable(response)) {
    throw new AIValidationError('Response lacks actionable content');
  }

  // 5. Log for audit
  await logAIInteraction({
    userId,
    terminalType,
    prompt,
    response,
    tokensUsed: response.usage.totalTokens,
    timestamp: new Date()
  });

  // 6. Return validated, structured data
  return {
    terminal: terminalType,
    strategy: response.data,
    metadata: {
      generated: new Date(),
      version: '1.0',
      model: 'gemini-pro'
    }
  };
}

function isActionable(response) {
  // North Star Principle 2: AI must provide decisions, not just information
  const actionPatterns = [
    /\[\s*\]/,      // Checkboxes
    /^\d+\./m,      // Numbered lists
    /^[-*•]/m,      // Bullet points
    /\bstep\s+\d+/i, // Step-by-step instructions
    /\baction\s*:/i, // Explicit action items
    /\btodo\b/i     // TODO markers
  ];

  const text = JSON.stringify(response);
  return actionPatterns.some(pattern => pattern.test(text));
}
```

**AI Integration Axioms:**
1. **Deterministic prompts:** Same input → same prompt → reproducible outputs
2. **Schema validation:** Outputs must conform to predefined structure
3. **Actionability validation:** Outputs must contain executable guidance
4. **Audit logging:** Every AI call recorded for compliance and debugging
5. **Graceful degradation:** AI failures don't crash user workflows

---

### Layer 5: Progressive Enhancement Logic (The "When")

**Purpose:** Encode capability detection and graceful degradation

**Principle:** Features are additive layers, not dependencies.

**Pattern:**
```javascript
// WRONG: Assume JavaScript
<button onclick="submitForm()">Submit</button>

// RIGHT: Progressive enhancement
<form method="POST" action="/api/workspaces">
  <input type="text" name="name" required>
  <button type="submit">Create Workspace</button>
</form>

<script>
  // Enhancement: AJAX submission
  document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      // Enhanced experience: no page reload
      updateUIWithNewWorkspace(await response.json());
    }
  });
</script>
```

**Backend Pattern:**
```javascript
// Dual endpoint pattern
router.post('/api/workspaces', authenticate, createWorkspaceAPI); // JSON response
router.post('/workspaces', authenticate, createWorkspaceWeb);     // HTML redirect

function createWorkspaceAPI(req, res) {
  const workspace = await service.createWorkspace(req.body);
  res.json({ success: true, data: workspace });
}

function createWorkspaceWeb(req, res) {
  const workspace = await service.createWorkspace(req.body);
  res.redirect(`/workspaces/${workspace.id}`); // Server-rendered page
}
```

**Enhancement Layers:**
```
Layer 0 (Core):       HTML forms → Server endpoints → HTML responses
Layer 1 (Enhanced):   JavaScript → Fetch API → JSON → Client rendering
Layer 2 (Optimized):  Service Workers → Cache → Offline support
Layer 3 (Immersive):  WebSockets → Real-time updates → Animations
Layer 4 (Luxury):     WebGL/Three.js → 3D graphics → Haptics
```

**Degradation Axioms:**
1. **Core works without JS:** Basic functionality via forms and server rendering
2. **Enhanced works without WebGL:** Advanced features use 2D fallbacks
3. **Detect before using:** Check for capability before applying enhancement
4. **Fail gracefully:** Missing features degrade, don't break

---

## Decision Logic Patterns

### Pattern 1: Feature Gating

**Question:** Should we add feature X?

**Logic:**
```
IF feature does not advance hero journey (North Star Principle 1)
  THEN reject

ELSE IF feature requires restriction to monetize (violates Principle 6)
  THEN reject

ELSE IF feature cannot work solo (violates Principle 5)
  THEN reject

ELSE IF feature requires JavaScript to function (violates Principle 4)
  THEN redesign for progressive enhancement

ELSE IF feature lacks export capability (violates Principle 3)
  THEN add export before implementing

ELSE IF feature is not testable (violates Principle 7)
  THEN reject or redesign

ELSE
  implement
END
```

### Pattern 2: Tier Enforcement

**Question:** Can user U perform action A?

**Logic:**
```
DEFINE action_requirements AS {
  'create_workspace': 'free',
  'unlimited_ai_calls': 'core_quest',
  'automation': 'raid',
  'white_label': 'mastermind'
}

FUNCTION canPerform(user, action):
  required_tier = action_requirements[action]
  IF user.subscription_tier >= required_tier
    RETURN true
  ELSE
    RETURN {
      allowed: false,
      reason: `Requires ${required_tier} tier`,
      upsell: getTierUpgradeURL(user.tier, required_tier)
    }
  END
END
```

### Pattern 3: Gamification Triggers

**Question:** When should we award XP/achievements?

**Logic:**
```
EVENTS = [
  'user.login',
  'quest.completed',
  'workout.logged',
  'comment.posted',
  'streak.continued',
  'skill.unlocked'
]

FOR each event IN EVENTS:
  ON event TRIGGER:
    1. Calculate XP award based on difficulty
    2. Apply guild multiplier if applicable
    3. Update user.total_xp and user.current_xp
    4. Check for level-up
    5. Check for achievement unlocks
    6. Persist all changes atomically
    7. Emit notifications for unlocks
  END
END
```

---

## Data Flow Diagrams (Logical)

### Flow 1: User Action → Gamification → Persistence

```
User Action (login, complete quest, etc.)
  ↓
[Validate Preconditions]
  ↓ (if valid)
[Calculate XP Reward] → deterministic function f(action, context)
  ↓
[Apply Guild Bonus] → IF user.guild_id THEN xp *= 1.5
  ↓
[Update User State] → user.total_xp += xp
  ↓
[Check Level-Up] → WHILE user.xp >= threshold(level+1) DO level++
  ↓
[Check Achievements] → FOR each achievement WHERE requirements_met
  ↓
[Create Event Record] → Immutable audit log
  ↓
[Atomic Persist] → BEGIN TRANSACTION ... COMMIT
  ↓
[Emit Notifications] → WebSocket broadcast to user
  ↓
[Return Result] → { xpAwarded, leveledUp, achievementsUnlocked }
```

### Flow 2: AI Strategy Generation → Validation → Workspace Save

```
User Input (terminal, query)
  ↓
[Check Tier Limits] → free: 1/day, paid: unlimited
  ↓ (if allowed)
[Build Prompt] → f(terminal_type, user_input, user_context)
  ↓
[Call Gemini API] → with schema enforcement
  ↓
[Validate Schema] → response matches TERMINAL_SCHEMAS[type]
  ↓ (if valid)
[Validate Actionability] → contains checklists/steps/decisions
  ↓ (if actionable)
[Log AI Session] → audit table with tokens, cost, response time
  ↓
[Save to Workspace] → IF user requested save
  ↓
[Cache Response] → Redis with TTL (optional)
  ↓
[Award XP] → +10 XP for strategic session
  ↓
[Return Structured Data] → { terminal, strategy, metadata }
```

### Flow 3: Data Export → Format Conversion → User Download

```
User Request (/export?format=json|md|pdf)
  ↓
[Authenticate & Authorize] → validate JWT, check ownership
  ↓
[Gather Data] → SELECT workspaces, sessions, responses WHERE user_id
  ↓
[Build Export Object] → {
    user: { id, email, stats },
    workspaces: [...],
    sessions: [...],
    exportedAt: timestamp
  }
  ↓
[Convert to Format]
  ├─→ JSON: JSON.stringify(exportObj)
  ├─→ Markdown: convertToMarkdown(exportObj)
  └─→ PDF: generatePDF(exportObj)
  ↓
[Set Headers] → Content-Type, Content-Disposition: attachment
  ↓
[Stream Response] → Send file to user
  ↓
[Log Export Event] → Audit table (GDPR compliance)
```

---

## Error Handling Logic

### Principle: Errors are values, not exceptions

**Pattern:**
```javascript
// WRONG: Silent failures or generic errors
try {
  await doSomething();
} catch (e) {
  console.error(e);
  return { error: 'Something went wrong' };
}

// RIGHT: Typed errors with logical categories
class DomainError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

class ValidationError extends DomainError {
  constructor(message, field) {
    super(message, 'VALIDATION_FAILED', { field });
  }
}

class PermissionError extends DomainError {
  constructor(action) {
    super(`Not authorized to ${action}`, 'FORBIDDEN', { action });
  }
}

class AIError extends DomainError {
  constructor(message, stage) {
    super(message, 'AI_GENERATION_FAILED', { stage });
  }
}

// Usage
if (!Permissions.canDelete(user, post)) {
  throw new PermissionError('delete post');
}

if (!isActionable(aiResponse)) {
  throw new AIError('Response lacks actionable content', 'validation');
}
```

**Error Response Logic:**
```javascript
function errorHandler(err, req, res, next) {
  // Categorize by error type
  if (err instanceof ValidationError) {
    return res.status(422).json({
      error: err.message,
      code: err.code,
      field: err.details.field
    });
  }

  if (err instanceof PermissionError) {
    return res.status(403).json({
      error: err.message,
      code: err.code,
      requiredPermission: err.details.action
    });
  }

  // Default: log and sanitize
  logger.error(err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    requestId: req.id
  });
}
```

---

## Testing Logic

### Principle: Tests are formal proofs of behavior

**Pattern:**
```javascript
// WRONG: Testing implementation details
test('awards XP', async () => {
  const user = { xp: 0 };
  awardXP(user, 100);
  expect(user.xp).toBe(100); // Fragile: breaks if internal structure changes
});

// RIGHT: Testing logical contracts
describe('XP Award Logic', () => {
  describe('INVARIANT: XP is monotonic', () => {
    test('GIVEN user with 50 XP WHEN awarded 100 XP THEN total is 150', () => {
      const user = createUser({ xp: 50 });
      const result = awardXP(user, 100, 'quest_completion');

      expect(result.after.xp).toBe(150);
      expect(result.after.xp).toBeGreaterThan(result.before.xp);
    });

    test('GIVEN user at level threshold WHEN awarded XP THEN levels up', () => {
      const user = createUser({ level: 1, xp: 95, xpToNext: 100 });
      const result = awardXP(user, 10, 'daily_login');

      expect(result.leveledUp).toBe(true);
      expect(result.after.level).toBe(2);
    });
  });

  describe('AXIOM: Actions have deterministic rewards', () => {
    test('Quest completion always awards quest.xp_reward', () => {
      const quest = { xp_reward: 500 };
      const user = createUser();

      const result = completeQuest(user, quest);

      expect(result.xpAwarded).toBe(quest.xp_reward);
    });
  });
});
```

---

## Conclusion

**Logical architecture is the skeleton that gives the codebase structural integrity.**

Technical code can be refactored, UI can be redesigned, but logical patterns persist because they encode the fundamental truths of the domain.

**Every function should be:**
- **Deterministic:** Same inputs → same outputs
- **Validatable:** Preconditions checked, postconditions guaranteed
- **Traceable:** Effects logged, state changes auditable
- **Composable:** Small, pure functions combine into complex behaviors

**When in doubt, ask:**
1. What is the logical invariant this function maintains?
2. What is the precondition that must be true before calling?
3. What is the postcondition guaranteed after execution?
4. Can I express this as a pure mathematical transformation?

*"Logic is the skeleton. Code is the muscle. Design is the skin. But logic determines whether the system can stand."*

---

End of Logical Architecture Document
