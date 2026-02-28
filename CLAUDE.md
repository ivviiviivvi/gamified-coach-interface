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

**Organ:** ORGAN-III (Commerce) | **Tier:** standard | **Status:** CANDIDATE
**Org:** `unknown` | **Repo:** `gamified-coach-interface`

### Edges
- **Produces** → `unknown`: unknown

### Siblings in Commerce
`classroom-rpg-aetheria`, `trade-perpetual-future`, `fetch-familiar-friends`, `sovereign-ecosystem--real-estate-luxury`, `public-record-data-scrapper`, `search-local--happy-hour`, `multi-camera--livestream--framework`, `universal-mail--automation`, `mirror-mirror`, `the-invisible-ledger`, `enterprise-plugin`, `virgil-training-overlay`, `tab-bookmark-manager`, `a-i-chat--exporter`, `.github` ... and 11 more

### Governance
- Strictly unidirectional flow: I→II→III. No dependencies on Theory (I).

*Last synced: 2026-02-24T12:41:28Z*
<!-- ORGANVM:AUTO:END -->
