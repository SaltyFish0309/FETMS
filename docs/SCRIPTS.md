# Scripts Reference

Complete reference for all npm scripts available in the FETMS project.

## Quick Reference

| Script | Location | Command | Description |
|--------|----------|---------|-------------|
| `dev` | Root | `npm run dev` | Start full stack development servers |
| `install:all` | Root | `npm run install:all` | Install all project dependencies |
| `server` | Backend | `npm run server --prefix backend` | Start backend development server |
| `test` | Backend | `npm run test --prefix backend` | Run backend tests |
| `build` | Backend | `npm run build --prefix backend` | Build backend for production |
| `migrate:projects` | Backend | `npm run migrate:projects --prefix backend` | Migrate project data |
| `dev` | Frontend | `npm run dev --prefix frontend` | Start frontend development server |
| `build` | Frontend | `npm run build --prefix frontend` | Build frontend for production |
| `lint` | Frontend | `npm run lint --prefix frontend` | Lint frontend code |
| `preview` | Frontend | `npm run preview --prefix frontend` | Preview production build |
| `test` | Frontend | `npm run test --prefix frontend` | Run frontend tests |

---

## Root Scripts

Source: `package.json` in project root

### Development Scripts

#### `npm run dev`
**Full command:** `concurrently "npm run server --prefix backend" "npm run dev --prefix frontend"`

**Purpose:** Start both backend and frontend development servers concurrently

**What it does:**
- Starts backend server on port 5000
- Starts frontend dev server on port 5173
- Runs both processes in parallel with colored output
- Auto-restarts on file changes

**When to use:**
- Starting local development environment
- Full-stack development workflow
- Testing frontend-backend integration

**Requirements:**
- MongoDB running on localhost:27017
- Backend `.env` configured
- Dependencies installed

---

#### `npm run install:all`
**Full command:** `npm install && npm install --prefix backend && npm install --prefix frontend`

**Purpose:** Install dependencies for all three package.json files

**What it does:**
1. Installs root dependencies (concurrently)
2. Installs backend dependencies
3. Installs frontend dependencies

**When to use:**
- Initial project setup
- After pulling dependency updates
- Clean install after deleting node_modules

**Expected duration:** 2-5 minutes depending on network speed

---

## Backend Scripts

Source: `backend/package.json`

### Development Scripts

#### `npm run server --prefix backend`
**Full command:** `tsx watch src/index.ts`

**Purpose:** Start backend development server with hot reload

**What it does:**
- Compiles TypeScript on the fly using tsx
- Watches for file changes and auto-restarts
- Starts Express server on configured PORT (default 5000)
- Connects to MongoDB
- Enables CORS for frontend

**When to use:**
- Backend-only development
- API testing
- Debugging backend issues

**Output:**
```
Server running on port 5000
MongoDB connected successfully
```

**Environment required:**
- `backend/.env` with MONGO_URI, PORT, NODE_ENV

---

### Testing Scripts

#### `npm run test --prefix backend`
**Full command:** `vitest`

**Purpose:** Run backend unit and integration tests

**What it does:**
- Runs all test files matching `**/__tests__/**/*.ts`
- Uses Vitest test runner
- Tests services, controllers, and API endpoints
- Supports watch mode and coverage

**When to use:**
- Before committing code
- TDD workflow (watch mode)
- CI/CD pipelines
- Verifying bug fixes

**Test locations:**
- `backend/src/services/__tests__/`
- `backend/src/controllers/__tests__/` (if exists)

**Watch mode:**
```bash
npx vitest --prefix backend
```

**Coverage:**
```bash
npx vitest run --coverage --prefix backend
```

---

### Build Scripts

#### `npm run build --prefix backend`
**Full command:** `tsc`

**Purpose:** Compile TypeScript to JavaScript for production

**What it does:**
- Runs TypeScript compiler
- Outputs compiled files to `backend/dist/`
- Checks for type errors
- Generates source maps

**When to use:**
- Preparing for production deployment
- Verifying TypeScript compilation
- CI/CD build step

**Output directory:** `backend/dist/`

**Verification:**
```bash
node backend/dist/index.js
```

---

### Migration Scripts

#### `npm run migrate:projects --prefix backend`
**Full command:** `tsx src/scripts/migrateProjects.ts`

**Purpose:** Run project data migration script

**What it does:**
- Executes project migration logic
- Updates existing data schema
- Runs one-time database transformations

**When to use:**
- After schema changes requiring data migration
- Initial project setup (if needed)
- Database updates in staging/production

**Important:**
- Backup database before running
- Test on development database first
- May be idempotent (safe to run multiple times)

**Script location:** `backend/src/scripts/migrateProjects.ts`

---

## Frontend Scripts

Source: `frontend/package.json`

### Development Scripts

#### `npm run dev --prefix frontend`
**Full command:** `npx @react-grab/claude-code@latest && vite`

**Purpose:** Start frontend development server

**What it does:**
- Runs react-grab analysis tool (optional dev dependency)
- Starts Vite dev server on port 5173
- Enables hot module replacement (HMR)
- Proxies API requests to backend

**When to use:**
- Frontend-only development
- UI/UX work
- Component development

**Access:** http://localhost:5173

**HMR:** File changes reflect instantly without page reload

---

### Build Scripts

#### `npm run build --prefix frontend`
**Full command:** `tsc -b && vite build`

**Purpose:** Build optimized production bundle

**What it does:**
1. Runs TypeScript compiler in build mode (`tsc -b`)
2. Checks for type errors (build fails on errors)
3. Runs Vite production build
4. Minifies and optimizes JavaScript/CSS
5. Generates static assets with hashed filenames
6. Outputs to `frontend/dist/`

**When to use:**
- Production deployment preparation
- Verifying production build success
- Testing production bundle locally
- CI/CD deployment step

**Output directory:** `frontend/dist/`

**Typical output:**
```
dist/index.html                   0.XX kB
dist/assets/index-[hash].js    1,500 kB
dist/assets/index-[hash].css     150 kB
✓ built in 10.5s
```

**Bundle size:** ~1.5MB uncompressed, ~435KB gzipped

---

#### `npm run preview --prefix frontend`
**Full command:** `vite preview`

**Purpose:** Preview production build locally

**What it does:**
- Serves static files from `frontend/dist/`
- Simulates production environment
- Runs on port 4173

**When to use:**
- Testing production build before deployment
- Verifying build artifacts
- Checking for production-only issues

**Requirements:**
- Must run `npm run build --prefix frontend` first

**Access:** http://localhost:4173

---

### Quality Scripts

#### `npm run lint --prefix frontend`
**Full command:** `eslint .`

**Purpose:** Lint frontend code for errors and style issues

**What it does:**
- Runs ESLint on all TypeScript/JavaScript files
- Checks React hooks rules
- Validates code style and patterns
- Reports warnings and errors

**When to use:**
- Before committing code
- Fixing code quality issues
- CI/CD quality checks

**Fix automatically:**
```bash
npx eslint . --fix --prefix frontend
```

**Configuration:** `frontend/eslint.config.js`

**Rules enforced:**
- React Hooks rules
- TypeScript best practices
- React Refresh patterns

---

### Testing Scripts

#### `npm run test --prefix frontend`
**Full command:** `vitest`

**Purpose:** Run frontend unit and integration tests

**What it does:**
- Runs all test files matching `**/__tests__/**/*.ts(x)` or `**/*.test.ts(x)`
- Uses Vitest with jsdom environment
- Tests components, hooks, utilities
- Supports watch mode and coverage

**When to use:**
- Before committing code
- TDD workflow (watch mode)
- Component testing
- Regression testing

**Test locations:**
- `frontend/src/components/**/__tests__/`
- `frontend/src/hooks/__tests__/`
- `frontend/src/utils/__tests__/`

**Watch mode:**
```bash
npx vitest --prefix frontend
```

**Coverage:**
```bash
npx vitest run --coverage --prefix frontend
```

**UI mode:**
```bash
npx vitest --ui --prefix frontend
```

---

## Common Workflows

### Initial Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure backend environment
# Create backend/.env with MONGO_URI, PORT, NODE_ENV

# 3. Start development
npm run dev
```

---

### Full Stack Development

```bash
# Start both servers
npm run dev

# In separate terminal: Run tests in watch mode
npx vitest --prefix backend &
npx vitest --prefix frontend &
```

---

### Backend-Only Development

```bash
# Start backend server
npm run server --prefix backend

# Run backend tests
npm run test --prefix backend
```

---

### Frontend-Only Development

```bash
# Start frontend dev server (backend must be running separately)
npm run dev --prefix frontend

# Run frontend tests
npm run test --prefix frontend

# Lint code
npm run lint --prefix frontend
```

---

### Pre-Commit Workflow

```bash
# 1. Run all tests
npm run test --prefix backend
npm run test --prefix frontend

# 2. Lint frontend
npm run lint --prefix frontend

# 3. Build both (verify no errors)
npm run build --prefix backend
npm run build --prefix frontend

# 4. Commit if all pass
git add .
git commit -m "[TYPE] Description"
```

---

### Production Build

```bash
# Build backend
npm run build --prefix backend

# Build frontend
npm run build --prefix frontend

# Preview frontend build
npm run preview --prefix frontend

# Test backend build
node backend/dist/index.js
```

---

### Running Migrations

```bash
# Backup database first!
mongodump --uri="mongodb://127.0.0.1:27017/fetms" --out=/backup/$(date +%Y%m%d)

# Run migration
npm run migrate:projects --prefix backend

# Verify migration success
mongosh mongodb://127.0.0.1:27017/fetms --eval "db.projects.countDocuments()"
```

---

## Testing Commands

### Backend Testing

```bash
# Run all tests
npm run test --prefix backend

# Run specific test file
npx vitest run backend/src/services/__tests__/teacherService.test.ts

# Watch mode for specific file
npx vitest backend/src/services/__tests__/teacherService.test.ts

# Coverage report
npx vitest run --coverage --prefix backend

# UI mode
npx vitest --ui --prefix backend
```

---

### Frontend Testing

```bash
# Run all tests
npm run test --prefix frontend

# Run specific test file
npx vitest run frontend/src/components/teachers/__tests__/TeacherCard.test.tsx

# Watch mode for specific file
npx vitest frontend/src/components/teachers/__tests__/TeacherCard.test.tsx

# Coverage report
npx vitest run --coverage --prefix frontend

# UI mode
npx vitest --ui --prefix frontend
```

---

## Environment Variables

### Backend Environment

Required in `backend/.env`:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/fetms
PORT=5000
NODE_ENV=development
```

### Frontend Environment

No environment file needed. API base URL is configured in:
- `frontend/src/services/api.ts`

For production, update the base URL before building.

---

## Troubleshooting

### "Command not found" errors

**Solution:** Ensure dependencies are installed
```bash
npm run install:all
```

---

### Port already in use

**Solution:** Kill process using the port
```bash
# Find and kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Find and kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

---

### TypeScript errors during build

**Solution:** Check type errors
```bash
# Backend
cd backend && npx tsc --noEmit

# Frontend
cd frontend && npx tsc --noEmit
```

---

### Test failures

**Solution:** Run tests with verbose output
```bash
npx vitest run --reporter=verbose
```

---

## Dependencies

### Root Dependencies

- **concurrently** (^9.2.1): Run multiple npm scripts concurrently

### Backend Dependencies

**Runtime:**
- express (^5.2.1): Web framework
- mongoose (^9.0.0): MongoDB ODM
- cors (^2.8.5): CORS middleware
- dotenv (^17.2.3): Environment variables
- multer (^2.0.2): File upload handling
- csv-parser (^3.2.0): CSV parsing
- date-fns (^4.1.0): Date utilities
- archiver (^7.0.1): ZIP file creation

**Development:**
- typescript (^5.9.3): TypeScript compiler
- tsx (^4.21.0): TypeScript runner
- vitest (^4.0.16): Testing framework
- supertest (^7.2.2): HTTP assertions

### Frontend Dependencies

**Runtime:**
- react (^19.2.0): UI library
- react-dom (^19.2.0): React DOM renderer
- react-router-dom (^7.10.0): Routing
- axios (^1.13.2): HTTP client
- @tanstack/react-table (^8.21.3): Table component
- recharts (^3.5.1): Charts
- @dnd-kit/* (^6.3.1): Drag and drop
- i18next (^25.8.0): Internationalization
- zod (^4.3.6): Schema validation
- date-fns (^4.1.0): Date utilities
- tailwindcss (^4.1.17): CSS framework
- Shadcn/UI components (Radix primitives)

**Development:**
- vite (^7.2.4): Build tool
- typescript (~5.9.3): TypeScript compiler
- vitest (^4.0.16): Testing framework
- @testing-library/react (^16.3.1): React testing utilities
- eslint (^9.39.1): Linting

---

## Additional Resources

- **Contributing Guide:** `docs/CONTRIB.md`
- **Operations Runbook:** `docs/RUNBOOK.md`
- **Project Overview:** `CLAUDE.md`
- **QA Checklist:** `docs/qa-checklist.md`
