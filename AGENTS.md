# AGENTS.md

> [!IMPORTANT]
> **CRITICAL INSTRUCTION FOR AI AGENTS**:
> This file is the **IMMUTABLE LAW** of this project.
> Your primary directive is to **bring the codebase into compliance** with these standards.
> If the current code violates these principles (e.g., missing tests, bad architecture), you **MUST REFACTOR IT** immediately before adding features.
> **DO NOT** mimic existing bad patterns. **DO NOT** "Vibe Code".

## 1. Core Philosophy: "The Ideal System"
This project follows strict **Enterprise-Grade** engineering standards. We value correctness, maintainability, and architectural purity over speed.

### The "Zero-Debt" Policy
1.  **Strict Layer Separation**: UI never touches DB. DB never leaks into Controllers.
2.  **Test-Driven**: If it's not tested, it doesn't exist.
3.  **Type Safety**: `noImplicitAny` is law.

## 2. Mandatory Architecture

### 2.1 Backend (Service-Layer Pattern)
**The standard:** `Controller` -> `Service` -> `Data Access`
- **Controllers (`src/controllers` / `src/routes`)**:
    - **Responsibility**: Validation, extracting params, sending HTTP responses.
    - **Forbidden**: Business logic, DB queries, complex conditionals.
- **Services (`src/services`)**:
    - **Responsibility**: All business logic. "Create Teacher", "Calculate Stats".
    - **Structure**: Classes or functional modules. Must be unit-testable without a DB.
- **Models (`src/models`)**:
    - **Responsibility**: Mongoose Schemas.
    - **Rule**: Use **soft deletes** (`isDeleted: true`) instead of actual deletion.
    - **Performance**: Strict indexing on all searchable fields (email, nationality, status).

### 2.2 Frontend (Glassmorphism & Atomic Design)
- **UI Components**: Pure display logic.
    - **Must** use the design tokens in `index.css` (Glassmorphism).
    - **Must** be composed of small "Atom" components (Button, Card, Input).
    - **Must Not** make API calls directly. Use custom hooks.
- **Data Fetching**:
    - All API interaction goes through `services/api.ts`.
    - Components use hooks: `const { data, loading } = useTeachers()`.
- **State Management**:
    - Server State: React Query (or similar hook pattern).
    - UI State: URL params (for sharable links) or Context. **Avoid Redux** unless absolutely necessary.

## 3. Development Workflow (Strict TDD)

**You must follow this cycle for EVERY change:**

1.  **Red (Write Test)**:
    - If adding a feature, write a failing `vitest` spec first.
    - If fixing a bug, write a reproduction test case first.
    - **Infrastructure mandates**:
        - Frontend: `vitest` + `@testing-library/react`.
        - Backend: `vitest` + `supertest`.
        - *If these are missing, INSTALL THEM IMMEDIATELY.*
2.  **Green (Make it Pass)**:
    - Write the minimal code to pass the test.
3.  **Refactor**:
    - Clean up the code. Ensure it meets the 200-line limit per file.

### 3.1 Version Control (Git)
- **Commit Granularity**:
    - Commit **PASSING** tests (`Green`).
    - Commit **REFACTORED** code.
    - **Never** commit broken code to the main branch.
- **Message Format**: `[TYPE] Description` (e.g., `[FEAT] Add teacher profile`, `[TEST] Add tests for auth`).


## 4. Database & Integrity Standards
**Directives for Database Review**:
- **Normalization**: Ensure data is properly normalized. Do not store JSON blobs where a relation table fits better.
- **Consistency**: Use MongoDB Transactions for multi-document updates (e.g., Hiring a teacher updates both `Teacher` and `School` collections).
- **Security**: All PII (Personally Identifiable Information) must be identified.

## 5. Environment & Mechanics
- **Package Manager**: `npm`. Usage of `yarn` or `pnpm` is forbidden to prevent lockfile conflicts.
- **Repo Structure**:
    - `frontend/`: React + Vite.
    - `backend/`: Node + Express.
- **Commands**:
    - `npm run dev`: Starts full stack.
    - `npm run test`: **MUST** run all tests. If this script fails or is missing, **FIX IT FIRST**.

## 6. Handover Checklist (First Tasks for New Agent)
1.  **Audit Compliance**: Scan `package.json`. Is `vitest` installed? If no, install it.
2.  **Audit Database**: Check `src/models`. Do they match the complexity of the requirements (e.g. read/write separation readiness)? Refactor schema if naive.
3.  **Audit Code**: Check `frontend/src/components`. Are there massive files (>300 lines)? Split them.

**End of File. Violations of this document are considered bugs.**
