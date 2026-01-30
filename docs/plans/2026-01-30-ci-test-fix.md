# CI Test & Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Run CI tests locally (backend & frontend), identify failures, and fix them to ensure a clean build.

**Architecture:** The project uses a monorepo structure with `backend` (Node/Express/Vitest) and `frontend` (React/Vite/Vitest). We will validate both independently.

**Tech Stack:** Vitest, React, Node.js, TypeScript.

---

### Task 1: Run & Fix Backend Tests

**Files:**
- Test: `backend/package.json` (script: `test`)
- Potential Failures: `backend/src/**/*.ts`, `backend/src/**/*.test.ts`

**Step 1: Run Backend Tests**
Run: `npm run test --prefix backend`
Expected: Identify failing tests.

**Step 2: Analyze & Fix Failures (Iterative)**
*If tests fail:*
1.  Read the failing test file.
2.  Read the code under test.
3.  Implement fix (modify code or update test if incorrect).
4.  Re-run tests to verify fix.

**Step 3: Verify All Backend Tests Pass**
Run: `npm run test --prefix backend`
Expected: All tests pass.

---

### Task 2: Run & Fix Frontend Tests

**Files:**
- Test: `frontend/package.json` (script: `test`)
- Potential Failures: `frontend/src/**/*.tsx`, `frontend/src/**/*.test.tsx`

**Step 1: Run Frontend Tests**
Run: `npm run test --prefix frontend`
Expected: Identify failing tests.

**Step 2: Analyze & Fix Failures (Iterative)**
*If tests fail:*
1.  Read the failing test file.
2.  Read the component/hook under test.
3.  Implement fix.
4.  Re-run tests to verify fix.

**Step 3: Verify All Frontend Tests Pass**
Run: `npm run test --prefix frontend`
Expected: All tests pass.

---

### Task 3: Run Frontend Linting

**Files:**
- Test: `frontend/package.json` (script: `lint`)

**Step 1: Run Lint**
Run: `npm run lint --prefix frontend`
Expected: Identify linting errors.

**Step 2: Fix Linting Errors**
*If errors exist:*
1.  Fix style/syntax issues.
2.  Re-run lint to verify.
