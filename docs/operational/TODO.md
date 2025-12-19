# Exhaustive TODO List - Legion Command Center
*Generated: 2025-12-17*

## PHASE 1: Environment Setup (CRITICAL PATH)
- [ ] 1.1 Create root `.env` file with placeholders
  - VITE_GEMINI_API_KEY=
  - VITE_BACKEND_URL=http://localhost:5000
- [ ] 1.2 Verify backend/.env.example exists
- [ ] 1.3 Create backend/.env from example
- [ ] 1.4 Set up Postgres database `legion_command_center`
- [ ] 1.5 Configure Redis (optional)

## PHASE 2: Repository Organization
- [ ] 2.1 Create apps/ directory structure
  - [ ] apps/frontend/
  - [ ] apps/backend/ (symlink to backend/ initially)
- [x] 2.2 Move documentation to docs/
  - [x] legion-cc-v3-design-spec.md → docs/design-specs/
  - [x] legionCommandCenter-*.md → docs/research/
  - [x] CLAUDE.md, NORTH_STAR.md, OPTIMIZATIONS.md → docs/
  - [x] FRONTEND_INTEGRATION.md, LOGIC_*.md → docs/architecture/
  - [x] ORGANIZATION.md, MERGE_SUMMARY.md → docs/operational/
  - [x] Added docs/INDEX.md for documentation navigation
  - [x] Added ARCHITECTURE.md at root
- [ ] 2.3 Create tools/ directory
  - [x] Remove duplicate analyze_docs.py from root (kept in scripts/)
  - [ ] Move requirements.txt → tools/
  - [ ] Add tools/README.md with usage
- [x] 2.4 Mark prototypes as deprecated
  - [x] Add README.md to prototypes/ with deprecation notice
  - [x] Update README to reference new documentation structure
- [ ] 2.5 Consolidate root HTML files
  - [ ] Decide on index.html vs legion-v3.html entry point
  - [ ] Move legacy HTML to prototypes/

## PHASE 3: Backend Verification
- [ ] 3.1 Install backend dependencies
  - `cd backend && npm install`
- [ ] 3.2 Review database schema files
  - [ ] Check models/ directory
  - [ ] Verify migrations exist
- [ ] 3.3 Run database migrations
  - `npm run migrate` (or equivalent)
- [ ] 3.4 Seed initial data (if needed)
  - `npm run seed`
- [ ] 3.5 Add /api/v1/health endpoint
  - [ ] Add route in routes/
  - [ ] Add controller method
  - [ ] Test with curl
- [ ] 3.6 Start backend server
  - `npm run dev` (port 5000)
- [ ] 3.7 Verify all API endpoints work
  - [ ] Test strategy routes
  - [ ] Test user routes

## PHASE 4: Frontend Verification
- [ ] 4.1 Install frontend dependencies
  - `npm install` (at root)
- [ ] 4.2 Verify Vite configuration
  - [ ] Check vite.config.js
  - [ ] Ensure correct entry points
- [ ] 4.3 Test development server
  - `npm run dev` (port 3000)
- [ ] 4.4 Verify legion-v3.html loads
  - [ ] 3D scene renders
  - [ ] No console errors
- [ ] 4.5 Test Gemini API integration
  - [ ] Key prompt appears
  - [ ] localStorage saves key
  - [ ] Strategy generation works
- [ ] 4.6 Add backend connectivity check
  - [ ] Fetch /api/v1/health
  - [ ] Display status badge in UI

## PHASE 5: Testing Infrastructure
- [ ] 5.1 Backend tests
  - [ ] Review backend/tests/
  - [ ] Run `cd backend && npm test`
  - [ ] Fix any failing tests
- [ ] 5.2 Frontend tests
  - [ ] Review src/tests/
  - [ ] Run `npm run test:frontend`
  - [ ] Add missing test coverage
- [ ] 5.3 Integration tests
  - [ ] Test end-to-end flows
  - [ ] Strategy creation → API → Storage
- [ ] 5.4 Add npm script for all tests
  - `npm run test:all` already exists ✓

## PHASE 6: Code Quality
- [ ] 6.1 Linting setup
  - [ ] Verify .eslintrc.json
  - [ ] Add `npm run lint` script
  - [ ] Run and fix issues
- [ ] 6.2 Formatting
  - [ ] Verify .prettierrc
  - [ ] Add `npm run format` script
  - [ ] Format all files
- [ ] 6.3 Type checking (if using TypeScript)
  - [ ] Add tsconfig.json (if needed)
  - [ ] Run type checks

## PHASE 7: Documentation Updates
- [ ] 7.1 Update README.md
  - [ ] Reflect new directory structure
  - [ ] Update installation steps
  - [ ] Update API documentation
- [ ] 7.2 Create/update CONTRIBUTING.md
  - [ ] Development workflow
  - [ ] Code style guide
  - [ ] PR process
- [ ] 7.3 Create API documentation
  - [ ] Document all endpoints
  - [ ] Add example requests/responses
- [ ] 7.4 Update USAGE.md
  - [ ] Reflect current features
  - [ ] Add troubleshooting section

## PHASE 8: Git Hygiene
- [ ] 8.1 Review uncommitted changes
  - [ ] Stage related changes together
  - [ ] Write descriptive commit messages
- [ ] 8.2 Update .gitignore
  - [ ] Ensure .env files ignored
  - [ ] Add node_modules, dist/, etc.
- [ ] 8.3 Create feature branches for big moves
  - [ ] docs-consolidation
  - [ ] frontend-reorganization
  - [ ] tools-directory

## PHASE 9: CI/CD Pipeline
- [ ] 9.1 GitHub Actions setup
  - [ ] Create .github/workflows/test.yml
  - [ ] Add lint job
  - [ ] Add test job (frontend + backend)
- [ ] 9.2 Pre-commit hooks
  - [ ] Install husky
  - [ ] Add lint-staged
  - [ ] Configure pre-commit checks
- [ ] 9.3 Deployment preview
  - [ ] Set up Vercel/Netlify for frontend
  - [ ] Configure environment variables

## PHASE 10: Production Readiness
- [ ] 10.1 Build optimization
  - [ ] Run `npm run build`
  - [ ] Test production bundle
  - [ ] Optimize bundle size
- [ ] 10.2 Security audit
  - [ ] Run `npm audit`
  - [ ] Fix vulnerabilities
  - [ ] Review dependencies
- [ ] 10.3 Performance testing
  - [ ] Test 3D scene performance
  - [ ] Profile API response times
  - [ ] Optimize slow queries
- [ ] 10.4 Error handling
  - [ ] Add global error handlers
  - [ ] Implement logging
  - [ ] Add user-friendly error messages

## PHASE 11: Features Completion
- [ ] 11.1 TARGET ANALYSIS module
  - [x] Basic UI ✓
  - [ ] Full Gemini integration
  - [ ] Fallback mode polish
- [ ] 11.2 INTEL VISUALIZATION module
  - [ ] Design data visualization
  - [ ] Implement charts/graphs
  - [ ] Connect to backend data
- [ ] 11.3 FIELD OPERATIONS module
  - [ ] Client management UI
  - [ ] Mission tracking system
  - [ ] Dashboard metrics
- [ ] 11.4 TRAINING PROTOCOLS module
  - [ ] Knowledge base structure
  - [ ] Educational content
  - [ ] Interactive tutorials
- [ ] 11.5 DATA ARCHIVE module
  - [ ] Document browser
  - [ ] Search functionality
  - [ ] Export capabilities

## PHASE 12: Nice-to-Haves
- [ ] 12.1 Containerization
  - [ ] Create Dockerfile for backend
  - [ ] Create docker-compose.yml
  - [ ] Add Redis to compose
- [ ] 12.2 Monitoring
  - [ ] Add metrics collection
  - [ ] Set up error tracking (Sentry?)
  - [ ] Dashboard for API health
- [ ] 12.3 Advanced features
  - [ ] User authentication/authorization
  - [ ] Real-time updates (WebSockets)
  - [ ] Mobile responsiveness
  - [ ] Offline support (PWA)

---
## Immediate Next Steps (START HERE)
1. ✅ Check Node/npm/Python versions
2. Create root .env file
3. Set up backend .env
4. Install all dependencies (npm run install:all)
5. Start backend (cd backend && npm run dev)
6. Start frontend (npm run dev)
7. Verify both running and talking to each other

