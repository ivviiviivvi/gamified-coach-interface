---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

# Gemini CLI Instructions

## HEADERS

This section defines the standard headers to be used in all files.

## TECH STACK

- Python (3.x)
- Markdown
- docx (python-docx) - for reading docx files. Install using `pip install python-docx`.

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

This section describes how documentation is structured and accessed.
- Repository structure and cleanup plans are documented in `docs/REPO_STRUCTURE.md`.
- Steps to achieve a working prototype are tracked in `docs/WORKING_PROTOTYPE_CHECKLIST.md`.

## CODING STANDARDS

Follow PEP 8 guidelines.

## DEBUGGING

- When debugging, pay close attention to syntax errors, type checking warnings, and unused variables.
- Address syntax errors first. Always address syntax errors first.
- Type checking warnings may arise due to missing packages. Ensure all necessary packages are installed.
- Unused variables should be removed or used to avoid clutter.

## WORKFLOW & RELEASE RULES

- Before starting any task, review the current repository structure and key documentation.
- When starting a new task, begin by gathering context by reading the README.
- Perform moves in small PRs to keep diffs reviewable.
- Update import paths and Vite root when relocating the frontend app.
- After moving docs, update README links to the new locations.
- Keep `prototypes/` read-only until feature parity is confirmed in `apps/frontend`.

## BEST PRACTICES

- Create a `.env` file in the root directory with placeholders for environment variables like `VITE_GEMINI_API_KEY`, and `VITE_BACKEND_URL`.