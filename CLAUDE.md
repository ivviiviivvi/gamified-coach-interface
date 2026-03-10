# CLAUDE.md — gamified-coach-interface

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Legion Command Center** — gamified fitness coaching interface with a holographic 3D experience. A coach/client platform where workout goals become military-style "missions" visualized in Three.js orbital node scenes. Has a Node.js backend for document analysis and client data persistence.

## Commands

```bash
# Frontend
npm run dev          # Vite dev server
npm run build        # Vite production build
npm run test:frontend # Vitest

# Backend
npm run test:backend  # cd backend && npm test

# Both
npm run install:all  # npm install && cd backend && npm install
npm run test:all     # test:backend + test:frontend

# Utilities
npm run analyze-docs  # python3 analyze_docs.py (doc analysis)
pnpm dev              # Vite dev (alternative — pnpm-lock.yaml present)
```

## Architecture

**Frontend** (`src/`): Vanilla JS/Three.js — no React framework.
- `main.js` — Entry point, initializes scene
- `SceneManager.js` — Three.js scene, camera, renderer, lighting
- `OrbitalNodes.js` — Orbital node visualization (mission/goal nodes)
- `StrategyCore.js` — Core coaching strategy logic

Multiple prototype pages at root: `index.html`, `client.html`, `legion-command-center-evolved.html`, `legion-v3.html`

**Backend** (`backend/`): Node.js/Express
- `controllers/` — Route handlers
- `models/` — Data models
- `database/` — SQLite/database setup
- `migrations/` — Schema migrations
- `middleware/` — Auth, validation

**Python utilities**:
- `analyze_docs.py` — Document analysis script
- `requirements.txt` — Python deps
- `backend/` has its own `requirements.txt`

**Testing**: Vitest for frontend, Jest for backend (`src/tests/`).

**Config**: `.trunk/` for trunk-based linting. `.specstory/` for session history.

## Deployment

Live at **https://gamified-coach-interface.pages.dev** (Cloudflare Pages). Build: Vite output from root `index.html`. Base path changed from `/gamified-coach-interface/` to `/` for CF Pages compatibility.

<!-- ORGANVM:AUTO:START -->
## System Context (auto-generated — do not edit)

**Organ:** ORGAN-III (Commerce) | **Tier:** standard | **Status:** PUBLIC_PROCESS
**Org:** `organvm-iii-ergon` | **Repo:** `gamified-coach-interface`

### Edges
- **Produces** → `unspecified`: product
- **Produces** → `organvm-vi-koinonia/community-hub`: community_signal
- **Produces** → `organvm-vii-kerygma/social-automation`: distribution_signal

### Siblings in Commerce
`classroom-rpg-aetheria`, `trade-perpetual-future`, `fetch-familiar-friends`, `sovereign-ecosystem--real-estate-luxury`, `public-record-data-scrapper`, `search-local--happy-hour`, `multi-camera--livestream--framework`, `universal-mail--automation`, `mirror-mirror`, `the-invisible-ledger`, `enterprise-plugin`, `virgil-training-overlay`, `tab-bookmark-manager`, `a-i-chat--exporter`, `.github` ... and 12 more

### Governance
- Strictly unidirectional flow: I→II→III. No dependencies on Theory (I).

*Last synced: 2026-03-08T20:11:34Z*

## Session Review Protocol

At the end of each session that produces or modifies files:
1. Run `organvm session review --latest` to get a session summary
2. Check for unimplemented plans: `organvm session plans --project .`
3. Export significant sessions: `organvm session export <id> --slug <slug>`
4. Run `organvm prompts distill --dry-run` to detect uncovered operational patterns

Transcripts are on-demand (never committed):
- `organvm session transcript <id>` — conversation summary
- `organvm session transcript <id> --unabridged` — full audit trail
- `organvm session prompts <id>` — human prompts only


## Active Directives

| Scope | Phase | Name | Description |
|-------|-------|------|-------------|
| system | any | prompting-standards | Prompting Standards |
| system | any | research-standards-bibliography | APPENDIX: Research Standards Bibliography |
| system | any | research-standards | METADOC: Architectural Typology & Research Standards |
| system | any | sop-ecosystem | METADOC: SOP Ecosystem — Taxonomy, Inventory & Coverage |
| system | any | autopoietic-systems-diagnostics | SOP: Autopoietic Systems Diagnostics (The Mirror of Eternity) |
| system | any | cicd-resilience-and-recovery | SOP: CI/CD Pipeline Resilience & Recovery |
| system | any | cross-agent-handoff | SOP: Cross-Agent Session Handoff |
| system | any | document-audit-feature-extraction | SOP: Document Audit & Feature Extraction |
| system | any | essay-publishing-and-distribution | SOP: Essay Publishing & Distribution |
| system | any | market-gap-analysis | SOP: Full-Breath Market-Gap Analysis & Defensive Parrying |
| system | any | pitch-deck-rollout | SOP: Pitch Deck Generation & Rollout |
| system | any | promotion-and-state-transitions | SOP: Promotion & State Transitions |
| system | any | repo-onboarding-and-habitat-creation | SOP: Repo Onboarding & Habitat Creation |
| system | any | research-to-implementation-pipeline | SOP: Research-to-Implementation Pipeline (The Gold Path) |
| system | any | security-and-accessibility-audit | SOP: Security & Accessibility Audit |
| system | any | session-self-critique | session-self-critique |
| system | any | source-evaluation-and-bibliography | SOP: Source Evaluation & Annotated Bibliography (The Refinery) |
| system | any | stranger-test-protocol | SOP: Stranger Test Protocol |
| system | any | strategic-foresight-and-futures | SOP: Strategic Foresight & Futures (The Telescope) |
| system | any | typological-hermeneutic-analysis | SOP: Typological & Hermeneutic Analysis (The Archaeology) |
| unknown | any | gpt-to-os | SOP_GPT_TO_OS.md |
| unknown | any | index | SOP_INDEX.md |
| unknown | any | obsidian-sync | SOP_OBSIDIAN_SYNC.md |

Linked skills: evaluation-to-growth


**Prompting (Anthropic)**: context 200K tokens, format: XML tags, thinking: extended thinking (budget_tokens)

<!-- ORGANVM:AUTO:END -->


## ⚡ Conductor OS Integration
This repository is a managed component of the ORGANVM meta-workspace.
- **Orchestration:** Use `conductor patch` for system status and work queue.
- **Lifecycle:** Follow the `FRAME -> SHAPE -> BUILD -> PROVE` workflow.
- **Governance:** Promotions are managed via `conductor wip promote`.
- **Intelligence:** Conductor MCP tools are available for routing and mission synthesis.
