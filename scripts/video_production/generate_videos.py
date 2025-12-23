#!/usr/bin/env python3
"""
Autonomous Video Production Agent
Generates finished MP4 videos from repository scripts using local-first workflow.

This script implements a fully automated video production pipeline:
1. Script scanning and parsing
2. Narration audio generation (TTS)
3. Visual footage generation (demo capture, diagrams, title cards)
4. Timeline synchronization
5. Final MP4 rendering with FFmpeg
"""

import os
import sys
import json
import logging
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
import subprocess
import glob

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class VideoConfig:
    """Configuration for video production from environment variables."""
    repo_root: Path
    script_dir: Path
    script_pattern: str
    demo_url: Optional[str]
    video_out_dir: Path
    voice_mode: str
    voice_sample_wav: Optional[Path]
    video_resolution: str
    fps: int
    llm_mode: str
    headless: bool
    
    @classmethod
    def from_env(cls) -> 'VideoConfig':
        """Create configuration from environment variables."""
        repo_root = Path(os.getenv('REPO_ROOT', os.getcwd()))
        script_dir = Path(os.getenv('SCRIPT_DIR', repo_root))
        
        return cls(
            repo_root=repo_root,
            script_dir=script_dir,
            script_pattern=os.getenv('SCRIPT_PATTERN', '*.md'),
            demo_url=os.getenv('DEMO_URL'),
            video_out_dir=Path(os.getenv('VIDEO_OUT_DIR', repo_root / 'video_output')),
            voice_mode=os.getenv('VOICE_MODE', 'local_tts'),
            voice_sample_wav=Path(os.getenv('VOICE_SAMPLE_WAV')) if os.getenv('VOICE_SAMPLE_WAV') else None,
            video_resolution=os.getenv('VIDEO_RESOLUTION', '1920x1080'),
            fps=int(os.getenv('FPS', '30')),
            llm_mode=os.getenv('LLM_MODE', 'local_llm'),
            headless=os.getenv('HEADLESS', 'true').lower() == 'true'
        )


@dataclass
class ScriptScene:
    """Represents a scene parsed from a script."""
    index: int
    title: str
    content: str
    timecode: Optional[str] = None
    duration_estimate: float = 0.0


@dataclass
class VideoJob:
    """Represents a complete video production job."""
    script_path: Path
    scenes: List[ScriptScene] = field(default_factory=list)
    audio_path: Optional[Path] = None
    video_clips: List[Path] = field(default_factory=list)
    final_output: Optional[Path] = None
    render_log: List[str] = field(default_factory=list)
    fallbacks_used: List[str] = field(default_factory=list)


class ScriptParser:
    """Parse video scripts and extract scenes."""
    
    @staticmethod
    def parse_script(script_path: Path) -> List[ScriptScene]:
        """
        Parse a markdown script file and extract scenes.
        
        Detects:
        - Headings (## or ###) as scene markers
        - Timecodes in format [MM:SS-MM:SS]
        - Paragraph breaks as conservative scene boundaries
        """
        logger.info(f"Parsing script: {script_path}")
        
        with open(script_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        scenes = []
        scene_index = 0
        
        # Split by headings
        heading_pattern = r'^#{2,3}\s+(.+?)$'
        sections = re.split(heading_pattern, content, flags=re.MULTILINE)
        
        # If no headings found, split by paragraph breaks
        if len(sections) <= 1:
            logger.info("No headings found, using paragraph breaks")
            scenes = ScriptParser._parse_by_paragraphs(content)
        else:
            # Process heading-based sections
            for i in range(1, len(sections), 2):
                if i < len(sections):
                    title = sections[i].strip()
                    scene_content = sections[i + 1].strip() if i + 1 < len(sections) else ""
                    
                    if scene_content:
                        # Extract timecode if present
                        timecode_match = re.search(r'\[(\d+:\d+-\d+:\d+)\]', title)
                        timecode = timecode_match.group(1) if timecode_match else None
                        
                        # Estimate duration based on word count (150 words per minute)
                        word_count = len(scene_content.split())
                        duration = (word_count / 150) * 60  # seconds
                        
                        scenes.append(ScriptScene(
                            index=scene_index,
                            title=title,
                            content=scene_content,
                            timecode=timecode,
                            duration_estimate=duration
                        ))
                        scene_index += 1
        
        logger.info(f"Parsed {len(scenes)} scenes from {script_path.name}")
        return scenes
    
    @staticmethod
    def _parse_by_paragraphs(content: str) -> List[ScriptScene]:
        """Parse script by paragraph breaks when no headings exist."""
        scenes = []
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        for idx, paragraph in enumerate(paragraphs):
            if len(paragraph) > 20:  # Minimum content length
                word_count = len(paragraph.split())
                duration = (word_count / 150) * 60
                
                # Use first 50 chars as title
                title = paragraph[:50] + "..." if len(paragraph) > 50 else paragraph
                
                scenes.append(ScriptScene(
                    index=idx,
                    title=title,
                    content=paragraph,
                    duration_estimate=duration
                ))
        
        return scenes


class AudioGenerator:
    """Generate narration audio using text-to-speech."""
    
    def __init__(self, config: VideoConfig):
        self.config = config
    
    def generate_narration(self, job: VideoJob) -> Path:
        """
        Generate audio narration from script scenes.
        Uses local TTS (pyttsx3 or espeak) for text-to-speech.
        """
        logger.info(f"Generating narration for {job.script_path.name}")
        
        # Create audio output directory
        audio_dir = self.config.video_out_dir / 'audio'
        audio_dir.mkdir(parents=True, exist_ok=True)
        
        # Combine all scene content
        full_text = "\n\n".join([scene.content for scene in job.scenes])
        
        # Output audio path
        audio_path = audio_dir / f"{job.script_path.stem}_narration.wav"
        
        # Try using espeak first (more commonly available)
        try:
            self._generate_with_espeak(full_text, audio_path)
            job.render_log.append(f"Generated audio with espeak: {audio_path}")
            logger.info(f"Audio generated successfully: {audio_path}")
            return audio_path
        except Exception as e:
            logger.warning(f"espeak failed: {e}, trying pyttsx3")
            job.fallbacks_used.append("TTS: espeak -> pyttsx3")
            
            try:
                self._generate_with_pyttsx3(full_text, audio_path)
                job.render_log.append(f"Generated audio with pyttsx3: {audio_path}")
                logger.info(f"Audio generated successfully: {audio_path}")
                return audio_path
            except Exception as e2:
                logger.error(f"All TTS methods failed: {e2}")
                job.fallbacks_used.append("TTS: All methods failed, using silence")
                # Generate silent audio as last resort
                return self._generate_silent_audio(audio_path, sum(s.duration_estimate for s in job.scenes))
    
    def _generate_with_espeak(self, text: str, output_path: Path):
        """Generate audio using espeak command line tool."""
        # Write text to temp file
        temp_text = output_path.parent / f"{output_path.stem}_temp.txt"
        with open(temp_text, 'w', encoding='utf-8') as f:
            f.write(text)
        
        # Run espeak
        cmd = [
            'espeak',
            '-f', str(temp_text),
            '-w', str(output_path),
            '-s', '150',  # Speed: 150 words per minute
            '-v', 'en-us'  # US English voice
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        # Clean up temp file
        temp_text.unlink(missing_ok=True)
        
        if result.returncode != 0:
            raise RuntimeError(f"espeak failed: {result.stderr}")
    
    def _generate_with_pyttsx3(self, text: str, output_path: Path):
        """Generate audio using pyttsx3 library."""
        try:
            import pyttsx3
        except ImportError:
            raise ImportError("pyttsx3 not installed. Install with: pip install pyttsx3")
        
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)  # 150 words per minute
        engine.save_to_file(text, str(output_path))
        engine.runAndWait()
    
    def _generate_silent_audio(self, output_path: Path, duration: float) -> Path:
        """Generate silent audio file as fallback."""
        cmd = [
            'ffmpeg', '-y',
            '-f', 'lavfi',
            '-i', f'anullsrc=r=44100:cl=stereo',
            '-t', str(int(duration)),
            '-acodec', 'pcm_s16le',
            str(output_path)
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        logger.warning(f"Generated silent audio: {output_path}")
        return output_path


class VisualGenerator:
    """Generate visual footage for video scenes."""
    
    def __init__(self, config: VideoConfig):
        self.config = config
    
    def generate_visuals(self, job: VideoJob) -> List[Path]:
        """
        Generate visual footage for all scenes.
        Priority order:
        1. Live demo capture from demo URL
        2. Local app run if no demo URL
        3. Repository visualization/diagrams
        4. Static title and impact cards
        """
        logger.info(f"Generating visuals for {job.script_path.name}")
        
        visuals_dir = self.config.video_out_dir / 'visuals'
        visuals_dir.mkdir(parents=True, exist_ok=True)
        
        video_clips = []
        
        # Try demo capture first
        if self.config.demo_url:
            try:
                clips = self._capture_demo(job, visuals_dir)
                video_clips.extend(clips)
                job.render_log.append(f"Captured {len(clips)} demo clips")
                return video_clips
            except Exception as e:
                logger.warning(f"Demo capture failed: {e}")
                job.fallbacks_used.append("Visuals: Demo capture failed, using static cards")
        
        # Fall back to static title cards
        clips = self._generate_title_cards(job, visuals_dir)
        video_clips.extend(clips)
        job.render_log.append(f"Generated {len(clips)} static title cards")
        
        return video_clips
    
    def _capture_demo(self, job: VideoJob, output_dir: Path) -> List[Path]:
        """Capture demo using browser automation (placeholder for now)."""
        # This would use playwright/selenium for actual capture
        # For now, return empty to fall back to title cards
        logger.info("Demo capture not yet implemented, falling back to title cards")
        raise NotImplementedError("Demo capture requires playwright/selenium")
    
    def _generate_title_cards(self, job: VideoJob, output_dir: Path) -> List[Path]:
        """Generate static title cards for each scene using FFmpeg."""
        clips = []
        
        width, height = map(int, self.config.video_resolution.split('x'))
        
        for scene in job.scenes:
            # Create title card image
            clip_path = output_dir / f"{job.script_path.stem}_scene_{scene.index:03d}.mp4"
            
            # Use FFmpeg to create a title card video
            duration = max(scene.duration_estimate, 3.0)  # Minimum 3 seconds
            
            # Clean title text for display
            title_text = scene.title.replace("'", "\\'").replace('"', '\\"')[:80]
            
            cmd = [
                'ffmpeg', '-y',
                '-f', 'lavfi',
                '-i', f'color=c=0x0a0a1a:s={width}x{height}:r={self.config.fps}',
                '-vf', f"drawtext=text='{title_text}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                '-t', str(duration),
                '-pix_fmt', 'yuv420p',
                str(clip_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                clips.append(clip_path)
                logger.info(f"Generated title card: {clip_path.name}")
            else:
                logger.error(f"Failed to generate title card: {result.stderr}")
        
        return clips
    
    def _generate_impact_card(self, text: str, output_path: Path, duration: float):
        """Generate a single impact/metric card."""
        width, height = map(int, self.config.video_resolution.split('x'))
        
        cmd = [
            'ffmpeg', '-y',
            '-f', 'lavfi',
            '-i', f'color=c=0x00f5ff:s={width}x{height}:r={self.config.fps}',
            '-vf', f"drawtext=text='{text}':fontcolor=0x0a0a1a:fontsize=64:x=(w-text_w)/2:y=(h-text_h)/2:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            '-t', str(duration),
            '-pix_fmt', 'yuv420p',
            str(output_path)
        ]
        
        subprocess.run(cmd, capture_output=True, check=True)


class VideoRenderer:
    """Render final video from audio and visual components."""
    
    def __init__(self, config: VideoConfig):
        self.config = config
    
    def render_video(self, job: VideoJob) -> Path:
        """
        Synchronize narration and visuals into a coherent timeline.
        Render final MP4 using FFmpeg.
        """
        logger.info(f"Rendering final video for {job.script_path.name}")
        
        if not job.audio_path or not job.video_clips:
            raise ValueError("Cannot render video without audio and video clips")
        
        # Output path
        output_path = self.config.video_out_dir / f"{job.script_path.stem}.mp4"
        
        # Create concat file for video clips
        concat_file = self.config.video_out_dir / f"{job.script_path.stem}_concat.txt"
        with open(concat_file, 'w') as f:
            for clip in job.video_clips:
                f.write(f"file '{clip.absolute()}'\n")
        
        # Concatenate video clips
        temp_video = self.config.video_out_dir / f"{job.script_path.stem}_temp.mp4"
        cmd = [
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(concat_file),
            '-c', 'copy',
            str(temp_video)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            logger.error(f"Video concatenation failed: {result.stderr}")
            raise RuntimeError("Video concatenation failed")
        
        # Combine video with audio
        width, height = map(int, self.config.video_resolution.split('x'))
        cmd = [
            'ffmpeg', '-y',
            '-i', str(temp_video),
            '-i', str(job.audio_path),
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
            '-vf', f'scale={width}:{height}',
            '-r', str(self.config.fps),
            str(output_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        # Clean up temporary files
        temp_video.unlink(missing_ok=True)
        concat_file.unlink(missing_ok=True)
        
        if result.returncode != 0:
            logger.error(f"Final rendering failed: {result.stderr}")
            raise RuntimeError(f"Final rendering failed: {result.stderr}")
        
        logger.info(f"Video rendered successfully: {output_path}")
        job.final_output = output_path
        job.render_log.append(f"Final video: {output_path}")
        
        return output_path


class VideoProductionAgent:
    """Main video production automation agent."""
    
    def __init__(self, config: VideoConfig):
        self.config = config
        self.audio_generator = AudioGenerator(config)
        self.visual_generator = VisualGenerator(config)
        self.video_renderer = VideoRenderer(config)
    
    def find_scripts(self) -> List[Path]:
        """Find all scripts matching the pattern."""
        script_paths = list(self.config.script_dir.glob(self.config.script_pattern))
        logger.info(f"Found {len(script_paths)} scripts matching pattern '{self.config.script_pattern}'")
        return script_paths
    
    def process_script(self, script_path: Path) -> VideoJob:
        """Process a single script through the entire pipeline."""
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing script: {script_path.name}")
        logger.info(f"{'='*60}\n")
        
        job = VideoJob(script_path=script_path)
        
        try:
            # Step 1: Parse script
            job.scenes = ScriptParser.parse_script(script_path)
            if not job.scenes:
                logger.warning(f"No scenes found in {script_path.name}, skipping")
                job.render_log.append("ERROR: No scenes parsed from script")
                return job
            
            # Step 2: Generate audio narration
            try:
                job.audio_path = self.audio_generator.generate_narration(job)
            except Exception as e:
                logger.error(f"Audio generation failed: {e}")
                job.render_log.append(f"ERROR: Audio generation failed: {e}")
                job.fallbacks_used.append("Audio generation failed completely")
                return job
            
            # Step 3: Generate visuals
            try:
                job.video_clips = self.visual_generator.generate_visuals(job)
                if not job.video_clips:
                    logger.error("No video clips generated")
                    job.render_log.append("ERROR: No video clips generated")
                    return job
            except Exception as e:
                logger.error(f"Visual generation failed: {e}")
                job.render_log.append(f"ERROR: Visual generation failed: {e}")
                return job
            
            # Step 4: Render final video
            try:
                job.final_output = self.video_renderer.render_video(job)
                job.render_log.append("SUCCESS: Video rendered successfully")
            except Exception as e:
                logger.error(f"Video rendering failed: {e}")
                job.render_log.append(f"ERROR: Video rendering failed: {e}")
                return job
            
        except Exception as e:
            logger.error(f"Unexpected error processing {script_path.name}: {e}")
            job.render_log.append(f"ERROR: Unexpected error: {e}")
        
        return job
    
    def generate_render_log(self, job: VideoJob) -> str:
        """Generate a summary render log for the job."""
        log_lines = [
            f"{'='*60}",
            f"RENDER LOG: {job.script_path.name}",
            f"{'='*60}",
            f"",
            f"INPUT:",
            f"  Script: {job.script_path}",
            f"  Scenes: {len(job.scenes)}",
            f"",
            f"OUTPUT:",
            f"  Audio: {job.audio_path}",
            f"  Video clips: {len(job.video_clips)}",
            f"  Final video: {job.final_output}",
            f"",
            f"FALLBACKS USED:",
        ]
        
        if job.fallbacks_used:
            for fallback in job.fallbacks_used:
                log_lines.append(f"  - {fallback}")
        else:
            log_lines.append("  None")
        
        log_lines.extend([
            f"",
            f"RENDER STEPS:",
        ])
        
        for log_entry in job.render_log:
            log_lines.append(f"  - {log_entry}")
        
        log_lines.append(f"{'='*60}\n")
        
        return "\n".join(log_lines)
    
    def run(self):
        """Execute the complete video production pipeline."""
        logger.info("Starting Video Production Agent")
        logger.info(f"Repository root: {self.config.repo_root}")
        logger.info(f"Script directory: {self.config.script_dir}")
        logger.info(f"Output directory: {self.config.video_out_dir}")
        
        # Create output directory
        self.config.video_out_dir.mkdir(parents=True, exist_ok=True)
        
        # Find all scripts
        scripts = self.find_scripts()
        
        if not scripts:
            logger.error(f"No scripts found matching pattern '{self.config.script_pattern}' in {self.config.script_dir}")
            return
        
        # Process each script
        jobs = []
        for script_path in scripts:
            job = self.process_script(script_path)
            jobs.append(job)
            
            # Write individual render log
            log_path = self.config.video_out_dir / f"{script_path.stem}_render_log.txt"
            with open(log_path, 'w') as f:
                f.write(self.generate_render_log(job))
            
            logger.info(f"Render log saved: {log_path}")
        
        # Write summary report
        summary_path = self.config.video_out_dir / "production_summary.txt"
        with open(summary_path, 'w') as f:
            f.write("VIDEO PRODUCTION SUMMARY\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"Total scripts processed: {len(jobs)}\n")
            successful = sum(1 for job in jobs if job.final_output)
            f.write(f"Successful renders: {successful}\n")
            f.write(f"Failed renders: {len(jobs) - successful}\n\n")
            
            f.write("OUTPUTS:\n")
            for job in jobs:
                f.write(f"\n{job.script_path.name}:\n")
                if job.final_output:
                    f.write(f"  ✓ {job.final_output}\n")
                else:
                    f.write(f"  ✗ Failed to render\n")
        
        logger.info(f"\n{'='*60}")
        logger.info(f"Production complete! Summary: {summary_path}")
        logger.info(f"{'='*60}\n")


def main():
    """Main entry point for video production agent."""
    try:
        # Load configuration from environment
        config = VideoConfig.from_env()
        
        # Create and run agent
        agent = VideoProductionAgent(config)
        agent.run()
        
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
