# Automated Video Production System

## Overview

This directory contains a fully automated video production agent that generates finished MP4 videos from repository-provided scripts. The system is designed for local-first, execution-capable workflows suitable for creating walkthrough or portfolio videos for non-technical hiring decision-makers.

## Quick Start

1. **Copy the configuration template:**
   ```bash
   cp .video-production.env.example .video-production.env
   ```

2. **Customize the configuration** (optional):
   Edit `.video-production.env` to set your preferences

3. **Run the video production agent:**
   ```bash
   ./scripts/produce_videos.sh
   ```

## System Architecture

The video production system consists of several components:

### 1. Script Parser (`ScriptParser`)
- Scans and identifies scripts matching the pattern
- Parses structural intent (headings, scene markers, timestamps)
- Falls back to paragraph-based scene detection if no structure exists
- Estimates scene duration based on word count (150 words/minute)

### 2. Audio Generator (`AudioGenerator`)
- Generates narration audio using local text-to-speech
- Primary: espeak (command-line TTS)
- Fallback: pyttsx3 (Python TTS library)
- Last resort: Silent audio with correct duration
- Does not paraphrase content - uses script as-is

### 3. Visual Generator (`VisualGenerator`)
- Priority order for visual generation:
  1. Live demo capture from `$DEMO_URL` (if provided)
  2. Local app run (if demo URL absent)
  3. Repository visualization/diagrams
  4. Static title and impact cards (current implementation)
- Creates professional title cards with scene information
- Uses FFmpeg for video generation

### 4. Video Renderer (`VideoRenderer`)
- Synchronizes narration and visuals into coherent timeline
- Each scene corresponds to narration timing
- Renders final MP4 using FFmpeg at specified resolution and FPS
- Ensures clean cuts, readable text, and stable audio levels

### 5. Main Agent (`VideoProductionAgent`)
- Orchestrates the complete pipeline
- Processes each script independently
- Generates comprehensive render logs
- Handles failures gracefully with fallbacks

## Configuration

Environment variables are loaded from `.video-production.env`:

```bash
# Required
REPO_ROOT="<absolute path to repo>"
SCRIPT_DIR="<path containing scripts>"
SCRIPT_PATTERN="<e.g., *.md or *VIDEO*.md>"
VIDEO_OUT_DIR="<output directory>"

# Video Settings
VIDEO_RESOLUTION="1920x1080"  # Default resolution
FPS="30"                       # Frames per second

# Voice/TTS
VOICE_MODE="local_tts"         # Use local text-to-speech
VOICE_SAMPLE_WAV=""            # Optional voice sample

# Optional
DEMO_URL=""                    # Deployed app URL for demo capture
LLM_MODE="local_llm"          # For future AI enhancements
HEADLESS="true"               # Headless browser mode
```

## Dependencies

### Required
- **Python 3.7+**: Core runtime
- **FFmpeg**: Video rendering and manipulation
  ```bash
  sudo apt-get install ffmpeg
  ```

### Recommended
- **espeak**: Text-to-speech audio generation
  ```bash
  sudo apt-get install espeak
  ```

### Optional
- **pyttsx3**: Alternative TTS (Python library)
  ```bash
  pip install pyttsx3
  ```
- **Playwright/Selenium**: For demo capture (not yet implemented)

## Usage

### Basic Usage

Run with default settings:
```bash
./scripts/produce_videos.sh
```

### Custom Configuration

1. Create custom config:
   ```bash
   cp .video-production.env.example .video-production.env
   nano .video-production.env
   ```

2. Set your preferences:
   ```bash
   SCRIPT_PATTERN="HIRING*.md"
   VIDEO_RESOLUTION="3840x2160"
   FPS="60"
   ```

3. Run production:
   ```bash
   ./scripts/produce_videos.sh
   ```

### Direct Python Execution

For more control:
```bash
export REPO_ROOT="/path/to/repo"
export SCRIPT_DIR="/path/to/scripts"
export SCRIPT_PATTERN="*.md"
export VIDEO_OUT_DIR="/path/to/output"

python3 scripts/video_production/generate_videos.py
```

## Output Structure

The system generates the following outputs in `$VIDEO_OUT_DIR`:

```
video_output/
├── audio/
│   ├── SCRIPT_NAME_narration.wav
│   └── ...
├── visuals/
│   ├── SCRIPT_NAME_scene_000.mp4
│   ├── SCRIPT_NAME_scene_001.mp4
│   └── ...
├── SCRIPT_NAME.mp4                    # Final rendered video
├── SCRIPT_NAME_render_log.txt         # Individual render log
└── production_summary.txt             # Overall summary
```

## Deliverables

For each script, the system produces:

1. **Finalized MP4 video** - Ready to share
2. **Render log** - Summary of inputs, fallbacks, and output paths
3. **Audio files** - Narration audio (for reference)
4. **Visual clips** - Individual scene videos (for reference)

## Script Format

Scripts should be markdown files with either:

### Option 1: Heading-Based Structure
```markdown
## Scene 1: Introduction
This is the narration for scene 1.

## Scene 2: Problem Statement
This is the narration for scene 2.

### [0:30-1:00] Key Insight
This scene has an explicit timecode.
```

### Option 2: Paragraph-Based (Automatic)
```markdown
This is the first scene. It will be automatically detected
as a separate scene.

This is the second scene. The system conservatively breaks
on paragraph boundaries.
```

## Quality Constraints

The system ensures:

- ✅ Videos are understandable by non-technical viewers
- ✅ No code editors or terminal views (unless script requests)
- ✅ No placeholder assets, watermarks, or draft indicators
- ✅ Clean cuts, readable text, and stable audio levels
- ✅ Appropriate scene duration based on narration length

## Failure Handling

The system handles failures gracefully:

1. **TTS Failure**: Retries with alternative methods, falls back to silent audio
2. **Demo Capture Failure**: Falls back to static diagrams and title cards
3. **Rendering Failure**: Outputs logs and partial artifacts

All failures are logged with:
- Detailed error messages
- Fallback methods used
- Partial outputs for debugging

## Render Logs

Each video production generates a detailed log:

```
============================================================
RENDER LOG: SCRIPT_NAME.md
============================================================

INPUT:
  Script: /path/to/script.md
  Scenes: 8

OUTPUT:
  Audio: /path/to/audio.wav
  Video clips: 8
  Final video: /path/to/final.mp4

FALLBACKS USED:
  - Visuals: Demo capture failed, using static cards

RENDER STEPS:
  - Generated audio with espeak: ...
  - Generated 8 static title cards
  - Final video: /path/to/output.mp4
  - SUCCESS: Video rendered successfully
============================================================
```

## Troubleshooting

### No scripts found
**Problem**: System can't find scripts matching pattern
**Solution**: 
- Check `SCRIPT_DIR` is correct
- Verify `SCRIPT_PATTERN` matches your script filenames
- Use absolute paths

### FFmpeg errors
**Problem**: Video rendering fails
**Solution**:
- Ensure FFmpeg is installed: `ffmpeg -version`
- Check font files exist: `/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`
- Verify disk space in output directory

### TTS failures
**Problem**: Audio generation fails
**Solution**:
- Install espeak: `sudo apt-get install espeak`
- Or install pyttsx3: `pip install pyttsx3`
- System will use silent audio as last resort

### Low quality output
**Problem**: Videos look poor quality
**Solution**:
- Increase resolution: `VIDEO_RESOLUTION="3840x2160"`
- Increase FPS: `FPS="60"`
- Check source script formatting

## Future Enhancements

Planned features:

- [ ] Demo capture using Playwright/Selenium
- [ ] LLM-powered scene optimization
- [ ] Voice cloning from sample WAV
- [ ] Advanced diagram generation
- [ ] Subtitle/caption overlay
- [ ] Background music integration
- [ ] Transition effects
- [ ] Multi-language support

## Examples

### Example 1: Process all video scripts
```bash
export SCRIPT_PATTERN="*VIDEO*.md"
./scripts/produce_videos.sh
```

### Example 2: High-quality rendering
```bash
export VIDEO_RESOLUTION="3840x2160"
export FPS="60"
./scripts/produce_videos.sh
```

### Example 3: Specific script directory
```bash
export SCRIPT_DIR="/path/to/video-scripts"
export SCRIPT_PATTERN="*.md"
./scripts/produce_videos.sh
```

## Performance

Typical processing times (on standard hardware):

- Script parsing: < 1 second
- Audio generation (espeak): 2-5 seconds per minute of narration
- Visual generation (title cards): 1-2 seconds per scene
- Video rendering: 10-30 seconds per minute of final video

Total: Approximately 30-60 seconds per minute of final video.

## License

This video production system is part of the Legion Command Center repository and is licensed under the MIT License.

## Support

For issues or questions:
1. Check render logs in output directory
2. Review troubleshooting section above
3. Open an issue in the repository
4. Include render logs and error messages

---

**Built for**: Automated, local-first video production  
**Target audience**: Non-technical hiring decision-makers  
**Quality focus**: Professional, shareable MP4 videos
