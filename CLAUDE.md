# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FETMS (Foreign English Teachers Management System) is a MERN stack application for managing the complete lifecycle of Foreign English Teachers - from recruitment through placement and renewal. It features a recruitment pipeline (Kanban), document vault, school management, and analytics dashboard.

## User Input 
Always wait for user responses when asking questions or presenting options. Do not proceed with assumptions when user input is needed. If the user has expressed a clear preference, do not present multiple-choice options for that same decision.

## TDD Workflow
Always follow strict TDD when implementing features: write tests first, verify they fail, implement code, verify tests pass. Run the full CI pipeline (`npm run typecheck && npm run lint && npm run test`) after each logical unit of work before committing.

## Git Workflow
Always create a feature branch before starting implementation work. Never commit directly to master/main. Use `git checkout -b feature/<descriptive-name>` before making any code changes.

## Implementation Plans
When executing multi-phase or multi-task plans, complete each task fully (code + tests + CI green) before moving to the next. If a session may run out of tokens, prioritize completing the current task cleanly over starting new ones. Always document progress in a way that enables seamless handoff to a new session.

## Commands

### Development
```bash
npm run dev              # Start full stack (backend + frontend concurrently)
npm run install:all      # Install dependencies for root, backend, and frontend
```

### Frontend (from root or frontend/)
```bash
npm run dev --prefix frontend     # Vite dev server (port 5173)
npm run build --prefix frontend   # TypeScript check + Vite build
npm run lint --prefix frontend    # ESLint
npm run test --prefix frontend    # Vitest tests
```

### Backend (from root or backend/)
```bash
npm run server --prefix backend   # tsx watch dev server (port 5000)
npm run test --prefix backend     # Vitest tests
```

## Architecture

### Backend: Service-Layer Pattern
```
Controller → Service → Model → MongoDB
```

- **Controllers** (`backend/src/controllers/`): Validation, param extraction, HTTP responses. NO business logic.
- **Services** (`backend/src/services/`): All business logic. Must be unit-testable without a database.
- **Models** (`backend/src/models/`): Mongoose schemas with soft deletes (`isDeleted: true`).

### Frontend: Component Hierarchy
- **UI Components** (`frontend/src/components/ui/`): Shadcn/Radix primitives
- **Feature Components** (`frontend/src/components/{teachers,schools,kanban,dashboard}/`): Compose UI components
- **Pages** (`frontend/src/pages/`): Route-level components
- **Services** (`frontend/src/services/`): All API calls through Axios instance in `api.ts`

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Shadcn/UI, Recharts, dnd-kit
- **Backend**: Express 5, Node.js, Mongoose 9, TypeScript
- **Database**: MongoDB (soft deletes, indexed searchable fields)
- **Testing**: Vitest + @testing-library/react (frontend), Vitest + Supertest (backend)

## Critical Standards (from AGENTS.md)

1. **Package Manager**: npm only (no yarn/pnpm)
2. **Soft Deletes**: Never hard-delete; use `isDeleted: true`
3. **File Size**: Max 200 lines per file - refactor if exceeded
4. **TDD Workflow**: Write failing test → make pass → refactor
5. **Type Safety**: `noImplicitAny` enforced
6. **Layer Separation**: UI never touches DB; Controllers never contain business logic
7. **Indexing**: All searchable fields must have MongoDB indexes
8. **Commit Format**: `[TYPE] Description` (e.g., `[FEAT]`, `[FIX]`, `[TEST]`)

## API Routes

### Teachers
- `GET/POST /api/teachers` - List/Create
- `GET/PUT/DELETE /api/teachers/:id` - Read/Update/Soft-delete
- `POST /api/teachers/:id/avatar` - Upload avatar
- `POST /api/teachers/:id/documents/:type` - Upload core document
- `POST /api/teachers/:id/documents/adhoc` - Upload ad-hoc document

### Schools
- `GET/POST /api/schools` - List/Create
- `PUT/DELETE /api/schools/:id` - Update/Delete

### Other
- `GET /api/stages` - Kanban stages
- `GET /api/stats` - Analytics
- `POST /api/teachers/import` - Bulk CSV import

## Environment

Backend requires `.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/fetms
PORT=5000
NODE_ENV=development
```

Frontend API base URL is hardcoded in `frontend/src/services/api.ts`.

## Data Models

**Teacher**: Comprehensive profile with nested sections (personalInfo, passportDetails, workPermitDetails, contractDetails, etc.), documents object, documentBoxes array, and adHocDocuments array. Uses `school` (ObjectId FK) and `pipelineStage` (ObjectId FK) references.

**School**: Bilingual names (`name.chinese`/`name.english`), principal info, contact details.

**Stage**: Kanban columns with `title` and `order` for sorting.

## Testing
When writing tests, always mock `window.matchMedia`, ensure CSS modules/imports are properly handled in the test environment, and use i18n translation keys (not hardcoded strings) in test assertions. JSDOM does not support computed styles - test CSS behavior by checking stylesheet rules, not computed values.
- Backend service tests: `backend/src/services/__tests__/`
- Run single test file: `npx vitest run path/to/test.ts`
- Watch mode: `npx vitest path/to/test.ts`

