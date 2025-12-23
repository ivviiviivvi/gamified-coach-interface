#!/bin/bash
# Video Production Agent Entry Point
# Automated video generation from repository scripts

set -euo pipefail

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source configuration from .video-config.env if exists
if [ -f "$REPO_ROOT/.video-config.env" ]; then
    echo "Loading configuration from .video-config.env"
    set -a
    source "$REPO_ROOT/.video-config.env"
    set +a
else
    echo "WARNING: .video-config.env not found, using defaults"
fi

# Set default environment variables if not set
export REPO_ROOT="${REPO_ROOT}"
export SCRIPT_DIR="${SCRIPT_DIR:-$REPO_ROOT}"
export SCRIPT_PATTERN="${SCRIPT_PATTERN:-*VIDEO*.md}"
export DEMO_URL="${DEMO_URL:-}"
export VIDEO_OUT_DIR="${VIDEO_OUT_DIR:-$REPO_ROOT/video_output}"
export VOICE_MODE="${VOICE_MODE:-local_tts}"
export VOICE_SAMPLE_WAV="${VOICE_SAMPLE_WAV:-}"
export VIDEO_RESOLUTION="${VIDEO_RESOLUTION:-1920x1080}"
export FPS="${FPS:-30}"
export LLM_MODE="${LLM_MODE:-local_llm}"
export HEADLESS="${HEADLESS:-true}"

echo "============================================"
echo "VIDEO PRODUCTION AGENT"
echo "============================================"
echo "Repository Root: $REPO_ROOT"
echo "Script Directory: $SCRIPT_DIR"
echo "Script Pattern: $SCRIPT_PATTERN"
echo "Output Directory: $VIDEO_OUT_DIR"
echo "Resolution: $VIDEO_RESOLUTION @ ${FPS}fps"
echo "Voice Mode: $VOICE_MODE"
echo "============================================"
echo ""

# Check dependencies
echo "Checking dependencies..."

# Check FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "ERROR: ffmpeg is required but not installed."
    echo "Install with: sudo apt-get install ffmpeg"
    exit 1
fi
echo "✓ FFmpeg installed"

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is required but not installed."
    exit 1
fi
echo "✓ Python 3 installed"

# Check espeak (optional but recommended)
if command -v espeak &> /dev/null; then
    echo "✓ espeak installed (TTS available)"
else
    echo "⚠ espeak not found (will try pyttsx3 or silent fallback)"
fi

echo ""
echo "Starting video production..."
echo ""

# Run the Python video production agent
python3 "$SCRIPT_DIR/video_production/generate_videos.py"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "✓ Video production completed successfully!"
    echo "============================================"
    echo "Output directory: $VIDEO_OUT_DIR"
    echo ""
    ls -lh "$VIDEO_OUT_DIR"/*.mp4 2>/dev/null || echo "No MP4 files found (check logs for errors)"
else
    echo ""
    echo "============================================"
    echo "✗ Video production failed with exit code: $exit_code"
    echo "============================================"
    echo "Check logs in: $VIDEO_OUT_DIR"
fi

exit $exit_code
