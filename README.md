# Gamified Coach Interface - Legion Command Center

A comprehensive gamified fitness coaching platform featuring:
- **V3 Holographic Interface**: Three.js-powered 3D command center with AI integration
- **V2 Retro Interface**: Pixel RPG-style coaching dashboard
- **Document Analysis System**: Python-based strategic document ingestion and analysis

## 🎬 Portfolio Video Resources

**For Hiring Managers & Decision Makers:** This repository includes comprehensive resources for creating a professional portfolio video that explains the project in business terms without requiring code literacy.

### Manual Video Production
- **⚡ [Quick Start Guide](QUICK_START_VIDEO.md)** - Start here! 5-minute overview and action plan
- **📹 [Video Production Guide](VIDEO_PRODUCTION_README.md)** - Complete step-by-step production guide
- **📝 [Full Video Script & Assets](HIRING_PORTFOLIO_VIDEO.md)** - Executive hook, narration script, visual plan, and B-roll prompts
- **⚙️ [Configuration Template](.video-config.env.example)** - Customizable environment variables for video production

### Automated Video Production
- **🤖 [Automated Video Production System](scripts/video_production/README.md)** - Fully automated video generation from scripts
- **🚀 Quick Start**: `./scripts/produce_videos.sh` - Generate videos automatically from markdown scripts
- **⚙️ [Production Config](.video-production.env.example)** - Environment variables for automated production

These resources demonstrate how to translate technical work into strategic narratives for executive audiences.

## 🚀 Quick Start - Legion Command Center V3

### Requirements

- Node.js 18+ and npm
- Modern web browser with WebGL support
- (Optional) Gemini API key for AI-powered strategy generation

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ivi374forivi/gamified-coach-interface.git
cd gamified-coach-interface
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000/legion-v3.html`

### Features

**Legion Command Center V3** - Neo-brutalist holographic interface:
- 🎮 **Interactive 3D Scene**: Strategy Core with orbital navigation nodes
- 🤖 **AI Strategy Generation**: Gemini API integration for business analysis
- 🎨 **Holographic Design**: Blade Runner 2049-inspired aesthetics
- 📊 **Strategy Forge**: AI-powered target analysis and business planning
- 🗺️ **Multi-Module System**: Intel visualization, field ops, training, archive

## 🎯 Using Legion Command Center V3

### First Time Setup

1. **Boot Sequence**: On first load, you'll see the LEGION OS boot screen
2. **3D Interface**: After boot, you'll see the Strategy Core (central holographic object) with 5 orbital nodes
3. **Navigation**: Click on orbital nodes or use the bottom menu to access different modules

### Modules Overview

1. **TARGET ANALYSIS** (Cyan Node)
   - Primary strategy forge for business planning
   - AI-powered analysis of target avatars and transformation goals
   - Requires Gemini API key for full functionality
   - Fallback analysis available without API key

2. **INTEL VISUALIZATION** (Orange Node)
   - Market landscape and competitive analysis
   - Visual data mapping (under development)

3. **FIELD OPERATIONS** (Green Node)
   - Operational dashboard
   - Client and mission tracking (under development)

4. **TRAINING PROTOCOLS** (Blue Node)
   - Knowledge base and training modules
   - Business strategy education (under development)

5. **DATA ARCHIVE** (Grey Node)
   - Access to analyzed strategic documents
   - Reference materials and frameworks

### API Configuration

To enable AI-powered strategy generation:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click on **TARGET ANALYSIS** node
3. Fill out the strategy parameters
4. Click **INITIATE STRATEGIC ANALYSIS**
5. When prompted, enter your API key (saved locally for future sessions)

### Keyboard Shortcuts

- `ESC` - Close active terminal/modal
- Click anywhere on nodes or menu items to navigate

## 🏗️ Project Structure

```
gamified-coach-interface/
├── legion-v3.html          # V3 Main HTML (holographic interface)
├── index.html              # V2 Command center (retro interface)
├── client.html             # V2 Client-facing interface
├── src/
│   ├── main.js            # V3 Main application logic
│   ├── SceneManager.js    # Three.js scene management
│   ├── StrategyCore.js    # Central 3D holographic object
│   └── OrbitalNodes.js    # Navigation node system
├── analyze_docs.py         # Python document analyzer
├── package.json           # Node.js dependencies
├── vite.config.js         # Vite build configuration
└── *.docx                 # Strategic documents

```

### Documentation & Organization

This project is well-documented with clear structure:

- **📖 [Documentation Index](docs/INDEX.md)** - Complete documentation map
- **🏗️ [Architecture Guide](ARCHITECTURE.md)** - Project structure and architecture
- **🤝 [Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **🔒 [Security Policy](SECURITY.md)** - Vulnerability reporting
- **📋 [Repository Structure](docs/REPO_STRUCTURE.md)** - Repository organization
- **✅ [Working Prototype Checklist](docs/WORKING_PROTOTYPE_CHECKLIST.md)** - Development roadmap

Frontend environment variables now live in `.env` (Gemini key + backend URL). Copy and fill it before running `npm run dev`.

## 🛠️ Build for Production

To create a production build:

```bash
npm run build
```

This will generate optimized files in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## 📖 Python Document Analysis

### Requirements

- Python 3.11+
- python-docx library

### Installation

1. Clone the repository (if not already done):
```bash
git clone https://github.com/ivi374forivi/gamified-coach-interface.git
cd gamified-coach-interface
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

Run the document analyzer:

```bash
python3 analyze_docs.py
```

The script will:
1. Scan the repository for `.docx` files
2. Ingest and parse each document
3. Analyze the content to extract key topics and statistics
4. Provide a suggested development path based on the analysis

## Output

The analyzer provides:
- List of ingested documents
- Document statistics (paragraph count, word count)
- Key topics extracted from each document
- Categorization of documents (fitness, business, gamification themes)
- Recommended development path with actionable steps
- Suggested next steps for implementation

## Documents in Repository

The repository contains several key documents:
- **Blueprint for a Niche Fitness Coaching Enterprise**: Deep dive into the Gamified Life Model
- **Gym Chimera**: Specific fitness coaching concepts
- **The Gamified Life**: Formal and casual perspective on gamification
- **The Legion of Fitness**: Battle plan and interrogation strategies

## Development Path

## Development Path

The recommended development phases are generated dynamically based on the content and themes found in the analyzed documents. The system identifies relevant topics and suggests actionable phases accordingly.

For example:
- If a document focuses only on fitness, the suggested phases may include:
  1. **Foundation**: Core data models and user profiles
  2. **Interface**: User dashboard and tracking tools
  3. **Coaching Features**: Personalized recommendations and goal tracking
- If business or gamification topics are present, additional phases such as **Gamification** and **Business Integration** may be included.

Possible phases include:
- **Foundation**: Core data models and user profiles
- **Interface**: User dashboard and tracking tools
- **Coaching Features**: Personalized recommendations and goal tracking
- **Gamification**: Achievement systems and challenges
- **Business Integration**: Payments, communication, and analytics
Based on the document analysis, the recommended development phases are:

1. **Foundation**: Core data models and user profiles
2. **Interface**: User dashboard and tracking tools
3. **Coaching Features**: Personalized recommendations and goal tracking
4. **Gamification**: Achievement systems and challenges
5. **Business Integration**: Payments, communication, and analytics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information on:

- Development setup and workflow
- Code style and standards
- Testing requirements
- Pull request process
- Issue reporting guidelines

Also review:
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards
- [Architecture Guide](ARCHITECTURE.md) - Project structure
- [Documentation Index](docs/INDEX.md) - Find relevant docs

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following our coding standards
4. Test your changes
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

- **Issues**: [Report bugs or request features](https://github.com/ivviiviivvi/gamified-coach-interface/issues)
- **Security**: [Report vulnerabilities](SECURITY.md) responsibly
- **Discussions**: Open a GitHub Discussion for questions and ideas

For questions about the document analysis system, please open an issue with the "documentation" label.
