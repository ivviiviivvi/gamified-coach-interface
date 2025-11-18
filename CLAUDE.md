# CLAUDE.md - AI Assistant Guide for Gamified Coach Interface

**Last Updated:** 2025-11-18
**Repository:** gamified-coach-interface
**Primary Developer:** ivi374forivi

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Tech Stack](#tech-stack)
4. [Key Components](#key-components)
5. [Development Workflow](#development-workflow)
6. [Coding Conventions](#coding-conventions)
7. [Design Philosophy](#design-philosophy)
8. [Future Roadmap](#future-roadmap)
9. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

### Purpose

The Gamified Coach Interface (also known as "Legion Command Center" or "The Gamified Life") is a multi-purpose fitness coaching platform that combines:

- **Document Analysis System**: Python-based tool for analyzing fitness coaching documents
- **Gamified Client Interface**: RPG-style fitness tracking application for end users
- **Coach Command Center**: Strategic planning interface for fitness entrepreneurs

### Core Concept

Transform fitness coaching from a mundane task into an epic journey by applying gamification principles inspired by RPG mechanics (leveling, quests, achievements, skill trees) and retro gaming aesthetics.

### Project Evolution

| Version | Theme | Implementation | Status |
|---------|-------|----------------|--------|
| **V1** | Document analysis reports | Python scripts, static HTML | ✅ Complete |
| **V2** | Retro pixel RPG interface | Vanilla JS + Tailwind CSS | ✅ Functional |
| **V3** | Neo-brutalist holographic UI | Three.js + GLSL shaders (planned) | 📋 Specification phase |

---

## Repository Structure

```
gamified-coach-interface/
├── analyze_docs.py              # Document analysis engine (Python)
├── requirements.txt             # Python dependencies
├── README.md                    # User-facing documentation
├── .gitignore                   # Git ignore patterns
│
├── index.html                   # Coach Command Center (V2)
├── client.html                  # Client-facing gamified interface
├── legion-command-center-evolved.html  # Experimental UI iterations
├── legion-command-center-evolved 2.html
│
├── legion-cc-v3-design-spec.md  # V3 design specification
├── legionCommandCenter-applicationDrafts_‎Gemini.md
├── legionCommandCenter-fitnessNicheResearch_‎Gemini.md
│
└── *.docx                       # Source documents for analysis
    ├── Blueprint for a Niche Fitness Coaching Enterprise...
    ├── The Gamified Life...
    ├── The Legion of Fitness...
    └── Gym Chimera.docx
```

### File Categories

#### Core Application Files
- `index.html` - Main coach dashboard (Strategy Forge, Intel Map, Training Sim)
- `client.html` - Client-facing gamified fitness tracker
- `analyze_docs.py` - Document ingestion and analysis system

#### Documentation & Design
- `README.md` - Project setup and usage instructions
- `legion-cc-v3-design-spec.md` - Comprehensive V3 design specification
- `*.md` files - Research notes and Gemini-generated content

#### Source Materials
- `*.docx` files - Fitness coaching philosophy and business model documents

---

## Tech Stack

### Backend/Analysis
- **Python 3.11+**
  - `python-docx` - Word document parsing
  - Standard library only (no heavy frameworks)

### Frontend
- **Vanilla JavaScript** (ES6+)
  - No build tools or frameworks
  - Direct browser execution

- **CSS Frameworks**
  - Tailwind CSS (CDN) - Utility-first styling
  - Custom CSS for pixel art aesthetics

- **UI Libraries**
  - Chart.js (CDN) - Data visualization (V2)
  - Three.js (planned for V3) - 3D graphics

### Design Assets
- **Google Fonts**
  - Press Start 2P - Pixel art headings
  - VT323 - Retro terminal text
  - Roboto Mono - Monospace data display
  - Inter (V3) - Modern system UI

### APIs
- Google Gemini API - AI strategy generation (planned/partial integration)

---

## Key Components

### 1. Document Analysis System (`analyze_docs.py`)

**Purpose:** Ingest fitness coaching documents and extract actionable insights

**Key Classes:**
- `DocumentAnalyzer` - Main analysis orchestrator
  - Line 14-456: Full class implementation

**Core Methods:**
- `ingest_docs()` - Scans for .docx files, parses with python-docx
- `digest_docs()` - Extracts topics, word counts, summaries
- `suggest_path()` - Generates development roadmap based on content
- `_extract_key_topics()` - Simple frequency-based topic extraction
- `_create_summary()` - Truncates first 3 paragraphs to 300 chars

**Workflow:**
```python
analyzer = DocumentAnalyzer(base_dir=".")
analyzer.run()  # Ingest → Digest → Suggest
```

**Limitations:**
- Basic word frequency analysis (no NLP/semantic understanding)
- Static stop word list
- Simple stemming (removes -ing, -ed, -s)
- No multi-word topic detection

### 2. Coach Command Center (`index.html`)

**Purpose:** Strategy planning interface for fitness entrepreneurs

**Architecture:**
- Single-page application (SPA)
- Module-based navigation system
- Retro gaming aesthetic (8-bit style)

**Modules:**
1. **Dashboard** - System status overview
2. **Strategy Forge** - AI-powered business planning terminals
   - Hero Class (target avatar definition)
   - Loot Table (product offerings)
   - (Additional terminals defined in design spec)
3. **Intel Map** - Visual data representations
4. **Training Sim** - Knowledge testing quizzes
5. **Field Manual** - Documentation access

**Key Features:**
- Canvas-based particle background (`#bg-canvas`)
- Web Audio API sound effects (8-bit beeps)
- Responsive grid layout (Tailwind)
- Terminal-style input/output

### 3. Client Gamified Interface (`client.html`)

**Purpose:** End-user fitness tracking with RPG mechanics

**Game Systems:**

1. **Character System**
   - Player name, level, XP progress
   - Character classes: Warrior, Ranger, Monk, Berserker
   - Stats: Strength, Endurance, Discipline, Agility

2. **Quest System**
   - Daily quests (workouts as quests)
   - Weekly challenges
   - Difficulty tiers: Easy, Medium, Hard
   - XP rewards

3. **Progression System**
   - XP bar with visual feedback
   - Level-up animations and audio
   - Streak tracking (current/best)

4. **Skill Tree**
   - Tiered progression (Basic → Advanced → Elite → Legendary)
   - Unlock requirements (level-gated)
   - Visual state management (locked, available, unlocked)

5. **Achievements**
   - Badge system for milestones
   - Visual unlock states

6. **Leaderboard**
   - Guild ranking system
   - Monthly XP competition

**Technical Patterns:**
- Event-driven navigation (data-target attributes)
- LocalStorage for state persistence (to be implemented)
- Canvas particle system for background effects
- Web Audio API for retro sound effects

---

## Development Workflow

### Working with Documents

1. **Adding New Documents**
   ```bash
   # Place .docx files in repository root
   cp ~/path/to/new-doc.docx .

   # Run analysis
   python3 analyze_docs.py
   ```

2. **Document Analysis Output**
   - Categorizes by theme (fitness, business, gamification)
   - Extracts key topics via word frequency
   - Generates custom development path
   - Suggests next steps

### Working with HTML Interfaces

1. **Local Development**
   ```bash
   # No build step required - open directly in browser
   open index.html
   # or
   python3 -m http.server 8000
   ```

2. **Testing Responsive Design**
   - Mobile-first approach
   - Breakpoint: 640px (Tailwind sm:)
   - Test on actual devices or browser dev tools

3. **Modifying Styles**
   - Tailwind classes for layout
   - Custom CSS in `<style>` tags for theme-specific styling
   - CSS variables in `:root` for color theming

### Git Workflow

**Branch Naming:**
- Feature branches: `claude/feature-name-{session-id}`
- Always develop on designated branch
- Never push to main without PR

**Commit Messages:**
```bash
# Good examples from history:
git commit -m "Add client-facing gamified fitness application"
git commit -m "Update analyze_docs.py"
git commit -m "Fix static development path"
```

---

## Coding Conventions

### Python (`analyze_docs.py`)

**Style Guide:**
- PEP 8 compliant
- Type hints for function signatures
- Docstrings with Args/Returns sections
- Line length: ~80-100 characters

**Patterns:**
```python
# Dictionary-based state management
self.documents: Dict[str, Any] = {}

# Defensive programming
if not self.base_dir.exists() or not self.base_dir.is_dir():
    print(f"Error: ...")
    sys.exit(1)

# List comprehensions for filtering
docx_files = [
    f for f in self.base_dir.glob("*.docx")
    if not any(part.startswith('.') or part.startswith('~$') for part in f.parts)
]
```

### HTML/CSS

**Color Scheme (V2):**
```css
:root {
    --theme-red: #C70039;
    --theme-black: #000000;
    --theme-white: #FFFFFF;
    --theme-gray: #888888;
    --theme-green: #00FF00;
    --theme-blue: #0080FF;
    --theme-gold: #FFD700;
}
```

**Typography Hierarchy:**
```css
/* Pixel art headings */
h1, h2 { font-family: 'Press Start 2P', cursive; }

/* Retro data display */
.stat-label, .nav-item { font-family: 'VT323', monospace; }

/* Body text */
body { font-family: 'Roboto Mono', monospace; }
```

**Responsive Patterns:**
```css
/* Mobile-first media queries */
@media (max-width: 640px) {
    body { font-size: 14px; }
    .nav-item { padding: 0.25rem 0.5rem; }
    .pixel-border { box-shadow: none; }
}
```

### JavaScript

**Naming Conventions:**
- camelCase for variables/functions
- PascalCase for classes (when used)
- UPPERCASE for constants

**Event Handling Pattern:**
```javascript
// Navigation system
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        const target = button.dataset.target;
        // Update UI state
        // Play sound effect
        playBeep(440, 0.1);
    });
});
```

**Audio Feedback:**
```javascript
// Web Audio API pattern
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(frequency = 440, duration = 0.1) {
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'square';  // 8-bit sound
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}
```

**Canvas Animation Pattern:**
```javascript
// Particle system
const particles = Array(100).fill().map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: Math.random() * 0.5 + 0.2
}));

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ... draw logic
    requestAnimationFrame(drawParticles);
}
```

---

## Design Philosophy

### Gamification Principles

**Core Mechanics:**
1. **Progress Visualization** - XP bars, level indicators, stats
2. **Clear Goals** - Quests with defined objectives and rewards
3. **Immediate Feedback** - Sound effects, animations, visual state changes
4. **Achievement System** - Badges, unlocks, milestones
5. **Social Comparison** - Leaderboards (optional competitive element)

**Narrative Framework:**
- Fitness = RPG adventure
- Workouts = Quests/battles
- Progress = Character leveling
- Trainer = Quest giver/NPC

### Aesthetic Direction

**V2 (Current):**
- **Theme:** Final Fantasy/Dragon Quest retro RPG
- **Palette:** High contrast (red, black, white, gold)
- **Typography:** Pixel art fonts (Press Start 2P, VT323)
- **Effects:** CRT scanlines, particle systems, 8-bit audio
- **Layout:** Bordered panels, grid-based card systems

**V3 (Future):**
- **Theme:** Blade Runner 2049 / Kanye2049 holographic interface
- **Palette:** Neo-brutalist (concrete grey, electric cyan, warning orange)
- **Typography:** Inter (wide tracking), Roboto Mono
- **Effects:** 3D holographic objects, GLSL shaders, API-reactive distortions
- **Layout:** Floating 3D nodes, orbital navigation

### User Experience Priorities

1. **Mobile-First** - Most users will access on phones
2. **Performance** - Target 60fps, minimize dependencies
3. **Accessibility** - Aria labels, semantic HTML, keyboard nav
4. **Progressive Enhancement** - Works without JS for core content
5. **Instant Feedback** - Every interaction should feel responsive

---

## Future Roadmap

### V3 Technical Objectives

**Planned Technologies:**
- Three.js for 3D scene management
- GLSL shaders for holographic effects
- Gemini API integration for real-time strategy generation
- WebGL-based particle systems

**Scene Architecture:**
```
Scene Root
├── Camera (PerspectiveCamera, FOV 50)
├── Lighting Rig (Key, Fill, Ambient)
├── Strategy Core (Central 3D icosahedron)
│   └── States: idle, analyzing, glitching, success
├── Orbital Nodes (5 interactive spheres)
│   ├── Target Analysis (Cyan)
│   ├── Intel Visualization (Orange)
│   ├── Field Operations (Green)
│   ├── Training Protocols (Blue)
│   └── Data Archive (Grey)
└── Environment (Fog, Starfield)
```

**Key Features to Implement:**
- API-reactive 3D morphing (visual feedback during AI calls)
- Holographic data packets (floating result containers)
- Cinematic camera transitions
- Password-protected "classified" interface
- Raycasting for 3D object interaction

### Enhancement Opportunities

**Document Analysis:**
- Add NLP library (spaCy, NLTK) for semantic analysis
- Multi-word topic extraction
- Sentiment analysis for content categorization
- Export to structured formats (JSON, CSV)

**Client Interface:**
- Backend integration (Node.js + MongoDB/PostgreSQL)
- User authentication and session management
- Workout logging with video/image uploads
- Social features (friend challenges, team quests)
- Wearable device integration (Fitbit, Apple Health)

**Coach Interface:**
- Full Gemini API integration with streaming responses
- Client management dashboard
- Progress tracking analytics
- Revenue/subscription management
- Automated email campaigns

---

## AI Assistant Guidelines

### When Working on This Repository

**Always:**
1. ✅ Read this CLAUDE.md file first
2. ✅ Maintain existing design aesthetic and themes
3. ✅ Test on mobile viewports (320px, 375px, 414px)
4. ✅ Add sound effects to interactive elements
5. ✅ Use CSS variables for theming
6. ✅ Include aria labels for accessibility
7. ✅ Follow existing naming conventions
8. ✅ Commit with descriptive messages
9. ✅ Update README.md if adding new features
10. ✅ Update this CLAUDE.md if changing architecture

**Never:**
1. ❌ Remove existing features without explicit permission
2. ❌ Change color schemes without discussing theme coherence
3. ❌ Add heavy dependencies (keep bundle size minimal)
4. ❌ Break mobile responsiveness
5. ❌ Remove sound effects or animations
6. ❌ Commit directly to main branch
7. ❌ Use frameworks that require build steps (React, Vue, Angular)
8. ❌ Ignore performance considerations
9. ❌ Add tracking/analytics without consent
10. ❌ Modify .docx files (source documents are read-only)

### Task Prioritization

**High Priority:**
- Bug fixes affecting core functionality
- Mobile responsiveness issues
- Performance optimization
- Accessibility improvements
- Security vulnerabilities

**Medium Priority:**
- UI/UX enhancements within existing design system
- Additional gamification features
- Code refactoring for maintainability
- Documentation updates

**Low Priority:**
- Experimental features
- Design system overhauls (V3 migration)
- Third-party integrations
- Cosmetic changes

### Context for Common Tasks

**"Add a new quest/achievement":**
- Location: `client.html` sections `#quests` or `#achievements`
- Follow existing card structure
- Include difficulty tier, XP reward, description
- Add appropriate emoji icons
- Test XP calculation and level-up logic

**"Modify document analysis":**
- File: `analyze_docs.py`
- Class: `DocumentAnalyzer`
- Test with existing .docx files
- Ensure backward compatibility with output format
- Update README.md with new capabilities

**"Update color scheme":**
- Modify CSS variables in `:root`
- Ensure WCAG contrast compliance (minimum 4.5:1)
- Update both light and dark variants if applicable
- Test across all modules
- Document changes in commit message

**"Add API integration":**
- Create separate config file for API keys (add to .gitignore)
- Use environment variables for sensitive data
- Implement error handling and rate limiting
- Add loading states and user feedback
- Consider offline functionality

### Code Review Checklist

Before committing changes, verify:

- [ ] Code follows existing conventions
- [ ] No console.log statements left in production code
- [ ] Mobile responsive (tested at 320px, 768px, 1024px)
- [ ] No broken links or missing assets
- [ ] Sound effects work (user interaction feedback)
- [ ] Animations are smooth (60fps target)
- [ ] No accessibility regressions
- [ ] Git commit message is descriptive
- [ ] No API keys or secrets in code
- [ ] Tested in Chrome, Firefox, Safari (if possible)

### Useful File Locations

**To modify:**
- Coach navigation: `index.html` line ~80 (`.nav-item`)
- Client navigation: `client.html` line ~479 (`.nav-btn`)
- Color palette: CSS `:root` in any HTML file
- Document topics: `analyze_docs.py` line 161 (stop words list)
- Quest definitions: `client.html` line ~543-607

**To reference:**
- V3 design spec: `legion-cc-v3-design-spec.md`
- Project history: `README.md`
- Python dependencies: `requirements.txt`

---

## Project Context

### Target Users

**Primary:** Rob - The specific fitness entrepreneur this system was built for
**Secondary:** Creative developers interested in gamification UX
**Tertiary:** Future fitness coaches licensing the system

### Business Model Concepts

The .docx documents describe a "Gamified Life Model" for fitness coaching:
- Niche targeting (high-stress tech workers, busy professionals)
- Tiered product offerings (free lead magnets → paid courses → 1-on-1 coaching)
- Community building through gamification
- Battle/quest metaphors for fitness challenges

### Success Metrics

- User engagement (daily logins, quest completion rate)
- Progression velocity (avg. time to level 10)
- Retention (7-day, 30-day, 90-day)
- Social sharing (leaderboard interaction)
- Conversion (free users → paying clients)

---

## Questions or Issues?

**For code-related questions:**
- Reference this CLAUDE.md
- Check `legion-cc-v3-design-spec.md` for V3 details
- Review commit history for implementation patterns

**For business/design questions:**
- Read the .docx source documents
- Run `analyze_docs.py` for strategic insights
- Check README.md for project overview

**For technical support:**
- Open an issue in the repository
- Include browser/OS version, screenshots, error messages
- Describe expected vs. actual behavior

---

**Document Version:** 1.0
**Author:** Claude (Anthropic AI)
**Maintenance:** Update this file when architecture changes significantly
