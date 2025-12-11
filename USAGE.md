# Legion Command Center V3 - User Guide

## 🎮 Getting Started

### First Launch

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000/legion-v3.html` in your browser

3. You'll see the **LEGION OS boot sequence**:
   - System initialization messages
   - Progress bar loading
   - Automatic transition to main interface

### Interface Overview

The main interface consists of:

```
┌─────────────────────────────────────────┐
│  LEGION COMMAND CENTER                  │  ← Header
│  CLASSIFIED // STRATEGIC INTELLIGENCE   │
└─────────────────────────────────────────┘

         🌐 Strategy Core (3D)
        /  |  |  |  \
       /   |  |  |   \
      ●    ●  ●  ●    ●  ← Orbital Nodes

┌─────────────────────────────────────────┐
│ [TARGET] [INTEL] [FIELD] [TRAIN] [ARCH] │  ← Navigation
└─────────────────────────────────────────┘
```

## 🎯 Using the Strategy Forge (Target Analysis)

The Strategy Forge is your primary tool for business planning and AI-powered strategy generation.

### Step-by-Step Guide

1. **Activate the Module**
   - Click the cyan **TARGET ANALYSIS** orbital node, OR
   - Click the **TARGET ANALYSIS** button in the bottom navigation

2. **Fill Out Strategic Parameters**

   **Target Avatar Parameters:**
   ```
   Example: "High-stress tech workers aged 28-40, sitting 8+ hours
   daily, seeking sustainable fitness transformation without
   complicated meal plans"
   ```

   **Transformation Objectives:**
   ```
   Example: "Transform from sedentary and stressed to strong and
   energized in 90 days through gamified strength training"
   ```

   **Unique Methodology:**
   ```
   Example: "RPG-style progression system where every workout
   earns XP, unlocks new 'abilities' (exercises), and includes
   boss battles (PR attempts)"
   ```

3. **Initiate Analysis**
   - Click **INITIATE STRATEGIC ANALYSIS**
   - On first use, you'll be prompted for your Gemini API key
   - The Strategy Core will enter "analyzing" state (pulsing animation)

4. **Review Results**
   - AI-generated strategy will appear in data packets
   - Covers: positioning, monetization, acquisition, gamification, 90-day plan
   - Save or export the analysis for reference

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Enter it when prompted in Legion Command Center
6. The key is saved locally in your browser for future sessions

### Fallback Mode

If you don't have an API key or the API call fails:
- The system will use a **fallback analysis generator**
- Provides structured strategic framework based on your inputs
- Less detailed than AI analysis but still actionable

## 📊 Other Modules

### Intel Visualization (Orange Node)
- Status: Under Development
- Purpose: Visual data mapping and competitive analysis
- Currently displays module description and roadmap

### Field Operations (Green Node)
- Status: Under Development
- Purpose: Operational dashboard for client management
- Currently displays mock statistics and future features

### Training Protocols (Blue Node)
- Status: Under Development
- Purpose: Knowledge base and training modules
- Currently displays available training paths

### Data Archive (Grey Node)
- Status: Complete
- Purpose: Access to analyzed strategic documents
- Displays list of ingested documents and key themes
- References: Blueprint, Gamified Life, Legion of Fitness, Gym Chimera

## ⌨️ Keyboard & Mouse Controls

### Mouse Interactions
- **Click Orbital Nodes**: Activate module
- **Click Navigation Buttons**: Switch between modules
- **Hover Nodes**: Highlight and show cursor pointer
- **Click Close Button**: Exit modal

### Keyboard Shortcuts
- **ESC**: Close active terminal/modal

## 🎨 Visual States

### Strategy Core States

1. **Idle** (Default)
   - Slow rotation
   - Cyan glow
   - Calm, waiting state

2. **Analyzing** (During API call)
   - Pulsing scale
   - Increased glow intensity
   - Faster rotation

3. **Glitching** (Processing)
   - Vertex distortion
   - Orange emissive color
   - Chaotic movement

4. **Success** (Analysis complete)
   - Green flash
   - Smooth return to idle
   - Confirmation state

### Node Colors

- **Cyan** (#00FFFF): Target Analysis - Primary action
- **Orange** (#FF4F00): Intel Viz - Warning/attention
- **Green** (#00FF88): Field Ops - Success/active
- **Blue** (#0088FF): Training - Information
- **Grey** (#7A7A7A): Archive - Neutral/reference

## 🔧 Troubleshooting

### "API request failed" Error

**Causes:**
- Invalid API key
- Network connectivity issues
- API quota exceeded

**Solutions:**
1. Verify API key is correct
2. Check internet connection
3. Try clearing localStorage: `localStorage.removeItem('gemini_api_key')`
4. Use fallback mode (automatic on error)

### 3D Scene Not Loading

**Causes:**
- WebGL not supported
- Browser compatibility issues
- GPU/graphics driver problems

**Solutions:**
1. Update your browser to latest version
2. Enable hardware acceleration in browser settings
3. Try a different browser (Chrome, Firefox, Edge recommended)
4. Check WebGL support: visit `https://get.webgl.org/`

### Blank Screen After Boot

**Causes:**
- JavaScript error
- Module import failure

**Solutions:**
1. Open browser console (F12) to check for errors
2. Refresh the page (Ctrl+R / Cmd+R)
3. Clear browser cache
4. Restart the dev server

### Modal Won't Close

**Solutions:**
1. Press ESC key
2. Click the CLOSE button
3. Refresh the page if unresponsive

## 💡 Tips & Best Practices

### Strategy Forge Tips

1. **Be Specific**: The more detailed your inputs, the better the AI analysis
2. **Focus on Pain Points**: Describe specific problems your avatar faces
3. **Quantify When Possible**: Include numbers (age ranges, time frames, metrics)
4. **Unique Value Prop**: Clearly articulate what makes your approach different

### Example Quality Inputs

**Good:**
```
Target Avatar: "Busy software engineers, 30-45, working 50+ hour weeks,
chronic back pain from sitting, tried gym 3 times and quit, skeptical
of fitness 'gurus', respond well to data and gamification"
```

**Needs Improvement:**
```
Target Avatar: "People who want to get fit"
```

### Performance Optimization

- Close unused browser tabs for better 3D performance
- If animation is choppy, reduce browser zoom to 100%
- On slower devices, minimize other applications

## 📱 Mobile/Tablet Support

The interface is responsive but optimized for desktop:
- **Desktop**: Full 3D experience with all features
- **Tablet**: Functional with touch controls
- **Mobile**: Limited (3D may be slow, small screen challenging)

For best experience, use a desktop or laptop with:
- Screen width: 1280px or wider
- Modern GPU (integrated graphics sufficient)
- Chrome, Firefox, or Edge browser

## 🚀 Next Steps After Strategy Analysis

1. **Review & Refine**: Read through the AI analysis thoroughly
2. **Extract Action Items**: Identify immediate next steps
3. **Create Timeline**: Map suggested phases to calendar dates
4. **Build MVP**: Start with Phase 1 recommendations
5. **Iterate**: Return to Strategy Forge as your business evolves

## 📞 Support & Feedback

- GitHub Issues: Report bugs or request features
- Documentation: Check README.md for technical details
- Updates: Watch the repository for new versions

---

**Version**: 3.0.0
**Last Updated**: 2025-11-19
**Status**: Working Prototype
