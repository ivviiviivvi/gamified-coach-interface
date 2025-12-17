# Repository Organization Blueprint

This blueprint captures the current layout, highlights cleanup targets, and proposes an ordered structure to keep the Legion Command Center moving toward a working prototype without breaking existing flows.

## Current layout (high level)
- Frontend: `index.html`, `legion-v3.html`, `client.html`, `src/`, `vite.config.js`, `vitest.config.js`
- Backend: `backend/` (Express + Sequelize + Postgres, Redis optional)
- Prototypes: `prototypes/` (legacy HTML experiments)
- Research/strategy docs: top-level markdown files plus `docs/` subfolders (`design-specs/`, `research/`, `source-documents/`)
- Automation/scripts: `scripts/` (VS Code helper scripts, analysis helpers)
- Python utilities: `analyze_docs.py`, `requirements.txt`

## Pain points to address
- Mixed document locations (many specs in repo root instead of `docs/`)
- Duplicate/legacy HTML in `prototypes/` vs root (`index.html`, `client.html`, `legion-v3.html`)
- No shared environment contract for the frontend (Gemini key, backend URL)
- Lack of a clear path from dev to “working prototype” for both frontend and backend

## Proposed organized structure (no moves yet)
```
gamified-coach-interface/
├── apps/
│   ├── frontend/           # Vite app + static holographic interface (move: src/, html entry points, vite.config.js)
│   └── backend/            # Existing Express API
├── docs/                   # All design/research/operational docs
│   ├── design-specs/       # UI/UX specs, interface drafts
│   ├── research/           # Market + niche research
│   └── source-documents/   # Raw ingested docs
├── prototypes/             # Legacy experiments; keep but mark deprecated
├── scripts/                # Dev ergonomics, setup helpers
├── tools/                  # Python utilities (move: analyze_docs.py, requirements.txt)
└── verification/           # Tests, audits, smoke scripts
```

## Suggested moves (safe batches)
1) **Docs consolidation**: Move `legion-cc-v3-design-spec.md`, `legionCommandCenter-applicationDrafts_‎Gemini.md`, `legionCommandCenter-fitnessNicheResearch_‎Gemini.md`, `CLAUDE.md`, `NORTH_STAR.md`, `OPTIMIZATIONS.md`, `ORGANIZATION.md`, `FRONTEND_INTEGRATION.md`, `LOGIC_*` into `docs/` (keep subfolders by theme: design-specs/, research/, ops/).
2) **Frontend app folder**: Create `apps/frontend` and move `src/`, `index.html`, `legion-v3.html`, `client.html`, `vite.config.js`, `vitest.config.js`, `package.json`, `pnpm-lock.yaml` (or `package-lock.json`) there; adjust package scripts to use the new root and Vite root.
3) **Backend alignment**: Keep `apps/backend` mapped to current `backend/`; expose a single `.env.example` at repo root that points to `apps/backend/.env` for production.
4) **Tools**: Move `analyze_docs.py` + `requirements.txt` into `tools/` with a short README; add a `Makefile` or `npm` script alias to run it.
5) **Prototypes**: Tag files in `prototypes/` as deprecated and link to their replacements (or delete after confirming).

## Delivery checkpoints toward a working prototype
- ✅ Frontend: `npm install && npm run dev` serves `legion-v3.html` at port 3000 with Gemini key picked up from `.env`.
- ✅ Backend: `cd backend && npm install && npm run dev` boots API on port 5000 against Postgres + Redis (optional).
- 🔜 Wiring: add a small `/healthz` fetch in the frontend to verify API connectivity and surface status in UI.
- 🔜 CI: add lint + test steps (Vitest, Jest) to GitHub Actions and enforce formatting (.prettierrc already present).

## Migration notes
- Perform moves in small PRs to keep diffs reviewable.
- Update import paths and Vite root when relocating the frontend app.
- After moving docs, update README links to the new locations.
- Keep `prototypes/` read-only until feature parity is confirmed in `apps/frontend`.
