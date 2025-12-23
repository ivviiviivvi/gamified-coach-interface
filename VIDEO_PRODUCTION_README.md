# Hiring Portfolio Video Production Guide

This directory contains everything you need to produce a professional hiring-focused portfolio video that translates the **Legion Command Center** repository into a compelling narrative for non-technical decision-makers.

## 📁 Files in This Package

1. **`HIRING_PORTFOLIO_VIDEO.md`** - Complete video production package including:
   - Executive hook script
   - Full narration script with timecodes
   - Visual plan and scene breakdowns
   - B-roll and metaphor prompts
   - Credibility signals guide
   - Call-to-action framework

2. **`.video-config.env.example`** - Environment variable template for customization

3. **`VIDEO_PRODUCTION_README.md`** - This file (production guide)

## 🎯 Purpose

Transform your technical repository into a 3-5 minute portfolio video that demonstrates:
- ✅ Clear strategic thinking
- ✅ Business problem-solving ability
- ✅ Technical execution with business impact
- ✅ Communication clarity for non-technical audiences
- ✅ Risk awareness and mitigation

**Target Audience:** Founders, executives, hiring managers, clients evaluating you for product strategy, creative technology, or digital systems leadership roles.

## 🚀 Quick Start

### Step 1: Configure Your Variables
```bash
# Copy the example config file
cp .video-config.env.example .video-config.env

# Edit with your information
nano .video-config.env
# or
code .video-config.env
```

**Required fields:**
- `CANDIDATE_NAME` - Your full name
- `CTA_URL` - Your scheduling/contact link
- `CONTACT_EMAIL` - Your email address

**Recommended fields:**
- `CANDIDATE_ROLE_TARGET` - Customize to your positioning
- `BRAND_COLOR_PRIMARY` - Your personal brand color
- `LINKEDIN_URL`, `GITHUB_URL`, `PORTFOLIO_URL`

### Step 2: Review the Full Script
```bash
# Open and read the complete production package
open HIRING_PORTFOLIO_VIDEO.md
# or
cat HIRING_PORTFOLIO_VIDEO.md
```

**What to pay attention to:**
1. **Executive Hook** - Memorize or adapt this for natural delivery
2. **Main Narration Script** - Practice reading it out loud, adjust timing
3. **Visual Plan** - Understand what visuals support each segment
4. **B-roll Prompts** - Identify which you'll create vs. source

### Step 3: Production Planning

Create a production checklist:

- [ ] **Pre-Production**
  - [ ] Customize `.video-config.env` with your information
  - [ ] Review and adapt narration script to your speaking style
  - [ ] Source or create B-roll visuals (see Section 4 of main doc)
  - [ ] Design on-screen diagrams and text overlays
  - [ ] Prepare 3D scene recordings from the actual app
  - [ ] Create CTA card with your branding

- [ ] **Recording**
  - [ ] Record voiceover in quiet environment (no echo, low noise)
  - [ ] Use quality microphone (minimum: USB condenser mic)
  - [ ] Record in segments for easier editing
  - [ ] Maintain consistent energy and pacing throughout

- [ ] **Production**
  - [ ] Edit video according to visual plan and timing
  - [ ] Add all on-screen text and diagrams
  - [ ] Integrate B-roll visuals
  - [ ] Add subtle background music (see config for volume)
  - [ ] Burn in captions for accessibility
  - [ ] Color grade for professional look

- [ ] **Post-Production**
  - [ ] Review against quality checklist (see main doc)
  - [ ] Get feedback from 2-3 people in target audience
  - [ ] Make adjustments based on feedback
  - [ ] Export in multiple formats (MP4, MOV, WebM)
  - [ ] Create platform-specific versions (LinkedIn, full version)

- [ ] **Distribution**
  - [ ] Upload to portfolio website
  - [ ] Share on LinkedIn with context
  - [ ] Include in job applications where relevant
  - [ ] Send to potential clients/employers

## 🎬 Production Tools

### Recommended Software

**Video Editing:**
- **Professional**: Adobe Premiere Pro, Final Cut Pro X, DaVinci Resolve
- **Accessible**: DaVinci Resolve (free), Kdenlive, Shotcut
- **Quick**: Descript (AI-powered, great for captions)

**Audio Recording:**
- **Professional**: Adobe Audition, Logic Pro
- **Accessible**: Audacity (free), GarageBand
- **Simple**: Built-in Voice Memos (surprisingly good quality)

**Graphics/Diagrams:**
- **Professional**: Adobe After Effects, Motion
- **Accessible**: Figma (excellent for diagrams), Canva
- **Simple**: Keynote/PowerPoint (export as video)

**3D/Visual Effects:**
- **For recording app**: OBS Studio (screen recording)
- **For 3D scenes**: Record directly from the running app at legion-v3.html

### Hardware Requirements

**Minimum:**
- Decent computer (can handle video editing)
- USB microphone or good quality headset
- Quiet recording environment

**Recommended:**
- Mid-to-high spec computer with GPU
- Condenser microphone (Blue Yeti, Audio-Technica AT2020, or similar)
- Pop filter and microphone stand
- Sound-dampened room or acoustic treatment

**Professional:**
- High-spec editing workstation
- Professional microphone with audio interface
- Acoustic treatment or professional studio
- Dedicated monitoring setup

## 📝 Script Customization Guide

### What You Can Change

✅ **Adapt these to your style:**
- Exact wording (keep meaning intact)
- Specific examples (if you have better ones)
- Metrics (if you have updated research)
- Your personal anecdotes or context
- CTA specifics (your contact preferences)

### What You Should NOT Change

❌ **Keep these intact:**
- Overall narrative structure (Problem → Insight → Solution → Impact → Why Me)
- No-jargon rule (accessibility is critical)
- Credibility signal placement (strategically timed)
- Video length target (respect viewer's time)
- Core business insights (these are validated)

### Adaptation Tips

1. **Practice reading the script out loud** - Adjust phrasing that doesn't feel natural
2. **Record in small segments** - Easier to get perfect takes
3. **Maintain consistent energy** - Confident but not hyper
4. **Pace yourself** - Slightly slower than normal conversation
5. **Let ideas breathe** - Pause 1-2 seconds after major points

## 🎨 Visual Production Guide

### Creating B-roll Visuals

**Option 1: AI-Generated Visuals**
Use the prompts in Section 4 of `HIRING_PORTFOLIO_VIDEO.md` with:
- Midjourney
- DALL-E 3
- Stable Diffusion
- Runway ML

**Option 2: Stock Footage**
Search for:
- Abstract technology visualizations
- Geometric animations
- Particle systems
- Network/connection visuals
- Minimalist professional backgrounds

**Recommended stock sites:**
- Pexels (free)
- Pixabay (free)
- Videvo (free)
- Envato Elements (subscription)
- Motion Array (subscription)

**Option 3: Create Your Own**
- Record the actual Legion Command Center interface
- Create simple animations in After Effects/Motion
- Use Figma to create animated diagrams
- Screen record interactive visualizations

### On-Screen Text Guidelines

**Typography:**
- Font size: Minimum 5% of screen height
- Font weight: Semi-bold or bold for readability
- Font choice: Sans-serif (Inter, Roboto, SF Pro)
- Alignment: Left-aligned for body, center for titles

**Timing:**
- Appear 0.5 seconds BEFORE mentioned in narration
- Remain 1 second AFTER mentioned
- Transition: Smooth fade (0.3s) or slide up

**Contrast:**
- Minimum 4.5:1 contrast ratio
- Use drop shadows or background boxes if needed
- Test readability at target size

**Placement:**
- Lower third for standard text
- Center for major titles/principles
- Avoid corners (can be cut off on some displays)

## 🎙️ Voice Recording Tips

### Setup
1. **Choose a quiet space** - No traffic, HVAC noise, or echo
2. **Position microphone** - 6-12 inches from mouth, slightly off-axis
3. **Use a pop filter** - Prevents plosives (P, B sounds)
4. **Do a test recording** - Check levels, listen for issues

### Recording Technique
1. **Warm up your voice** - Read script through once before recording
2. **Stay hydrated** - Keep water nearby
3. **Maintain consistent distance** - Don't move closer/farther during recording
4. **Articulate clearly** - Don't rush, pronounce fully
5. **Smile while speaking** - It comes through in your voice

### Audio Levels
- **Peak levels**: -12dB to -6dB (don't clip!)
- **Normalization target**: -16 LUFS (see config)
- **Noise floor**: Aim for at least 60dB signal-to-noise ratio

### Post-Processing
1. **Remove noise** - Use noise reduction sparingly
2. **EQ** - Cut below 80Hz, slight boost at 3-5kHz for clarity
3. **Compression** - Gentle compression for consistency
4. **De-essing** - Reduce harsh S sounds if needed
5. **Normalize** - To -16 LUFS or your target

## ✅ Quality Checklist

Before publishing, verify:

### Content Quality
- [ ] Zero jargon without explanation
- [ ] All technical terms translated to business outcomes
- [ ] Specific numbers and metrics included
- [ ] Clear problem-solution-impact narrative
- [ ] Demonstrates strategic thinking throughout

### Technical Quality
- [ ] Audio is clear and professional (no background noise)
- [ ] Visuals support narration without distraction
- [ ] All text is readable at target size
- [ ] Color grading is consistent
- [ ] Pacing allows comprehension (not too fast)

### Business Effectiveness
- [ ] Hook captures attention in first 10 seconds
- [ ] Value proposition clear by 1:00 mark
- [ ] Credibility signals appear throughout
- [ ] CTA is clear and actionable
- [ ] Viewer knows exactly what to do next

### Accessibility
- [ ] Captions burned in or available
- [ ] Text has sufficient contrast (4.5:1 minimum)
- [ ] Font size readable on mobile
- [ ] Audio description available (if needed)
- [ ] Alternative formats available (transcript)

### Platform Optimization
- [ ] Correct aspect ratio for target platform
- [ ] File size appropriate for streaming
- [ ] Thumbnail is compelling and clear
- [ ] Video title and description optimized
- [ ] Video length appropriate for platform

## 🌐 Distribution Strategy

### Primary Platforms

**1. Portfolio Website**
- **Length**: Full version (4-5 minutes)
- **Placement**: Hero section or dedicated "About" page
- **Context**: Brief introduction explaining video purpose
- **Format**: MP4 (H.264, 1080p)

**2. LinkedIn**
- **Length**: Full version OR 90-second teaser
- **Post copy**: Brief context + value proposition
- **Hashtags**: #ProductStrategy #CreativeTechnology #Hiring
- **Timing**: Tuesday-Thursday, 8-10am
- **Format**: Native upload (better reach than YouTube link)

**3. GitHub Repository**
- **Placement**: Add video link to README.md
- **Context**: "See the business case" or "Portfolio video"
- **Alternative**: Add to repository About section

**4. Email Signature**
- **Text**: "View my work: [Portfolio Video]"
- **Keep it subtle**: One line only

### Application-Specific Use

**Job Applications:**
- Include link in cover letter: "To see my approach to product strategy, I've created a brief case study video..."
- Reference in "Additional Information" sections
- Send in follow-up email after initial conversation

**Client Pitches:**
- Use as introduction in proposals
- Send as pre-meeting context
- Reference during presentation

**Networking:**
- Share when asked about your work
- Use as conversation starter
- Send as follow-up after meetings

## 🔄 Iteration & Updates

### When to Update the Video

**Update if:**
- You have new compelling metrics or outcomes
- Your positioning/role target changes significantly
- Video is more than 12 months old
- Technology shown is outdated
- You have much better production capabilities now

**Don't update just because:**
- Minor wording preferences
- Small visual improvements
- Perfectionism (done is better than perfect)

### A/B Testing

If creating multiple versions, test:
- **Length**: 90 seconds vs. 4 minutes
- **Style**: Talking head vs. pure abstract
- **Tone**: Warm vs. analytical
- **CTA**: "Schedule call" vs. "View portfolio"

Track metrics:
- View completion rate
- CTA click-through rate
- Feedback/responses received

## 📊 Success Metrics

Track these to measure video effectiveness:

### Quantitative
- **Views**: How many people watched
- **Completion rate**: % who watched to end
- **CTA clicks**: How many clicked your link
- **Conversions**: How many booked calls/sent emails
- **Share rate**: How many shared the video

### Qualitative
- **Feedback**: What did viewers say?
- **Questions**: What did they ask about?
- **Objections**: What concerns did they raise?
- **Tone**: What was their response energy?

### Business Outcomes
- **Interviews**: Did it lead to conversations?
- **Offers**: Did it contribute to job offers?
- **Clients**: Did it convert to client work?
- **Network**: Did it expand your professional network?

## 🆘 Troubleshooting

### Common Issues

**Problem: Voice sounds echoey**
- **Solution**: Record in smaller room, add soft furnishings, use blankets as dampening

**Problem: Background noise in recording**
- **Solution**: Record at quiet time of day, use noise reduction carefully, re-record if severe

**Problem: Video file too large**
- **Solution**: Compress using Handbrake, reduce resolution to 1080p, optimize bitrate

**Problem: Text hard to read**
- **Solution**: Increase font size, improve contrast, add background box, choose better font

**Problem: Video feels too long**
- **Solution**: Cut to 90-second version for social, keep full version for portfolio

**Problem: Visuals don't match narration**
- **Solution**: Review visual plan timing, adjust on-screen text timing, simplify visuals

## 📚 Additional Resources

### Learning Resources
- **Video production**: LinkedIn Learning, Skillshare
- **Voiceover technique**: Voices.com blog, YouTube tutorials
- **Portfolio strategy**: Austin Kleon's "Show Your Work"

### Inspiration
Search for "technical portfolio videos" or "product demo for executives" on:
- YouTube
- Vimeo
- LinkedIn (search posts with video)

### Community
Ask for feedback in:
- r/videography
- r/careeradvice
- LinkedIn groups for your target role
- Designer/developer communities

## 🎓 Next Steps

1. **Right now**: Copy and customize `.video-config.env`
2. **Today**: Read through full script, identify sections to adapt
3. **This week**: Record voiceover, source/create B-roll
4. **Next week**: Edit video, get initial feedback
5. **Launch**: Share on portfolio, LinkedIn, relevant applications

## 💡 Remember

**This video is not just a project showcase—it's a demonstration of your ability to:**
- Understand complex problems
- Design strategic solutions
- Communicate clearly to any audience
- Execute with attention to quality
- Think about business impact, not just features

**The video itself proves you can bridge technical and business communication. Make it count.**

---

## 📞 Questions or Issues?

If you need help:
1. Review the full `HIRING_PORTFOLIO_VIDEO.md` document
2. Check environment variable configuration in `.video-config.env.example`
3. Reference the Quality Checklist section
4. Seek feedback from trusted colleagues or mentors

---

**Document Version**: 1.0  
**Last Updated**: 2024-12-20  
**License**: MIT (same as repository)

---

**Good luck with your video production! 🎬**
