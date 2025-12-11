# Frontend Integration Guide

Complete guide for integrating the Legion Command Center frontend with the new backend API.

## Table of Contents
1. [Authentication](#authentication)
2. [Gamification Features](#gamification-features)
3. [Community Features](#community-features)
4. [AI Strategy Tools](#ai-strategy-tools)
5. [Real-time Features](#real-time-features)
6. [Code Examples](#code-examples)

---

## Authentication

### Registration & Login

Replace the existing mock authentication with real API calls:

```javascript
// Register new user
async function register(email, password, username) {
  const response = await fetch('http://localhost:5000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username })
  });

  const data = await response.json();

  if (data.success) {
    // Store token
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data.user;
  }

  throw new Error(data.message);
}

// Login
async function login(email, password) {
  const response = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data;
  }

  throw new Error(data.message);
}

// Get current user
async function getCurrentUser() {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:5000/api/v1/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  return data.data.user;
}
```

### Auth Helper Function

```javascript
// Helper to make authenticated requests
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Handle token expiration
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry request with new token
      return authenticatedFetch(url, options);
    } else {
      // Redirect to login
      window.location.href = '/login.html';
    }
  }

  return response.json();
}

async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  const response = await fetch('http://localhost:5000/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return true;
  }

  return false;
}
```

---

## Gamification Features

### Display User Stats

Update the dashboard to show real user stats:

```javascript
async function loadUserStats() {
  const user = await getCurrentUser();

  // Update UI
  document.getElementById('user-level').textContent = user.level;
  document.getElementById('user-title').textContent = user.title;
  document.getElementById('user-xp').textContent = user.current_xp;
  document.getElementById('xp-to-next').textContent = user.xp_to_next_level;
  document.getElementById('login-streak').textContent = user.login_streak;

  // Update XP progress bar
  const progressPercentage = (user.current_xp / user.xp_to_next_level) * 100;
  document.getElementById('xp-progress-bar').style.width = `${progressPercentage}%`;
}
```

### Achievements System

```javascript
// Load and display achievements
async function loadAchievements() {
  const userId = JSON.parse(localStorage.getItem('user')).id;

  const data = await authenticatedFetch(
    `http://localhost:5000/api/v1/achievements/user/${userId}`
  );

  const achievementsContainer = document.getElementById('achievements-container');
  achievementsContainer.innerHTML = '';

  data.data.achievements.forEach(achievement => {
    const achievementElement = createAchievementCard(achievement);
    achievementsContainer.appendChild(achievementElement);
  });

  // Update stats
  document.getElementById('achievement-count').textContent =
    `${data.data.stats.completed} / ${data.data.stats.total}`;
}

function createAchievementCard(achievement) {
  const card = document.createElement('div');
  card.className = `achievement-card ${achievement.is_completed ? 'unlocked' : 'locked'}`;

  const rarity = achievement.rarity.toUpperCase();
  const rarityColor = {
    'COMMON': '#888888',
    'UNCOMMON': '#00FF00',
    'RARE': '#0080FF',
    'EPIC': '#FF00FF',
    'LEGENDARY': '#FFD700'
  }[rarity] || '#888888';

  card.innerHTML = `
    <div class="achievement-header" style="border-left: 4px solid ${rarityColor}">
      <span class="achievement-rarity" style="color: ${rarityColor}">${rarity}</span>
      <span class="achievement-name">${achievement.name}</span>
    </div>
    <p class="achievement-description">${achievement.description}</p>
    <div class="achievement-footer">
      <span class="achievement-xp">+${achievement.xp_reward} XP</span>
      ${achievement.is_completed ?
        `<span class="achievement-unlocked">✓ UNLOCKED ${new Date(achievement.unlocked_at).toLocaleDateString()}</span>` :
        `<span class="achievement-locked">🔒 LOCKED</span>`
      }
    </div>
  `;

  return card;
}

// Check for new achievements (call after completing quests, workouts, etc.)
async function checkAchievements() {
  const data = await authenticatedFetch(
    'http://localhost:5000/api/v1/achievements/check',
    { method: 'POST' }
  );

  if (data.data.unlockedCount > 0) {
    // Show notifications for unlocked achievements
    data.data.achievements.forEach(achievement => {
      showNotification(`🏆 ACHIEVEMENT UNLOCKED: ${achievement.name}`, 'success');
    });

    // Reload achievements display
    loadAchievements();
  }
}
```

### Quests System

```javascript
// Load available quests
async function loadAvailableQuests() {
  const data = await authenticatedFetch(
    'http://localhost:5000/api/v1/quests?isActive=true'
  );

  const questsContainer = document.getElementById('quests-container');
  questsContainer.innerHTML = '';

  data.data.quests.forEach(quest => {
    const questCard = createQuestCard(quest);
    questsContainer.appendChild(questCard);
  });
}

// Load user's active quests
async function loadMyQuests() {
  const data = await authenticatedFetch(
    'http://localhost:5000/api/v1/quests/my-quests?status=active'
  );

  const activeQuestsContainer = document.getElementById('active-quests');
  activeQuestsContainer.innerHTML = '';

  data.data.quests.forEach(quest => {
    const questCard = createActiveQuestCard(quest);
    activeQuestsContainer.appendChild(questCard);
  });
}

// Start a quest
async function startQuest(questId) {
  const data = await authenticatedFetch(
    `http://localhost:5000/api/v1/quests/${questId}/start`,
    { method: 'POST' }
  );

  if (data.success) {
    showNotification(`Quest started: ${data.data.quest.title}`, 'success');
    loadMyQuests();
  }
}

// Complete a quest
async function completeQuest(questId) {
  const data = await authenticatedFetch(
    `http://localhost:5000/api/v1/quests/${questId}/complete`,
    { method: 'POST' }
  );

  if (data.success) {
    showNotification(
      `✅ QUEST COMPLETED! Earned ${data.data.rewards.xp} XP`,
      'success'
    );

    // Check for achievements
    await checkAchievements();

    // Reload quests and user stats
    loadMyQuests();
    loadUserStats();
  }
}
```

### Skill Trees

```javascript
// Load skill trees
async function loadSkillTrees() {
  const data = await authenticatedFetch(
    'http://localhost:5000/api/v1/skills/trees'
  );

  renderSkillTrees(data.data.skillTrees);
}

// Load user's skill progress
async function loadUserSkills() {
  const userId = JSON.parse(localStorage.getItem('user')).id;

  const data = await authenticatedFetch(
    `http://localhost:5000/api/v1/skills/user/${userId}`
  );

  return data.data.skills;
}

// Unlock a skill
async function unlockSkill(skillNodeId) {
  const data = await authenticatedFetch(
    'http://localhost:5000/api/v1/skills/unlock',
    {
      method: 'POST',
      body: JSON.stringify({ skillNodeId })
    }
  );

  if (data.success) {
    showNotification(`⚡ SKILL UNLOCKED: ${data.data.skill.name}`, 'success');
    loadUserSkills();
    loadUserStats();
  }
}
```

---

## Community Features

### Guilds

```javascript
// Load all guilds
async function loadGuilds() {
  const data = await authenticatedFetch(
    'http://localhost:5000/api/v1/community/guilds'
  );

  const guildsContainer = document.getElementById('guilds-list');
  guildsContainer.innerHTML = '';

  data.data.guilds.forEach(guild => {
    const guildCard = createGuildCard(guild);
    guildsContainer.appendChild(guildCard);
  });
}

// Create a guild
async function createGuild(name, description, charter) {
  const data = await authenticatedFetch(
    'http://localhost:5000/api/v1/community/guilds',
    {
      method: 'POST',
      body: JSON.stringify({ name, description, charter })
    }
  );

  if (data.success) {
    showNotification('Guild created successfully!', 'success');
    loadGuilds();
  }
}

// Join a guild
async function joinGuild(guildId) {
  const data = await authenticatedFetch(
    `http://localhost:5000/api/v1/community/guilds/${guildId}/join`,
    { method: 'POST' }
  );

  if (data.success) {
    showNotification('Joined guild successfully!', 'success');
  }
}
```

### Forum Posts

```javascript
// Load forum posts
async function loadForumPosts(guildId = null) {
  const url = guildId
    ? `http://localhost:5000/api/v1/community/posts?guildId=${guildId}`
    : 'http://localhost:5000/api/v1/community/posts';

  const data = await authenticatedFetch(url);

  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = '';

  data.data.posts.forEach(post => {
    const postElement = createPostElement(post);
    postsContainer.appendChild(postElement);
  });
}

// Create a post
async function createPost(title, content, guildId = null) {
  const data = await authenticatedFetch(
    'http://localhost:5000/api/v1/community/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        title,
        content,
        guildId,
        postType: 'discussion'
      })
    }
  );

  if (data.success) {
    showNotification('Post created successfully!', 'success');
    loadForumPosts(guildId);
  }
}

// Like a post
async function likePost(postId) {
  const data = await authenticatedFetch(
    `http://localhost:5000/api/v1/community/posts/${postId}/like`,
    { method: 'POST' }
  );

  if (data.success) {
    // Update UI to reflect like status
    return data.liked;
  }
}

// Add comment
async function addComment(postId, content) {
  const data = await authenticatedFetch(
    `http://localhost:5000/api/v1/community/posts/${postId}/comments`,
    {
      method: 'POST',
      body: JSON.stringify({ content })
    }
  );

  if (data.success) {
    showNotification('Comment added!', 'success');
    loadComments(postId);
  }
}
```

---

## AI Strategy Tools

### Strategy Forge Integration

Replace the existing `callGemini` function in legion-command-center-evolved.html:

```javascript
async function generateStrategy(terminalType, userInput) {
  // Show loading state
  showAILoading(true);

  try {
    const data = await authenticatedFetch(
      'http://localhost:5000/api/v1/strategy/generate',
      {
        method: 'POST',
        body: JSON.stringify({
          terminalType,
          userInput
        })
      }
    );

    if (data.success) {
      displayAIResponse(data.data.response, terminalType);

      // Award XP (already done server-side, but update UI)
      loadUserStats();
    }
  } catch (error) {
    showAIError(error.message);
  } finally {
    showAILoading(false);
  }
}

// For each terminal (Terminal 01-07), update the button handlers:

// Example for Terminal 01 (Hero Class)
document.getElementById('ai-button-hero-class').addEventListener('click', async () => {
  const userInput = {
    targetAudience: document.getElementById('target-audience-input').value,
    niche: document.getElementById('niche-input').value,
    // ... gather all inputs
  };

  await generateStrategy('hero_class', userInput);
});

// Example for Terminal 02 (Loot Table / Monetization)
document.getElementById('ai-button-monetization').addEventListener('click', async () => {
  const userInput = {
    businessType: document.getElementById('business-type').value,
    expertise: document.getElementById('expertise').value,
    // ... gather all inputs
  };

  await generateStrategy('loot_table', userInput);
});

// Repeat for all 7 terminals with appropriate terminal types:
// - hero_class
// - loot_table
// - propaganda
// - threat_analysis
// - mission_logs
// - guild_charter
// - scriptorium
```

### Workspace Management

```javascript
// Save strategy to workspace
async function saveToWorkspace(workspaceId, terminalType) {
  // Workspace saving is automatic on the backend when workspaceId is provided
  // Just need to create and manage workspaces
}

// Create new workspace
async function createWorkspace(name, terminalType) {
  const data = await authenticatedFetch(
    'http://localhost:5000/api/v1/strategy/workspaces',
    {
      method: 'POST',
      body: JSON.stringify({ name, terminalType })
    }
  );

  return data.data.workspace;
}

// Load workspaces
async function loadWorkspaces() {
  const data = await authenticatedFetch(
    'http://localhost:5000/api/v1/strategy/workspaces'
  );

  return data.data.workspaces;
}
```

---

## Real-time Features

### Socket.IO Integration

Add Socket.IO to your HTML:

```html
<script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
```

Initialize connection:

```javascript
let socket;

function initializeSocket() {
  const token = localStorage.getItem('token');

  socket = io('http://localhost:5000', {
    auth: {
      token: token
    }
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  // Real-time notifications
  socket.on('new_message', (data) => {
    displayMessage(data);
    playNotificationSound();
  });

  socket.on('new_guild_message', (data) => {
    displayGuildMessage(data);
  });

  socket.on('user_typing', (data) => {
    showTypingIndicator(data.username);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}

// Send direct message
function sendDirectMessage(recipientId, message) {
  socket.emit('send_message', {
    recipientId,
    message
  });
}

// Send guild message
function sendGuildMessage(guildId, message) {
  socket.emit('guild_message', {
    guildId,
    message
  });
}

// Typing indicator
function sendTypingIndicator(recipientId, isTyping) {
  socket.emit('typing', {
    recipientId,
    isTyping
  });
}

// Initialize socket when user logs in
login(email, password).then(() => {
  initializeSocket();
});
```

---

## Code Examples

### Complete Dashboard Integration

```javascript
// dashboard.js
class Dashboard {
  constructor() {
    this.user = null;
    this.socket = null;
  }

  async init() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login.html';
      return;
    }

    // Load user data
    await this.loadUser();

    // Initialize socket
    this.initializeSocket();

    // Load all dashboard data
    await Promise.all([
      this.loadUserStats(),
      this.loadActiveQuests(),
      this.loadAchievements(),
      this.loadNotifications()
    ]);

    // Set up event listeners
    this.setupEventListeners();
  }

  async loadUser() {
    this.user = await getCurrentUser();
    document.getElementById('username').textContent = this.user.username;
    document.getElementById('user-avatar').src = this.user.avatar_url || '/default-avatar.png';
  }

  async loadUserStats() {
    document.getElementById('level').textContent = this.user.level;
    document.getElementById('title').textContent = this.user.title;
    document.getElementById('xp').textContent = this.user.current_xp;
    document.getElementById('xp-max').textContent = this.user.xp_to_next_level;
    document.getElementById('streak').textContent = this.user.login_streak;

    const xpPercent = (this.user.current_xp / this.user.xp_to_next_level) * 100;
    document.getElementById('xp-bar').style.width = `${xpPercent}%`;
  }

  async loadActiveQuests() {
    const data = await authenticatedFetch(
      'http://localhost:5000/api/v1/quests/my-quests?status=active'
    );

    const container = document.getElementById('active-quests');
    container.innerHTML = '';

    data.data.quests.forEach(quest => {
      const questElement = this.createQuestElement(quest);
      container.appendChild(questElement);
    });
  }

  async loadAchievements() {
    const data = await authenticatedFetch(
      `http://localhost:5000/api/v1/achievements/user/${this.user.id}`
    );

    document.getElementById('achievements-unlocked').textContent = data.data.stats.completed;
    document.getElementById('achievements-total').textContent = data.data.stats.total;
  }

  async loadNotifications() {
    const data = await authenticatedFetch(
      'http://localhost:5000/api/v1/notifications'
    );

    const unreadCount = data.data.notifications.filter(n => !n.is_read).length;
    document.getElementById('notification-count').textContent = unreadCount;
  }

  initializeSocket() {
    const token = localStorage.getItem('token');

    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('new_message', (data) => {
      this.handleNewMessage(data);
    });

    this.socket.on('level_up', (data) => {
      this.showLevelUpAnimation(data.newLevel);
    });
  }

  createQuestElement(quest) {
    const div = document.createElement('div');
    div.className = 'quest-card';
    div.innerHTML = `
      <h3>${quest.title}</h3>
      <p>${quest.description}</p>
      <div class="quest-progress">
        <div class="progress-bar" style="width: ${quest.progress_percentage}%"></div>
      </div>
      <div class="quest-footer">
        <span>+${quest.xp_reward} XP</span>
        <button onclick="dashboard.completeQuest('${quest.id}')">Complete</button>
      </div>
    `;
    return div;
  }

  async completeQuest(questId) {
    await completeQuest(questId);
    this.loadActiveQuests();
    this.loadUserStats();
  }

  setupEventListeners() {
    // Add any additional event listeners
  }
}

// Initialize dashboard
const dashboard = new Dashboard();
dashboard.init();
```

### Notification System

```javascript
// notifications.js
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// CSS for notifications
const notificationStyles = `
.notification {
  position: fixed;
  top: 20px;
  right: -300px;
  background: #000;
  color: #fff;
  padding: 15px 20px;
  border-left: 4px solid #C70039;
  font-family: 'VT323', monospace;
  font-size: 18px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transition: right 0.3s ease;
  z-index: 10000;
  max-width: 300px;
}

.notification.show {
  right: 20px;
}

.notification-success {
  border-left-color: #00FF00;
}

.notification-error {
  border-left-color: #FF0000;
}

.notification-info {
  border-left-color: #0080FF;
}
`;
```

---

## Migration Checklist

- [ ] Replace all mock data with API calls
- [ ] Update authentication flow
- [ ] Integrate gamification features (XP, achievements, quests, skills)
- [ ] Connect community features (guilds, posts, comments)
- [ ] Replace Gemini direct calls with backend API
- [ ] Add Socket.IO for real-time features
- [ ] Update UI to display real user data
- [ ] Add error handling for API calls
- [ ] Implement token refresh logic
- [ ] Add loading states for async operations
- [ ] Test all features end-to-end

---

## Performance Tips

1. **Use caching**: The backend caches AI responses - take advantage of this
2. **Lazy load**: Only load data when needed (e.g., load guild details when user clicks)
3. **Debounce typing**: Don't send typing indicators on every keystroke
4. **Optimize images**: Compress avatars and media before upload
5. **Use pagination**: Load posts/quests in batches

---

## Security Considerations

1. **Never expose tokens**: Store in localStorage, never in URL or cookies without HttpOnly flag
2. **Validate inputs**: Frontend validation + backend validation
3. **HTTPS only**: Use HTTPS in production
4. **XSS protection**: Sanitize user-generated content before displaying
5. **CSRF tokens**: Backend handles this, but be aware

---

For more details, see the backend README.md and API documentation.
