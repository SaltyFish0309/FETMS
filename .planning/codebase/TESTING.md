# Testing Patterns

**Analysis Date:** 2026-01-27

## Test Framework

**Runner:**
- Vitest 4.0.16
- Config: `backend/vitest.config.ts` and `frontend/vite.config.ts` (integrated)

**Assertion Library:**
- Vitest built-in assertions with `expect()`
- Testing Library for React components: `@testing-library/react` 16.3.1

**Test Environment:**
- Backend: Node.js environment (vitest runs tests without browser)
- Frontend: jsdom environment with setup file `frontend/src/test-setup.ts`

**Run Commands:**
```bash
# Backend
npm run test --prefix backend          # Run all tests
npx vitest path/to/test.ts             # Run single test file
npx vitest path/to/test.ts --watch     # Watch mode

# Frontend
npm run test --prefix frontend         # Run all tests
npx vitest path/to/test.ts             # Run single test file
npx vitest path/to/test.ts --watch     # Watch mode

# Coverage
npm run test --prefix backend -- --coverage
npm run test --prefix frontend -- --coverage
```

## Test File Organization

**Location:**
- Backend: Co-located with source in `__tests__` directory: `src/services/__tests__/teacherService.test.ts`
- Frontend: Co-located with source in `__tests__` directory: `src/components/teachers/list/__tests__/DataTable.test.tsx`

**Naming:**
- `{source-file}.test.ts` for backend (e.g., `teacherService.test.ts`)
- `{source-file}.test.tsx` for React components (e.g., `DataTable.test.tsx`)

**Structure:**
```
src/
├── services/
│   ├── teacherService.ts
│   └── __tests__/
│       └── teacherService.test.ts
├── components/
│   └── teachers/list/
│       ├── DataTable.tsx
│       └── __tests__/
│           └── DataTable.test.tsx
```

## Test Structure

**Suite Organization:**

Backend example (`teacherService.test.ts`):
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherService } from '../teacherService.js';
import Teacher from '../../models/Teacher.js';

// Mock setup at top
vi.mock('../../models/Teacher.js', () => ({
    default: {
        find: vi.fn(),
        findOne: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    }
}));

describe('TeacherService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllTeachers', () => {
        it('should return all non-deleted teachers', async () => {
            // Arrange
            const mockTeachers = [{ name: 'John' }, { name: 'Jane' }];
            const sortMock = vi.fn().mockReturnValue(mockTeachers);
            const populate2Mock = vi.fn().mockReturnValue({ sort: sortMock });
            const populate1Mock = vi.fn().mockReturnValue({ populate: populate2Mock });
            Teacher.find.mockReturnValue({ populate: populate1Mock });

            // Act
            const result = await TeacherService.getAllTeachers();

            // Assert
            expect(Teacher.find).toHaveBeenCalledWith({ isDeleted: false });
            expect(result).toEqual(mockTeachers);
        });
    });
});
```

Frontend example (`ExportButton.test.tsx`):
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExportButton } from '../ExportButton';

describe('ExportButton', () => {
    const mockOnExportCSV = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render export button with default label', () => {
            // Arrange & Act
            render(<ExportButton onExportCSV={mockOnExportCSV} />);

            // Assert
            expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
        });
    });
});
```

**Patterns:**
- `describe()` for grouping related tests
- `beforeEach()` for test setup and mock clearing
- `it()` or `test()` for individual test cases
- Comments separating Arrange-Act-Assert sections (not always present, but clear flow)
- Clear test names describing expected behavior, not implementation

## Mocking

**Framework:** Vitest's `vi` module

**Mocking Patterns:**

Service mocking (backend):
```typescript
vi.mock('../../models/Teacher.js', () => ({
    default: {
        find: vi.fn(),
        findOne: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    }
}));
```

Component mocking (frontend):
```typescript
vi.mock('../DataTableToolbar', () => ({
  DataTableToolbar: ({ actionButtons }: { actionButtons?: React.ReactNode }) => (
    <div data-testid="toolbar">
      Toolbar
      {actionButtons && <div data-testid="action-buttons">{actionButtons}</div>}
    </div>
  )
}));
```

Global API mocking:
```typescript
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});
```

Library mocking:
```typescript
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));
```

**Mock Return Values:**
- `mockReturnValue()` for synchronous returns
- `mockResolvedValue()` for async returns (promises)
- `mockImplementation()` for complex behavior
- Chained mocks for fluent APIs: `vi.fn().mockReturnValue({ sort: sortMock })`

**What to Mock:**
- External dependencies (database, third-party APIs)
- Child components in component tests
- Browser APIs (clipboard, localStorage)
- Heavy computation modules
- Library toast/notification functions

**What NOT to Mock:**
- The component/function being tested
- Simple utility functions
- Business logic you want to verify
- Date/time unless testing time-dependent behavior

## Fixtures and Factories

**Test Data:**

Factory function pattern (`exportService.test.ts`):
```typescript
const getMockTeacher = (overrides?: Partial<Teacher>): Teacher => ({
    _id: 'teacher-123',
    firstName: 'John',
    middleName: 'M',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    pipelineStage: 'stage-1',
    pipelineOrder: 0,
    documents: {
        passport: { status: 'pending' },
        arc: { status: 'pending' },
        contract: { status: 'pending' },
        workPermit: { status: 'pending' },
    },
    documentBoxes: [],
    otherDocuments: [],
    personalInfo: {
        nationality: { english: 'American' },
        gender: 'Male',
        hiringStatus: 'Newly Hired',
    },
    education: {
        degree: "Bachelor's",
    },
    contractDetails: {
        salary: 50000,
    },
    ...overrides,
});
```

Usage pattern:
```typescript
const teachers = [getMockTeacher()];
const customTeacher = getMockTeacher({ lastName: 'Doe, Jr.' });
```

**Location:**
- Factories defined at top of test file
- One factory per complex type being tested
- Factories accept overrides for test-specific variations

## Coverage

**Requirements:** No enforced minimum, but coverage enabled

**Coverage Configuration:**

Backend (`backend/vitest.config.ts`):
```typescript
coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
    reportsDirectory: './coverage',
    include: ['src/**/*.ts'],
    exclude: [
        'src/**/*.test.ts',
        'src/**/__tests__/**',
        'src/index.ts',
    ],
},
```

Frontend (`frontend/vite.config.ts`):
```typescript
coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
    reportsDirectory: './coverage',
    include: ['src/**/*.{ts,tsx}'],
    exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/**',
        'src/test-setup.ts',
        'src/main.tsx',
    ],
},
```

**View Coverage:**
```bash
# After running tests with --coverage flag
# Coverage reports are in ./coverage/ directory
# Open coverage/index.html in browser for visual report
```

## Test Types

**Unit Tests:**
- Scope: Individual functions/methods in isolation
- Approach: Mock all external dependencies, test logic only
- Examples: `teacherService.test.ts`, `schoolService.test.ts`
- Pattern: Test service methods with mocked models

**Component Tests:**
- Scope: Individual React components
- Approach: Mock child components and external services, render and test UI behavior
- Examples: `DataTable.test.tsx`, `ExportButton.test.tsx`, `FilterSheet.test.tsx`
- Pattern: Render component, query DOM, simulate user interactions, verify output

**Integration Tests:**
- Status: Not extensively used; focus is on unit + component tests
- Could be added for service-to-model interactions or component workflows
- Would test actual database or multiple components together

**E2E Tests:**
- Status: Not currently implemented
- Would require separate test runner (e.g., Playwright, Cypress)
- Not in current test suite

## Common Patterns

**Async Testing:**

Backend services:
```typescript
it('should return teacher if found and not deleted', async () => {
    const mockTeacher = { name: 'John' };
    Teacher.findOne.mockResolvedValue(mockTeacher);

    const result = await TeacherService.getTeacherById('123');

    expect(result).toEqual(mockTeacher);
});
```

**Error Testing:**

Null/missing scenarios:
```typescript
it('should return null if teacher not found', async () => {
    Teacher.findOne.mockResolvedValue(null);

    const result = await TeacherService.getTeacherById('123');

    expect(result).toBeNull();
});

it('should return false if teacher not found', async () => {
    Teacher.findOne.mockResolvedValue(null);

    const result = await TeacherService.deleteTeacher('123');

    expect(result).toBe(false);
});
```

Boolean success patterns:
```typescript
it('should soft delete teacher', async () => {
    const mockTeacher = {
        _id: '123',
        isDeleted: false,
        save: vi.fn().mockResolvedValue(true)
    };
    Teacher.findOne.mockResolvedValue(mockTeacher);

    const result = await TeacherService.deleteTeacher('123');

    expect(mockTeacher.isDeleted).toBe(true);
    expect(mockTeacher.save).toHaveBeenCalled();
    expect(result).toBe(true);
});
```

**DOM Testing (Frontend):**

Query patterns:
```typescript
// Query by role (preferred)
expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();

// Query by test ID
expect(screen.getByTestId('toolbar')).toBeInTheDocument();

// Query by text
expect(screen.getByText('Import CSV')).toBeInTheDocument();
```

User interaction:
```typescript
fireEvent.click(screen.getByRole('button'));
userEvent.type(screen.getByRole('textbox'), 'text');
```

## Global Test Setup

**Frontend Setup File:** `frontend/src/test-setup.ts`
```typescript
import '@testing-library/jest-dom';
```

**Vitest Globals:**
- Both backend and frontend enable `globals: true`
- Means `describe`, `it`, `expect`, `beforeEach`, `vi` available without imports
- All tests can use these without explicit import statements

## Test Statistics

**Current Test Count:** 28 test files across frontend and backend

**Backend Test Coverage:**
- `backend/src/services/__tests__/` - Service unit tests
- Mocked database models
- Tests for: TeacherService, SchoolService

**Frontend Test Coverage:**
- `frontend/src/**/__tests__/` - Component and service tests
- Mocked child components and APIs
- Tests for: DataTable, ExportButton, FilterSheet, Dashboard, Header, ProjectContext, etc.
- Component rendering and user interaction tests

---

*Testing analysis: 2026-01-27*
