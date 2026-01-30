# Codebase Structure

**Analysis Date:** 2026-01-27

## Directory Layout

```
tfetp-management-v4/
├── backend/                    # Express/Node.js server
│   ├── src/
│   │   ├── index.ts           # App entry point, route mounting, MongoDB connection
│   │   ├── controllers/       # HTTP request handlers (no business logic)
│   │   ├── services/          # Business logic (all DB queries, calculations)
│   │   ├── models/            # Mongoose schemas and TypeScript interfaces
│   │   ├── routes/            # Express route definitions
│   │   ├── middleware/        # Express middleware (file upload, etc.)
│   │   ├── __tests__/         # Integration tests
│   │   ├── services/__tests__/ # Service unit tests
│   │   ├── controllers/__tests__/ # Controller unit tests
│   │   ├── scripts/           # One-off scripts (migrations)
│   │   ├── export_seniority.ts # Ad-hoc export utility
│   │   └── seedAlerts.ts      # Alert data seeding script
│   ├── uploads/               # Local file storage (avatars, documents)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React/Vite SPA
│   ├── src/
│   │   ├── main.tsx           # React DOM mount point
│   │   ├── App.tsx            # Router root, context providers, layout shell
│   │   ├── index.css          # Global styles, Tailwind imports
│   │   ├── pages/             # Route-level components (Teachers, Dashboard, etc.)
│   │   ├── components/        # Reusable feature and UI components
│   │   │   ├── ui/            # Shadcn/Radix primitives (Button, Dialog, etc.)
│   │   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   │   ├── teachers/      # Teacher feature components (DataTable, Kanban, etc.)
│   │   │   ├── schools/       # School feature components
│   │   │   ├── dashboard/     # Dashboard charts and KPI cards
│   │   │   ├── documents/     # Document management components
│   │   │   ├── kanban/        # Generic kanban components (reused by teachers)
│   │   │   ├── projects/      # Project CRUD dialogs
│   │   │   ├── settings/      # Settings feature components
│   │   │   └── common/        # Shared utilities
│   │   ├── services/          # Axios-based API clients
│   │   ├── contexts/          # React Context (ProjectContext)
│   │   ├── types/             # TypeScript type definitions
│   │   ├── lib/               # Utility functions (cn for classnames)
│   │   ├── __tests__/         # Component and integration tests
│   │   ├── test-setup.ts      # Vitest configuration
│   │   └── assets/            # Static assets (images, icons)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
│
├── .planning/                  # GSD orchestrator workspace
│   ├── codebase/              # Generated analysis documents
│   └── phases/                # Phase execution logs
│
├── .claude/                    # Claude Code configuration
├── .agent/                     # Agent skills and rules
├── docs/                       # Project documentation
├── package.json               # Root workspace config
├── pnpm-workspace.yaml        # (or package.json workspaces)
└── README.md
```

## Directory Purposes

**`backend/src/controllers/`:**
- Purpose: HTTP request/response handlers, parameter extraction, validation responses
- Contains: Classes with static async methods (TeacherController, SchoolController, etc.)
- Key files: `teacherController.ts`, `schoolController.ts`, `statsController.ts`, `projectController.ts`
- Constraint: Max 200 lines per file; business logic moved to services
- Pattern: `static async methodName(req: Request, res: Response) { ... }`

**`backend/src/services/`:**
- Purpose: All business logic, database queries, calculations, file operations
- Contains: Classes with static methods performing unit-testable operations
- Key files: `teacherService.ts`, `schoolService.ts`, `statsService.ts`, `projectService.ts`
- Testing: `backend/src/services/__tests__/` contains unit tests using vi.mock()
- Database access: Direct Mongoose queries, .find(), .findOne(), .findOneAndUpdate()
- File handling: fs operations for avatar/document deletion

**`backend/src/models/`:**
- Purpose: Mongoose schema definitions and TypeScript interfaces
- Contains: Schema instances with validation, indexes, and soft-delete logic
- Key files: `Teacher.ts`, `School.ts`, `Project.ts`, `Stage.ts`, `AlertRule.ts`
- Pattern: Interface definition (ITeacher) + Schema + export mongoose.model()
- Soft-delete: All schemas have `isDeleted: boolean` with default false
- Indexes: Searchable/filter fields indexed for query performance

**`backend/src/routes/`:**
- Purpose: Express route definitions mapping HTTP methods to controller handlers
- Contains: Router instances with .get(), .post(), .put(), .delete() calls
- Key files: `teachers.ts`, `schools.ts`, `projects.ts`, `stages.ts`, `statsRoutes.ts`, `alertRoutes.ts`, `importRoutes.ts`
- Pattern: `router.method(path, middleware?, controller.handler)`
- Middleware: Upload middleware for file routes

**`backend/src/middleware/`:**
- Purpose: Express middleware for cross-cutting concerns
- Contains: `upload.ts` with Multer configuration for file uploads
- File destination: `uploads/` directory with filename preservation

**`frontend/src/pages/`:**
- Purpose: Route-level components, one per major feature
- Contains: Full-page components (Teachers, Dashboard, Schools, etc.)
- Key files: `Teachers.tsx`, `Dashboard.tsx`, `Schools.tsx`, `TeacherProfile.tsx`, `Documents.tsx`, `Settings.tsx`, `ProjectSettings.tsx`, etc.
- Responsibilities:
  - Load page-specific data on useEffect mount
  - Manage page-level state (teachers array, filters, etc.)
  - Compose feature components into complete page layout
  - Handle user interactions triggering data mutations

**`frontend/src/components/ui/`:**
- Purpose: Shadcn/Radix primitive components
- Contains: Reusable unstyled/pre-styled UI elements
- Key files: `button.tsx`, `dialog.tsx`, `card.tsx`, `table.tsx`, `input.tsx`, `select.tsx`, `badge.tsx`, etc.
- Pattern: Functional components with forwardRef, className merging via cn()
- No data fetching, no business logic

**`frontend/src/components/teachers/`:**
- Purpose: Teacher-specific feature components
- Contains: DataTable, Kanban view, import dialog, filters
- Key subdirectories:
  - `list/` - DataTable components, column definitions, filters
  - `kanban/` - Teacher kanban board (AddStageDialog)
  - `import/` - Import dialog and hooks (useImportTeacher)
- Files: `TeacherKanbanBoard.tsx`, `ImportTeachersDialog.tsx`, `AvatarEditor.tsx`

**`frontend/src/components/dashboard/`:**
- Purpose: Dashboard visualization components
- Contains: Charts (Recharts), KPI cards, candidate expiry widgets
- Key files: `KPICard.tsx`, `PipelineChart.tsx`, `DemographicsChart.tsx`, `SalaryChart.tsx`, `CandidateList.tsx`, `ExpiryWidget.tsx`
- Data: Receives stats from parent Dashboard page, no API calls
- Charts: Recharts BarChart, PieChart, LineChart components

**`frontend/src/components/layout/`:**
- Purpose: App shell and navigation
- Contains: Sidebar, Header, theme provider
- Key files: `Sidebar.tsx`, `Header.tsx`, `Layout.tsx` (legacy, superseded by App.tsx)
- Sidebar: Navigation links, project selector
- Header: Page title, user menu placeholders

**`frontend/src/components/documents/`:**
- Purpose: Document management components
- Contains: Document cards, boxes, upload dialogs, management hooks
- Key files: `DocumentManager.tsx`, `DocumentCard.tsx`, `DocumentBox.tsx`, `BoxManagementDialogs.tsx`, `useDocumentManager.ts`
- Hooks: `useDocumentManager.ts` handles document CRUD operations

**`frontend/src/components/settings/`:**
- Purpose: Settings-related feature components
- Contains: Alert rules manager
- Key files: `AlertRulesManager.tsx`

**`frontend/src/components/projects/`:**
- Purpose: Project CRUD dialogs
- Contains: Create, edit, delete project dialogs
- Key files: `CreateProjectDialog.tsx`, `EditProjectDialog.tsx`, `ConfirmDeleteDialog.tsx`

**`frontend/src/services/`:**
- Purpose: Axios-based API client services
- Contains: Service classes with methods for each resource
- Key files: `api.ts` (Axios instance), `teacherService.ts`, `schoolService.ts`, `statsService.ts`, `projectService.ts`
- Pattern: Static methods returning axios calls: `static getAll() { return api.get(...).then(...) }`
- BaseURL: `http://localhost:5000/api` hardcoded in api.ts

**`frontend/src/contexts/`:**
- Purpose: React Context providers for global state
- Contains: `ProjectContext.tsx` with useProjectContext hook
- State: selectedProjectId with localStorage persistence
- Provider: Wraps App in <ProjectProvider> in App.tsx

**`frontend/src/types/`:**
- Purpose: TypeScript type definitions
- Contains: Shared type definitions (Document types, etc.)
- Key files: `document.ts`

**`frontend/src/lib/`:**
- Purpose: Utility functions and helpers
- Key files: `utils.ts` with cn() classname merger function

## Key File Locations

**Entry Points:**
- Backend: `backend/src/index.ts` - Express app init, MongoDB connection, route mounting
- Frontend: `frontend/src/main.tsx` - React DOM mount
- Frontend Router: `frontend/src/App.tsx` - Router, providers, layout structure

**Configuration:**
- Backend: `backend/tsconfig.json`, `backend/package.json`
- Frontend: `frontend/vite.config.ts`, `frontend/vitest.config.ts`, `frontend/tsconfig.json`
- Root: `package.json` (workspace root, monorepo config)

**Core Logic:**
- Backend Teachers: `backend/src/services/teacherService.ts`
- Backend Stats: `backend/src/services/statsService.ts`
- Frontend Teachers Page: `frontend/src/pages/Teachers.tsx`
- Frontend Dashboard: `frontend/src/pages/Dashboard.tsx`
- Frontend Project Context: `frontend/src/contexts/ProjectContext.tsx`

**Testing:**
- Backend services: `backend/src/services/__tests__/` (e.g., teacherService.test.ts)
- Backend integration: `backend/src/__tests__/integration.test.ts`
- Frontend components: `frontend/src/components/**/__tests__/` (colocated with components)
- Frontend pages: `frontend/src/pages/__tests__/`

## Naming Conventions

**Files:**
- Services: `{resourceName}Service.ts` (teacherService.ts, schoolService.ts)
- Controllers: `{resourceName}Controller.ts` (teacherController.ts, schoolController.ts)
- Models: `{ResourceName}.ts` PascalCase (Teacher.ts, School.ts)
- Routes: `{resourceName}Routes.ts` or `{resourceName}.ts` (teacherRoutes.ts, teachers.ts)
- Components: `{ComponentName}.tsx` or `{component-name}.tsx` PascalCase (DataTable.tsx, KPICard.tsx)
- Tests: `{fileName}.test.ts` or `{fileName}.test.tsx` (teacherService.test.ts)
- Hooks: `use{HookName}.ts` camelCase (useDocumentManager.ts, useImportTeacher.ts)

**Directories:**
- Feature domains: kebab-case or lowercase plural (teachers, schools, dashboard, documents)
- Subdirectories in features: domain-specific (list, kanban, import, filters)
- UI primitives: lowercase (ui, layout, common)
- Utility folders: descriptive lowercase (__tests__, contexts, services, lib)

**Exports:**
- Named exports for classes: `export class TeacherService { ... }`
- Default exports for React components: `export default function Teachers() { ... }`
- Barrel files: `index.ts` for component directories (e.g., `components/teachers/list/index.ts`)

## Where to Add New Code

**New Teacher Feature (e.g., bulk edit):**
- Service logic: `backend/src/services/teacherService.ts` → add static method
- Controller: `backend/src/controllers/teacherController.ts` → add static method
- Route: `backend/src/routes/teachers.ts` → add new route
- Frontend page: `frontend/src/pages/Teachers.tsx` → add state and handler
- Frontend component: `frontend/src/components/teachers/{feature}/` → new component file
- Tests: Write service test in `backend/src/services/__tests__/teacherService.test.ts` first (TDD)

**New School Field (e.g., principalEmail):**
- Model: `backend/src/models/School.ts` → add field to schema and ISchool interface
- Service: `backend/src/services/schoolService.ts` → if business logic needed, add method
- Controller: No change if using generic CRUD already implemented
- Frontend type: `frontend/src/services/schoolService.ts` → update School interface
- Frontend component: `frontend/src/components/schools/` → add form field
- Tests: Update schoolService.test.ts to include new field

**New Analytics Chart:**
- Backend: `backend/src/services/statsService.ts` → add calculation method, return in getDashboardStats()
- Frontend page: `frontend/src/pages/Dashboard.tsx` → add new chart component
- Frontend component: `frontend/src/components/dashboard/{ChartName}.tsx` → new Recharts component
- Tests: Add statsService.test.ts test for new calculation

**New Alert Rule Type:**
- Model: `backend/src/models/AlertRule.ts` → add fields
- Service: `backend/src/services/alertService.ts` → add CRUD logic
- Controller: `backend/src/controllers/alertController.ts` → add endpoints
- Routes: `backend/src/routes/alertRoutes.ts` → add routes
- Frontend: `frontend/src/components/settings/AlertRulesManager.tsx` → add UI
- Page: `frontend/src/pages/AlertSettings.tsx` → integrate manager

**New Project Feature (multi-project related):**
- Model: Update `backend/src/models/Project.ts` if needed
- Service: `backend/src/services/projectService.ts` → add methods
- Frontend context: `frontend/src/contexts/ProjectContext.tsx` → add state if needed
- Frontend page: `frontend/src/pages/ProjectSettings.tsx` → add settings UI

## Special Directories

**`backend/uploads/`:**
- Purpose: Local file storage for avatars and documents
- Generated: Yes (created on first file upload)
- Committed: No (.gitignored)
- Lifecycle: Files persisted on soft delete, only removed on hard delete

**`backend/coverage/`:**
- Purpose: Test coverage reports from Vitest
- Generated: Yes (created by `npm test`)
- Committed: No (.gitignored)
- Contents: HTML coverage report with line/branch/function metrics

**`frontend/coverage/`:**
- Purpose: Frontend test coverage reports
- Generated: Yes (created by `npm test`)
- Committed: No (.gitignored)

**`.planning/codebase/`:**
- Purpose: GSD orchestrator workspace for analysis and phase planning
- Generated: Yes (created by /gsd:map-codebase)
- Committed: No (.gitignored) - workspace-specific
- Contains: ARCHITECTURE.md, STRUCTURE.md, STACK.md, TESTING.md, CONVENTIONS.md, CONCERNS.md

**`.planning/phases/`:**
- Purpose: Phase execution logs and context
- Generated: Yes (created by /gsd:execute-phase)
- Committed: No (.gitignored)

---

*Structure analysis: 2026-01-27*
