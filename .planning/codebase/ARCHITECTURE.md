# Architecture

**Analysis Date:** 2026-01-27

## Pattern Overview

**Overall:** Service-layer MVC pattern with multi-project workspace support

**Key Characteristics:**
- Clear separation between controllers (HTTP handling), services (business logic), and models (data)
- Frontend components organized by feature domain with shared UI primitives
- Project-scoped data filtering throughout (Teachers, Schools, Stats filtered by selectedProjectId)
- Soft-delete pattern enforced across all models (isDeleted: true)
- React Context for project selection and persistence (localStorage)

## Layers

**Backend HTTP Layer:**
- Purpose: Request/response handling, validation, parameter extraction
- Location: `backend/src/routes/` and `backend/src/controllers/`
- Contains: Express route definitions and controller class methods
- Depends on: Services, Models, Middleware
- Used by: Frontend API clients

**Backend Business Logic (Service Layer):**
- Purpose: All business logic, data transformation, calculations
- Location: `backend/src/services/`
- Contains: Service classes with static methods performing CRUD operations, calculations, file handling
- Depends on: Models, filesystem, external libraries
- Used by: Controllers only (never called directly from routes)
- Examples: `TeacherService`, `StatsService`, `SchoolService`

**Backend Data Access (Models):**
- Purpose: MongoDB schema definitions, validation, soft-delete queries
- Location: `backend/src/models/`
- Contains: Mongoose schemas with interfaces (ITeacher, ISchool, IProject, IStage, IAlertRule)
- Soft-delete pattern: All queries use `{ isDeleted: false }` condition
- Examples: `Teacher.ts`, `School.ts`, `Project.ts`

**Frontend UI Components (Presentational):**
- Purpose: Rendering UI elements without business logic
- Location: `frontend/src/components/ui/`
- Contains: Shadcn/Radix primitives (Button, Dialog, Card, Table, Select, etc.)
- Pattern: Stateless functional components with props-based styling
- No data fetching, no side effects

**Frontend Feature Components:**
- Purpose: Compose UI components into feature-specific layouts
- Location: `frontend/src/components/{teachers,schools,kanban,dashboard,documents,settings}/`
- Contains: Components specific to feature domains
- Pattern: May use hooks, call services, manage local state
- Examples: `DataTable.tsx`, `TeacherKanbanBoard.tsx`, `DocumentManager.tsx`, `KPICard.tsx`

**Frontend Pages:**
- Purpose: Route-level components, top-level feature orchestration
- Location: `frontend/src/pages/`
- Contains: Full page implementations (Teachers, Schools, Dashboard, Documents, Settings variants)
- Responsibilities: Fetch data on mount, manage page-level state, compose feature components
- Examples: `Teachers.tsx`, `Dashboard.tsx`, `TeacherProfile.tsx`, `ProjectSettings.tsx`

**Frontend API Services:**
- Purpose: Centralized API communication through Axios
- Location: `frontend/src/services/`
- Contains: Service classes for each backend resource (teacherService, schoolService, statsService, projectService)
- Pattern: Single Axios instance in `api.ts` configured with baseURL
- No side effects in services; used by components via hooks

**Frontend Global State (Context):**
- Purpose: Application-level state for project selection
- Location: `frontend/src/contexts/`
- Contains: `ProjectContext.tsx` providing `useProjectContext()` hook
- Persistence: Selected project ID stored in localStorage
- Auto-selection: First project auto-selected on app load if none selected

**Frontend Custom Hooks:**
- Purpose: Reusable logic for data fetching, state management, document handling
- Location: Colocated with components (e.g., `useDocumentManager.ts`, `useImportTeacher.ts`)
- Pattern: Return state, loading, error, and handler functions
- Used by: Feature components and pages

## Data Flow

**Teacher List Rendering Flow:**

1. Page mounts (`Teachers.tsx`)
2. `useProjectContext()` provides `selectedProjectId`
3. `loadTeachers()` calls `teacherService.getAll(projectId)`
4. Service calls `GET /api/teachers?projectId=...`
5. Backend controller: `TeacherController.getAllTeachers()`
6. Controller calls `TeacherService.getAllTeachers(projectId)`
7. Service queries: `Teacher.find({ isDeleted: false, project: projectId }).populate('school').sort(...)`
8. Response returns to frontend, state updated
9. DataTable renders with teachers data

**Teacher Creation Flow:**

1. Form dialog in Teachers page
2. Submit calls `teacherService.create(formData)`
3. API POST to `/api/teachers`
4. Controller validates input, calls `TeacherService.createTeacher()`
5. Service creates Teacher document, resolves school FK if needed
6. Saves to MongoDB
7. Returns created teacher
8. Frontend refreshes teacher list

**Dashboard Stats Calculation Flow:**

1. Dashboard.tsx loads on mount
2. `useProjectContext()` provides selectedProjectId
3. `loadStats()` calls `statsService.getDashboardStats(filters, projectId)`
4. API GET to `/api/stats?projectId=...&filters=...`
5. Backend `StatsController` calls `StatsService.getDashboardStats()`
6. Service queries Teacher collection, calculates KPIs:
   - Count active teachers by stage
   - Extract expiry dates for widgets
   - Aggregate demographics, education, salary data
7. Returns structured stats object with charts data
8. Multiple Recharts chart components render from returned data

**Project-Scoped Data Access:**

1. Frontend stores selected project ID in localStorage and Context
2. Every data request includes `projectId` as query/body parameter
3. Backend services filter queries by projectId: `{ isDeleted: false, project: projectId }`
4. Only data belonging to selected project returned
5. Switching projects in selector triggers context update and re-fetches all data

**State Management:**

- Project selection: React Context + localStorage (persists across sessions)
- Page-level data: Component useState (Teachers array, filters, etc.)
- Global theme: ThemeProvider from Shadcn
- Notifications: Sonner toast for success/error messages

## Key Abstractions

**Service Layer Pattern:**
- Purpose: Encapsulate all business logic, make it testable without DB
- Implementation: Static class methods in `backend/src/services/*.ts`
- Pattern: `static async method(params): Promise<T>`
- Testing: Services mocked in unit tests, no database queries
- Examples: `TeacherService.createTeacher()`, `StatsService.getDashboardStats()`

**Soft-Delete Pattern:**
- Purpose: Preserve data for recovery, maintain referential integrity
- Implementation: `isDeleted: boolean` field on all data models
- Query pattern: Every query filters `{ isDeleted: false }`
- Hard delete: Only available via separate permanent delete endpoints
- Files: Preserved on soft delete (no file cleanup)

**Project Scoping:**
- Purpose: Multi-tenant data isolation within single database
- Implementation: Every model has `project: ObjectId FK` field
- Enforcement: Controllers receive selectedProjectId and pass to services
- Query pattern: `{ isDeleted: false, project: projectId }`
- Frontend: ProjectContext provides selectedProjectId to all components

**Controller Minimal Pattern:**
- Purpose: Controllers handle HTTP only, not business logic
- Implementation: Controllers extract params, call service, return response
- Responsibility: Request validation, param extraction, error status codes
- Anti-pattern: No queries, calculations, or file operations in controllers
- Exception handling: Generic 500 error response from global error handler

**Component Composition:**
- Purpose: Build features from reusable UI primitives
- Layer 1: Shadcn primitives in `components/ui/` (Button, Dialog, etc.)
- Layer 2: Feature components in domain directories (DataTable, KanbanBoard, etc.)
- Layer 3: Pages combine features and manage data flow
- Data flow: Pages fetch, pass down to features, features pass to UI

## Entry Points

**Backend Entry Point:**
- Location: `backend/src/index.ts`
- Triggers: `npm run server` from dev environment
- Responsibilities:
  - Connect to MongoDB via `mongoose.connect()`
  - Create Express app with CORS and JSON middleware
  - Mount all route handlers: `/api/teachers`, `/api/schools`, `/api/stats`, `/api/alerts`, `/api/projects`, `/api/stages`
  - Serve static uploads directory
  - Register global error handler
  - Listen on PORT (default 5000)

**Frontend Entry Point:**
- Location: `frontend/src/main.tsx` (React mount point) and `frontend/src/App.tsx` (Router root)
- Triggers: `npm run dev` from Vite dev server
- Responsibilities (main.tsx):
  - Mount React to DOM root element
  - Render App component in StrictMode
- Responsibilities (App.tsx):
  - Set up React Router with all routes
  - Wrap with ProjectProvider for context
  - Wrap with ThemeProvider for light/dark theme
  - Render layout: Sidebar + Header + Routes
  - Mount Toaster for notifications

**Route Mounting:**
- Teachers CRUD: `GET/POST /api/teachers`, `GET/PUT/DELETE /api/teachers/:id`
- Teachers file operations: `POST /api/teachers/:id/avatar`, `POST /api/teachers/:id/documents/:type`
- Schools CRUD: `GET/POST /api/schools`, `GET/PUT/DELETE /api/schools/:id`
- Analytics: `GET /api/stats`
- Pipeline: `GET /api/stages`, `PUT /api/teachers/pipeline/reorder`
- Projects: `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/:id`
- Alerts: `GET/POST /api/alerts`, `GET/PUT/DELETE /api/alerts/:id`

## Error Handling

**Strategy:** Centralized backend error handler with specific HTTP status codes

**Backend Patterns:**
- Controllers catch errors, respond with `res.status(code).json({ message, error })`
- 400: Bad request (missing required params, validation failures)
- 404: Resource not found (teacher/school deleted or doesn't exist)
- 500: Server errors (database, file operations, unexpected exceptions)
- Global handler: `app.use((err, req, res, next) => ...)` catches uncaught errors, returns 500

**Frontend Patterns:**
- Service methods throw errors that propagate to components
- Components catch in try/catch blocks
- Display toast notifications via Sonner: `toast.error(message)`
- Fallback UI states: "Loading...", null renders if data missing, error messages in dialogs
- Validation: React Hook Form patterns in dialogs (not visible in samples, but Dialog usage suggests it)

## Cross-Cutting Concerns

**Logging:**
- Backend: `console.error()` and `console.log()` to stdout
- Frontend: `console.error()` in catch blocks, logged to browser console
- No structured logging (no winston/pino on backend)

**Validation:**
- Backend: Controller-level validation, no dedicated validation library visible
- Frontend: Dialog forms validate on submit, no pre-validation middleware
- Database: Mongoose schema validation (required fields, types)

**Authentication:**
- Not implemented in current codebase (no auth routes, middlewares, or tokens)
- Assumed single-user or unauthenticated access for now

**File Handling:**
- Backend: Multer middleware in `middleware/upload.ts` for file uploads
- Storage: Local filesystem in `uploads/` directory
- Deletion: Async file deletion helper in `TeacherService` (fs.unlink callback)
- Paths: Stored as relative paths like `uploads/filename.ext`

**Project Selection Persistence:**
- Frontend: localStorage key `selectedProjectId` persists across sessions
- Load on app init: ProjectContext reads from localStorage
- Auto-select: First project selected if localStorage empty
- Update: Context setter updates both state and localStorage on change

---

*Architecture analysis: 2026-01-27*
