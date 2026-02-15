# Contributing Guide

## Development Setup

### Prerequisites
- Node.js (latest LTS version recommended)
- MongoDB 7.0+ running locally
- npm (no yarn/pnpm - project standard)

### Initial Setup

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install:all
   ```
3. Configure backend environment (see Environment Variables below)
4. Start development servers:
   ```bash
   npm run dev
   ```

## Available Scripts

### Root Level Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start full stack (backend + frontend concurrently) |
| `install:all` | `npm run install:all` | Install dependencies for root, backend, and frontend |

### Backend Scripts

Run from root with `--prefix backend` or from `backend/` directory:

| Script | Command | Description |
|--------|---------|-------------|
| `server` | `npm run server --prefix backend` | Start tsx watch dev server (port 5000) |
| `test` | `npm run test --prefix backend` | Run Vitest backend tests |
| `build` | `npm run build --prefix backend` | TypeScript compilation |
| `migrate:projects` | `npm run migrate:projects --prefix backend` | Run project migration script |

### Frontend Scripts

Run from root with `--prefix frontend` or from `frontend/` directory:

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev --prefix frontend` | Start Vite dev server (port 5173) |
| `build` | `npm run build --prefix frontend` | TypeScript check + Vite production build |
| `lint` | `npm run lint --prefix frontend` | Run ESLint |
| `preview` | `npm run preview --prefix frontend` | Preview production build |
| `test` | `npm run test --prefix frontend` | Run Vitest frontend tests |

## Environment Variables

### Backend (.env)

Create `backend/.env` with the following variables:

| Variable | Format | Purpose | Example |
|----------|--------|---------|---------|
| `MONGO_URI` | Connection string | MongoDB connection URI | `mongodb://127.0.0.1:27017/fetms` |
| `PORT` | Number | Backend server port | `5000` |
| `NODE_ENV` | String | Environment mode | `development` |

**Note:** See `backend/.env.example` for reference values.

### Frontend

Frontend API base URL is hardcoded in `frontend/src/services/api.ts`. No additional environment configuration required.

## Development Workflow

### 1. Before Starting Work

- Pull latest changes from main/master branch
- Create a feature branch: `git checkout -b feature/your-feature-name`
- Ensure tests pass: `npm run test --prefix backend && npm run test --prefix frontend`

### 2. Test-Driven Development (TDD)

This project follows strict TDD methodology:

1. **Write failing test** - Create test that defines expected behavior
2. **Make it pass** - Write minimal code to pass the test
3. **Refactor** - Clean up code while keeping tests green

**Testing Locations:**
- Backend service tests: `backend/src/services/__tests__/`
- Frontend component tests: `frontend/src/components/**/__tests__/`

**Running Tests:**
```bash
# Run all backend tests
npm run test --prefix backend

# Run all frontend tests
npm run test --prefix frontend

# Run specific test file
npx vitest run path/to/test.ts

# Watch mode for specific test
npx vitest path/to/test.ts
```

### 3. Code Standards

#### Critical Rules (CLAUDE.md)

1. **Package Manager**: npm only (no yarn/pnpm)
2. **Soft Deletes**: Never hard-delete; use `isDeleted: true`
3. **File Size**: Max 200 lines per file - refactor if exceeded
4. **Type Safety**: `noImplicitAny` enforced
5. **Layer Separation**: UI never touches DB; Controllers never contain business logic
6. **Indexing**: All searchable fields must have MongoDB indexes

#### Commit Format

Use conventional commit format:
```
[TYPE] Description

Types:
- [FEAT] - New feature
- [FIX] - Bug fix
- [TEST] - Test additions/changes
- [REFACTOR] - Code refactoring
- [DOCS] - Documentation changes
- [STYLE] - Code style/formatting
- [CHORE] - Build/tooling changes
```

### 4. Architecture Patterns

#### Backend: Service-Layer Pattern

```
Controller → Service → Model → MongoDB
```

- **Controllers** (`backend/src/controllers/`): Validation, param extraction, HTTP responses. NO business logic.
- **Services** (`backend/src/services/`): All business logic. Must be unit-testable without a database.
- **Models** (`backend/src/models/`): Mongoose schemas with soft deletes.

#### Frontend: Component Hierarchy

- **UI Components** (`frontend/src/components/ui/`): Shadcn/Radix primitives
- **Feature Components** (`frontend/src/components/{teachers,schools,kanban,dashboard}/`): Compose UI components
- **Pages** (`frontend/src/pages/`): Route-level components
- **Services** (`frontend/src/services/`): All API calls through Axios instance

### 5. Making Changes

#### Adding New Features

1. Plan the feature (create plan doc in `docs/plans/` if complex)
2. Write tests first (TDD approach)
3. Implement feature to pass tests
4. Ensure all tests pass
5. Check file line counts (max 200 lines)
6. Run linter: `npm run lint --prefix frontend`
7. Build to verify: `npm run build --prefix frontend`

#### Fixing Bugs

1. Write test that reproduces the bug
2. Fix the bug to pass the test
3. Verify all existing tests still pass
4. Document fix in commit message

### 6. Before Committing

**Checklist:**
- [ ] All tests pass (backend + frontend)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All files under 200 lines
- [ ] Soft deletes used (no hard deletes)
- [ ] Commit message follows `[TYPE] Description` format

### 7. Pull Request Process

1. Push branch to remote
2. Create PR with descriptive title
3. Ensure all CI checks pass
4. Link related issues if applicable
5. Request review from team members

## Tech Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Library**: Shadcn/UI (Radix primitives)
- **Charts**: Recharts
- **Drag & Drop**: dnd-kit
- **i18n**: i18next
- **Testing**: Vitest + @testing-library/react

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript
- **ORM**: Mongoose 9
- **File Handling**: Multer
- **Testing**: Vitest + Supertest

### Database
- **Database**: MongoDB
- **Patterns**: Soft deletes, indexed searchable fields

## Common Tasks

### Adding a New API Endpoint

1. Define route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Write service logic in `backend/src/services/`
4. Write tests in `backend/src/services/__tests__/`
5. Update API documentation in CLAUDE.md

### Adding a New Page

1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Create feature components in `frontend/src/components/{feature}/`
4. Add API calls in `frontend/src/services/`
5. Write component tests

### Database Schema Changes

1. Update Mongoose model in `backend/src/models/`
2. Add migration script if needed in `backend/src/scripts/`
3. Run migration: `npm run migrate:projects --prefix backend`
4. Update TypeScript types
5. Test changes with existing data

## Troubleshooting

### MongoDB Connection Issues

- Verify MongoDB is running: `mongosh`
- Check MONGO_URI in `backend/.env`
- Ensure database name matches: `fetms`

### Port Already in Use

- Backend (5000): Kill process using `lsof -ti:5000 | xargs kill -9`
- Frontend (5173): Kill process using `lsof -ti:5173 | xargs kill -9`

### TypeScript Errors

- Clear TypeScript cache: Remove `tsconfig.tsbuildinfo`
- Rebuild: `npm run build --prefix backend` or `npm run build --prefix frontend`
- Check `noImplicitAny` compliance

### Test Failures

- Run tests in watch mode to see details: `npx vitest path/to/test.ts`
- Check for async timing issues
- Verify test isolation (no shared state between tests)

## Code Quality Standards

### TypeScript

- Strict mode enabled
- `noImplicitAny` enforced
- All files must have proper type definitions
- No `any` types unless absolutely necessary

### ESLint

- Run `npm run lint --prefix frontend` before committing
- Fix all warnings and errors
- Follow React hooks rules

### File Organization

- Keep files under 200 lines
- One component per file
- Group related files in directories
- Use index.ts for clean imports

### Testing

- Aim for 80%+ test coverage
- Test business logic thoroughly
- Use descriptive test names
- Mock external dependencies

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Shadcn/UI Components](https://ui.shadcn.com/)

## Getting Help

- Check CLAUDE.md for project-specific guidance
- Review existing tests for examples
- Check docs/plans/ for feature implementation details
- Ask team members for clarification
