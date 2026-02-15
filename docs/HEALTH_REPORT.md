# Codebase Health Report

**Generated**: 2026-02-06
**Branch**: `feature/fix-i18n-and-user-preferences`

---

## 1. Unused Dependencies

### Root `package.json`

| Package | Type | Status |
|---------|------|--------|
| `form-data` | dependency | **UNUSED** - not imported anywhere |
| `node-fetch` | dependency | **UNUSED** - not imported anywhere |
| `baseline-browser-mapping` | devDependency | **UNUSED** - not imported anywhere |

### Backend `package.json`

| Package | Type | Status |
|---------|------|--------|
| `@types/mongoose` | devDependency | **UNUSED** - Mongoose 9 ships its own types |
| `nodemon` | devDependency | **UNUSED** - backend uses `tsx watch` instead |
| `ts-node` | devDependency | **UNUSED** - backend uses `tsx` instead |
| `@types/multer` | dependency | **MISPLACED** - should be in devDependencies |

### Frontend `package.json`

| Package | Type | Status |
|---------|------|--------|
| `react-grab` | devDependency | **REDUNDANT** - already a transitive dep of `@react-grab/claude-code` |

---

## 2. Dead Files

| File | Reason |
|------|--------|
| `backend/src/export_seniority.ts` | Standalone script, not imported anywhere, references hardcoded v3 path |
| `backend/src/seedAlerts.ts` | Standalone seed script, not imported/referenced from any other file |
| `frontend/src/services/projectService.test.ts` | **Duplicate** test file - identical tests exist in `__tests__/projectService.test.ts` |
| `nul` | Spurious empty file in repo root (Windows artifact) |

---

## 3. TODO/FIXME/HACK/XXX Comments

**None found.** The codebase is clean of technical debt markers.

---

## 4. TypeScript `any` Types (97 total)

### Frontend Source Files (1 file, 1 instance)

| File | Line | Usage |
|------|------|-------|
| `frontend/src/components/teachers/list/DataTableToolbar.tsx` | 39 | `(table.options.meta as any)` |

### Frontend UI Components (1 file, 7 instances)

| File | Lines | Usage |
|------|-------|-------|
| `frontend/src/components/ui/calendar.tsx` | 138, 145, 152, 157, 163, 172, 210 | `(props as any)` - shadcn component prop spreading |

### Frontend Test Files (3 files, 13 instances)

| File | Lines | Usage |
|------|-------|-------|
| `frontend/src/components/teachers/list/__tests__/DataTable.test.tsx` | 33, 120 | `ColumnDef<any>[]` |
| `frontend/src/components/teachers/list/filters/__tests__/FilterSheet.test.tsx` | 35, 55, 75 | `(table as any)` |
| `frontend/src/components/teachers/list/__tests__/DataTableToolbar.test.tsx` | 41, 49, 57, 76, 85, 93, 103, 112 | `(table as any)` |

### Backend Source Files (6 files, 46 instances)

| File | Lines | Count | Nature |
|------|-------|-------|--------|
| `backend/src/services/teacherService.ts` | 27, 35, 106-291 | 22 | Query objects, doc callbacks, array types |
| `backend/src/services/statsService.ts` | 65, 102, 163-287 | 14 | Distribution method params, query objects |
| `backend/src/services/schoolService.ts` | 9, 33, 38, 57, 65, 94, 95 | 7 | Query/data params, unflatten utility |
| `backend/src/routes/importRoutes.ts` | 11, 12, 32, 40, 80, 88 | 6 | CSV parsing, error handling |
| `backend/src/controllers/schoolController.ts` | 83, 91 | 2 | Error catch blocks |
| `backend/src/controllers/projectController.ts` | 96 | 1 | Error catch block |
| `backend/src/controllers/statsController.ts` | 7 | 1 | `req.query as any` |
| `backend/src/middleware/upload.ts` | 22 | 1 | Multer callback `req` param |
| `backend/src/index.ts` | 33 | 1 | Express error handler `err` param |

### Backend Test Files (4 files, 30 instances)

| File | Count | Nature |
|------|-------|--------|
| `backend/src/__tests__/integration.test.ts` | 14 | Mock casting |
| `backend/src/services/__tests__/statsService.test.ts` | 12 | Mock casting |
| `backend/src/services/__tests__/projectService.test.ts` | 12 | Mock casting |
| `backend/src/controllers/__tests__/projectController.test.ts` | 4 | Mock casting |

---

## 5. Files Without Test Coverage

### Backend (21 untested files)

| File | Priority |
|------|----------|
| `controllers/teacherController.ts` | HIGH - core CRUD logic |
| `controllers/schoolController.ts` | HIGH - includes CSV import |
| `controllers/statsController.ts` | MEDIUM |
| `routes/teachers.ts` | LOW - route wiring |
| `routes/schoolRoutes.ts` | LOW - route wiring |
| `routes/stages.ts` | LOW - route wiring |
| `routes/statsRoutes.ts` | LOW - route wiring |
| `routes/alertRoutes.ts` | LOW - route wiring |
| `routes/importRoutes.ts` | MEDIUM - contains business logic |
| `routes/projects.ts` | LOW - route wiring |
| `models/Teacher.ts` | LOW - schema definition |
| `models/School.ts` | LOW - schema definition |
| `models/Stage.ts` | LOW - schema definition |
| `models/AlertRule.ts` | LOW - schema definition |
| `models/Project.ts` | LOW - schema definition |
| `middleware/upload.ts` | MEDIUM |
| `index.ts` | LOW - server setup |
| `export_seniority.ts` | N/A - dead file |
| `seedAlerts.ts` | N/A - seed script |
| `scripts/migrateProjects.ts` | LOW - migration script |

### Frontend (50+ untested files)

**Pages** (9 untested of 11):
`AlertSettings`, `Documents`, `ImportSettings`, `PreferencesSettings`, `Schools`, `Settings`, `StageSettings`, `TeacherProfile`, `Teachers`

**Components** (30+ untested):
- All `documents/*` components (5 files)
- All `kanban/*` components (4 files)
- All `settings/*` components (5 files)
- All `schools/*` components (1 file)
- All `projects/*` components (3 files)
- `teachers/AvatarEditor`, `teachers/ImportTeachersDialog`, `teachers/TeacherKanbanBoard`
- `teachers/kanban/*` (2 files), `teachers/list/*` (5 files)
- `layout/Sidebar`

**Services** (6 untested of 9):
`alertService`, `api` (base), `preferencesService`, `schoolService`, `stageService`, `statsService`, `teacherService`

**Hooks/Contexts** (2 untested):
`hooks/usePrefersReducedMotion`, `contexts/PreferencesContext`

---

## 6. Unused Exports

| File | Export | Status |
|------|--------|--------|
| `frontend/src/services/exportService.ts:6` | `ExportColumn` (interface) | **UNUSED** - never imported outside this file |

---

## 7. Remediation Status

### Phase 2 - Safe Cleanup (COMPLETED)
- Removed 7 unused dependencies (root: `form-data`, `node-fetch`, `baseline-browser-mapping`; backend: `@types/mongoose`, `nodemon`, `ts-node`; frontend: `react-grab`)
- Moved `@types/multer` to devDependencies
- Deleted 3 dead files (`export_seniority.ts`, duplicate `projectService.test.ts`, `nul`)
- All tests verified green after cleanup

### Phase 3 - Type Safety (COMPLETED)
- Replaced ~55 `any` types across 9 backend source files
- Added typed interfaces: `CoreDocData`, `ReorderDocInput`, `ExpiryAlert`
- Typed error handling with `error: unknown` and typed assertions
- Replaced dynamic objects with `Record<string, unknown>`
- Remaining `any` in source: ~22 (8 frontend, 14 tests/mocks - acceptable)

## 8. Summary

| Category | Original | After Cleanup | Severity |
|----------|----------|---------------|----------|
| Unused dependencies | 7 packages | 0 | RESOLVED |
| Dead files | 4 files | 0 | RESOLVED |
| TODO/FIXME/HACK comments | 0 | 0 | CLEAN |
| `any` type usages (source) | 46 | ~10 | LOW |
| `any` type usages (tests) | 51 | ~51 | ACCEPTABLE |
| Untested source files | ~70 files | ~70 files | HIGH |
| Unused exports | 1 | 1 | LOW |
