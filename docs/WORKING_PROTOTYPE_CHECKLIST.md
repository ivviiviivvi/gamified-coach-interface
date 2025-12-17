# Working Prototype Checklist

A pragmatic, stepwise list to get the Legion Command Center running end-to-end. Use this as a living log; check off items as you go.

## 0) Prereqs
- Node.js 18+
- Python 3.11+ (for docs tooling)
- Postgres 14+
- (Optional) Redis for caching
- Google Gemini API key

## 1) Environment
- [ ] Copy `.env` -> fill `VITE_GEMINI_API_KEY` and `VITE_BACKEND_URL`
- [ ] Copy `backend/.env.example` -> `backend/.env`; fill DB + JWT secrets
- [ ] Ensure Postgres database `legion_command_center` exists (`psql -c "CREATE DATABASE legion_command_center;"`)

## 2) Backend bring-up
- [ ] `cd backend && npm install`
- [ ] Run migrations/seed (`npm run migrate`, `npm run seed`) once schema files are ready
- [ ] Start API (`npm run dev`) and confirm `GET http://localhost:5000/api/v1/health` (add route if missing)

## 3) Frontend bring-up (V3 holographic UI)
- [ ] `npm install` at repo root
- [ ] `npm run dev` (opens `http://localhost:3000/legion-v3.html`)
- [ ] Verify Gemini key prompt stores to `localStorage`
- [ ] Add a simple API connectivity badge: fetch `/api/v1/health` from `VITE_BACKEND_URL`

## 4) Prototypes/legacy hygiene
- [ ] Mark `prototypes/` as deprecated in README once V3 covers required flows
- [ ] Move design/research docs into `docs/` subfolders (see `docs/REPO_STRUCTURE.md`)

## 5) Quality gates
- [ ] Add lint/test scripts to CI (Vitest + Jest)
- [ ] Add `npm run test:all` to pre-push hook (or run manually)
- [ ] Smoke test: target analysis flow completes with Gemini key; fallback renders without key

## 6) Nice-to-haves
- [ ] Deploy preview (Vercel/Netlify) for frontend
- [ ] Containerize backend (Dockerfile + docker-compose for Postgres/Redis)
- [ ] Metrics: add minimal logging to monitor Gemini/API latency
