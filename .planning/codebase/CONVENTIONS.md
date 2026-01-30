# Coding Conventions

**Analysis Date:** 2026-01-27

## Naming Patterns

**Files:**
- Controllers: `{resource}Controller.ts` (e.g., `teacherController.ts`, `schoolController.ts`)
- Services: `{resource}Service.ts` (e.g., `teacherService.ts`, `schoolService.ts`)
- Models: PascalCase (e.g., `Teacher.ts`, `School.ts`)
- Components: PascalCase `.tsx` (e.g., `DataTable.tsx`, `ExportButton.tsx`)
- Utilities/Helpers: camelCase (e.g., `api.ts`, `exportService.ts`)
- Tests: `{source-file}.test.ts` or `{source-file}.test.tsx` located in `__tests__` directory or alongside source

**Functions:**
- camelCase for all functions: `getAllTeachers()`, `createTeacher()`, `handleSubmit()`
- Static service methods: class static pattern with camelCase names
- React hooks/event handlers: `use{Name}` for custom hooks, `handle{Event}` for handlers

**Variables:**
- camelCase for all variables and state: `formData`, `selectedProjectId`, `rowSelection`, `columnFilters`
- Constants in upper-case when truly immutable: `PINNED_COLUMN_IDS`, `NON_COPYABLE_COLUMNS`, `DEFAULT_VISIBLE_COLUMNS`
- React state names should be descriptive: `[teachers, setTeachers]`, `[isOpen, setIsOpen]`, `[showDeleteAlert, setShowDeleteAlert]`

**Types/Interfaces:**
- PascalCase for all types and interfaces: `Teacher`, `School`, `DocumentBox`, `ITeacher`, `ICoreDoc`
- Prefix interfaces with `I` for TypeScript interfaces from models
- Export interface pattern used in services: `export interface Teacher { ... }`

## Code Style

**Formatting:**
- Tool: ESLint 9.39.1 with TypeScript ESLint
- Tab width: Configured via ESLint config (uses recommended settings)
- Path aliases: `@/*` maps to `./src/*` in frontend

**Linting:**
- Frontend config: `frontend/eslint.config.js`
- Rules enforced: React hooks rules, React refresh, TypeScript recommended rules
- Global ignores: `dist/`, `coverage/`
- No explicit prettier config found; ESLint handles formatting

**TypeScript Strictness:**
- `strict: true` in both backend and frontend tsconfig
- `noUncheckedIndexedAccess: true` enforced
- `exactOptionalPropertyTypes: true` enforced
- `noUncheckedSideEffectImports: true` enforced
- `isolatedModules: true` enabled
- `skipLibCheck: true` to avoid checking library types

## Import Organization

**Order:**
1. External packages (`react`, `express`, `mongoose`)
2. Internal types and interfaces
3. Internal services and utilities
4. Components (if applicable)
5. Styles (if applicable)

**Path Aliases:**
- Frontend only: `@/*` resolves to `./src/*`
- All imports in components should use `@/` prefix: `import { Button } from "@/components/ui/button"`
- Backend uses relative paths with `.js` extensions (ES modules): `import { TeacherService } from '../services/teacherService.js'`

## Error Handling

**Patterns:**
- Controllers: wrap all logic in try-catch blocks with consistent error response format
- Error responses: `{ message: string, error: unknown }` with appropriate HTTP status codes
- Validation errors: HTTP 400 with descriptive message
- Not found: HTTP 404
- Server errors: HTTP 500
- Services: throw or return null on failure (no generic throws); let controller handle HTTP response
- Frontend: `console.error()` for logging, use `toast` from sonner for user-facing errors

**Error Response Pattern (Backend):**
```typescript
try {
    const result = await TeacherService.someMethod();
    res.json(result);
} catch (error) {
    console.error('Error message:', error);
    res.status(500).json({ message: 'Error description', error });
}
```

## Logging

**Framework:** console (standard Node.js console)

**Patterns:**
- Use `console.error()` for errors in catch blocks with descriptive message
- Frontend: `console.error()` for debugging and error tracking
- Pattern: `console.error('Context:', error)` - always include context before the error object
- Sonner toast library used for user notifications: `toast.success()` for success messages

## Comments

**When to Comment:**
- Comments are sparse; code is generally self-documenting
- Comments used for explaining "why" decisions, not "what" the code does
- Helper functions have inline comments explaining purpose
- Complex filter logic is documented inline (see `columns.tsx` for custom filter functions)

**JSDoc/TSDoc:**
- Minimal JSDoc usage observed
- Primarily used for complex exported functions and services
- Pattern not strictly enforced but recommended for public APIs

**Example (from `teacherService.ts`):**
```typescript
// Helper for file deletion
const deleteFile = (filePath: string) => {
    if (!filePath) return;
    const absolutePath = path.resolve(filePath);
    fs.unlink(absolutePath, (err) => {
        if (err) console.error(`Failed to delete file: ${filePath}`, err);
    });
};
```

## Function Design

**Size:** Target max 200 lines per file (enforced in CLAUDE.md)

**Parameters:**
- Avoid long parameter lists; prefer object parameters for multiple options
- Type all parameters explicitly
- Use optional chaining and nullish coalescing for safe access

**Return Values:**
- Services typically return promises of typed objects or null
- Controllers return HTTP responses via Express Response object
- Use specific return types, not `any` (TypeScript strict mode enforced)

**Async/Await:**
- Preferred over `.then()` chains
- All async functions explicitly typed with `async`
- Await all promises in service methods

## Module Design

**Exports:**
- Named exports preferred over default exports
- Classes exported as named exports: `export class TeacherService { ... }`
- Services are static classes with static methods

**Barrel Files:**
- Used in UI component folders: `components/ui/` exports all primitive components
- Not overused; imports are explicit by file path when possible

## Service Layer Pattern

**Architecture Pattern Observed:**
```
Controller → Service → Model → Database
```

**Service Characteristics:**
- Static methods only (no instantiation)
- All business logic lives in services
- Services receive raw data, return typed objects
- Services use model methods for database operations
- Async operations with clear error semantics (null vs throw)

**Example Service Method (from `teacherService.ts`):**
```typescript
static async getTeacherById(id: string): Promise<ITeacher | null> {
    return await Teacher.findOne({ _id: id, isDeleted: false });
}
```

## Soft Delete Convention

**Pattern:**
- All deletions use soft delete with `isDeleted: true` flag
- Queries always filter: `{ isDeleted: false }`
- Never hard-delete records from database
- Model operations include soft delete flag in all reads

**Example (from controllers):**
```typescript
const teacher = await TeacherService.deleteTeacher(id);
if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
```

## React Component Patterns

**Functional Components Only:**
- All components are functional React 19
- Hooks used for state management: `useState`, `useEffect`, `useCallback`, `useMemo`, `useContext`

**Custom Hooks:**
- Custom hooks use `use` prefix: `useProjectContext()`
- Hooks abstract complex state logic away from components

**Component Organization:**
- UI primitives in `components/ui/` (Shadcn/Radix primitives)
- Feature components in `components/{feature}/`
- Pages are route-level components in `pages/`

**State Management:**
- Local state via `useState` for component-specific state
- Context API for project-level state: `ProjectContext`
- No Redux or other global state library

## Type Safety

**TypeScript Rules:**
- `noImplicitAny: true` strictly enforced
- All function parameters typed
- Return types explicitly specified
- Discriminated unions used for type variants

**Backend Models:**
- Interfaces extend Mongoose `Document` for database models
- Exported types mirror database structure
- Examples: `ITeacher`, `ISchool`, `ICoreDoc`

## Testing Conventions in Code

**Observer patterns in tests:**
- Mock setup with `vi.mock()`
- Clear assertion names matching test intent
- Test data factories for complex objects (see `exportService.test.ts`)

---

*Convention analysis: 2026-01-27*
