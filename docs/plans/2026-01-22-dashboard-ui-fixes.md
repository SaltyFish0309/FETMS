# Dashboard UI Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix three UI issues: add scroll constraint to CandidateList, make Header title dynamic based on route, and fix date copy to use UTC+8 formatted dates.

**Architecture:**
- Issue 1: Add `min-h-0` to CardContent and `h-full` to empty states to enable proper flexbox shrinking for scroll
- Issue 2: Refactor Header component to accept a title prop, update App.tsx to pass route-based titles
- Issue 3: Modify DataTable's handleCopy to detect date columns and format appropriately for UTC+8

**Tech Stack:** React, TypeScript, react-router-dom, Radix UI ScrollArea, TanStack Table

---

## Task 1: CandidateList Scroll Constraint [COMPLETED]

**Problem:** When many candidates match filters, the list expands and pushes the parent container height beyond intended bounds. The CandidateList should span the full height of all charts on the left (PipelineChart + DemographicsChart + Professional Charts + gaps).

**Root Cause:** In CSS flexbox, items have `min-height: auto` by default, meaning they won't shrink below their content's intrinsic size. The `overflow-hidden` on CardContent doesn't work because the flex item refuses to shrink.

**Solution:**
1. Add `min-h-0` to CardContent to allow flex item to shrink below content size
2. Change empty state heights from fixed (`h-[500px]`, `h-[400px]`) to `h-full` so they fill available space

**Behavior after fix:**
- **No candidates (empty state):** Card stretches to match left column height. Empty state centers vertically.
- **Few candidates (e.g., 3):** Card stretches to match left column height. Candidates at top, clean space below.
- **Many candidates:** Card stretches to match left column height. Scrollbar handles overflow.

**Files:**
- Modified: `frontend/src/components/dashboard/CandidateList.tsx:41,44,54`
- Test: `frontend/src/components/dashboard/__tests__/CandidateList.test.tsx`

**Changes Made:**

```tsx
// Line 41: Add min-h-0 to CardContent
<CardContent className="p-0 flex-1 overflow-hidden min-h-0">

// Line 44: Change h-[500px] to h-full for "Ready to Search" state
<div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center space-y-4">

// Line 54: Change h-[400px] to h-full for "No matches" state
<div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
```

**Tests added:**
- `has min-h-0 on CardContent to enable flex shrinking for scroll`
- `has h-full on empty state container when no filters applied`
- `has h-full on empty state container when no candidates match`

---

## Task 2: Dynamic Header Title Based on Route [COMPLETED BY PREVIOUS AGENT]

**Problem:** Header always shows "Dashboard" regardless of current page.

**Solution:** Make Header accept a `title` prop and derive title from current route in App.tsx.

**Files:**
- Modified: `frontend/src/components/layout/Header.tsx`
- Modified: `frontend/src/App.tsx`
- Test: `frontend/src/components/layout/__tests__/Header.test.tsx`
- Test: `frontend/src/__tests__/App.test.tsx`

**Implementation:**

Header.tsx now accepts optional `title` prop with default "Dashboard":
```typescript
interface HeaderProps {
    title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
    // ...
    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
}
```

App.tsx derives title from route:
```typescript
const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/teachers': 'Teachers',
  '/schools': 'Schools',
  '/documents': 'Documents',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/teachers/')) return 'Teacher Profile';
  if (pathname.startsWith('/schools/')) return 'School Profile';
  return 'Dashboard';
}
```

---

## Task 3: Fix Date Copy Format for UTC+8 [COMPLETED BY PREVIOUS AGENT]

**Problem:** When copying date cells, the raw ISO string (e.g., `2032-02-09T16:00:00.000Z`) is copied instead of the displayed format. User timezone is UTC+8.

**Solution:** In the `handleCopy` function, detect if the value is a date-like ISO string and format it appropriately for UTC+8.

**Files:**
- Modified: `frontend/src/components/teachers/list/DataTable.tsx:187-209`
- Test: `frontend/src/components/teachers/list/__tests__/DataTable.test.tsx`

**Implementation:**

```typescript
const handleCopy = () => {
    if (!isCopyable) return;
    const value = cell.getValue();
    if (value == null || value === '') return;

    let textValue = String(value);

    // Check if value is an ISO date string and format it for UTC+8
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (isoDateRegex.test(textValue)) {
        const date = new Date(textValue);
        // Format as YYYY/M/D in UTC+8 timezone
        textValue = date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timeZone: 'Asia/Taipei'
        });
    }

    navigator.clipboard.writeText(textValue);
    toast.success(`Copied: ${textValue.length > 50 ? textValue.slice(0, 50) + '...' : textValue}`);
};
```

---

## Task 4: Final Verification

**Step 1: Run full test suite**

Run: `npm run test --prefix frontend -- --run`
Expected: All tests PASS

**Step 2: Run build to check for TypeScript errors**

Run: `npm run build --prefix frontend`
Expected: Build succeeds with no errors

**Step 3: Manual verification checklist**

- [ ] Navigate to Dashboard (`/`) - Header shows "Dashboard"
- [ ] Navigate to Teachers (`/teachers`) - Header shows "Teachers"
- [ ] Navigate to Schools (`/schools`) - Header shows "Schools"
- [ ] Navigate to Documents (`/documents`) - Header shows "Documents"
- [ ] Navigate to Settings (`/settings`) - Header shows "Settings"
- [ ] Navigate to Teacher Profile (`/teachers/:id`) - Header shows "Teacher Profile"
- [ ] Navigate to School Profile (`/schools/:id`) - Header shows "School Profile"
- [ ] Apply multiple filters on Dashboard - CandidateList stays within bounds with scrollbar
- [ ] Click on a date cell in Teachers list - Clipboard contains date formatted as `YYYY/M/D` in UTC+8

**Step 4: Commit the CandidateList fix**

```bash
git add frontend/src/components/dashboard/CandidateList.tsx frontend/src/components/dashboard/__tests__/CandidateList.test.tsx
git commit -m "[FIX] Add scroll constraint to CandidateList with min-h-0 and h-full empty states"
```

---

## Summary

| Task | Issue | Solution | Status |
|------|-------|----------|--------|
| 1 | CandidateList expands container | Add `min-h-0` to CardContent, `h-full` to empty states | COMPLETED |
| 2 | Header always shows "Dashboard" | Add `title` prop to Header, derive from `useLocation` in App | COMPLETED |
| 3 | Date copy includes ISO time format | Detect ISO dates in handleCopy, format with `Asia/Taipei` timezone | COMPLETED |
