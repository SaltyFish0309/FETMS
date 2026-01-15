# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FETMS (Foreign English Teachers Management System) is a MERN stack application for managing the complete lifecycle of Foreign English Teachers - from recruitment through placement and renewal. It features a recruitment pipeline (Kanban), document vault, school management, and analytics dashboard.

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

- Backend service tests: `backend/src/services/__tests__/`
- Run single test file: `npx vitest run path/to/test.ts`
- Watch mode: `npx vitest path/to/test.ts`
