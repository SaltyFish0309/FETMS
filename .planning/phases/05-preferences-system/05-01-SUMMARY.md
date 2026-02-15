---
phase: 05-preferences-system
plan: 01
subsystem: preferences-infrastructure
tags: [react-context, localStorage, i18n, cross-tab-sync]

dependency-graph:
  requires:
    - "04-content-translation (toast keys, i18next integration)"
    - "existing ProjectContext pattern"
  provides:
    - "preferencesService with localStorage abstraction"
    - "PreferencesContext for React state management"
    - "Cross-tab synchronization via storage events"
  affects:
    - "05-02: Settings UI will consume usePreferences hook"
    - "05-03: Typography system will read fontSize preference"
    - "05-04: Density system will read density preference"
    - "05-05: Reduced motion will read reducedMotion preference"

tech-stack:
  added:
    - "preferencesService (localStorage abstraction)"
    - "PreferencesContext (React context for preferences)"
  patterns:
    - "Lazy state initialization for localStorage reads"
    - "Merge-with-defaults schema evolution strategy"
    - "Storage event listener for cross-tab sync"
    - "Type-only imports for verbatimModuleSyntax compliance"

key-files:
  created:
    - frontend/src/services/preferencesService.ts
    - frontend/src/contexts/PreferencesContext.tsx
  modified:
    - frontend/src/App.tsx
    - frontend/public/locales/en/common.json
    - frontend/public/locales/zh-TW/common.json

decisions:
  - id: PREF-001
    title: "Merge-with-defaults for schema evolution"
    choice: "In preferencesService.load(), merge parsed preferences with defaults"
    rationale: "Handles missing keys when new preferences added in future without corrupting user's existing settings"
    date: 2026-01-30
  - id: PREF-002
    title: "Silent cross-tab sync via storage events"
    choice: "Listen to storage events and update state automatically without user notification"
    rationale: "Per CONTEXT.md user decision - seamless experience, changes apply instantly"
    date: 2026-01-30
  - id: PREF-003
    title: "Type-only import for UserPreferences"
    choice: "Use 'import type' for UserPreferences in PreferencesContext"
    rationale: "Required by TypeScript verbatimModuleSyntax setting to avoid runtime imports of type-only exports"
    date: 2026-01-30

metrics:
  duration: "3m 20s"
  completed: 2026-01-30
---

# Phase 05 Plan 01: Preferences Infrastructure Summary

**One-liner:** localStorage-backed preferences service with React context, cross-tab sync via storage events, and merge-with-defaults schema evolution.

## What Was Built

Created the foundational preferences infrastructure for storing and managing user preferences (fontSize, density, reducedMotion):

1. **preferencesService** - localStorage abstraction with:
   - `load()`: Read from localStorage with validation, error handling, and merge-with-defaults
   - `save()`: Write to localStorage with quota error handling
   - `getDefaults()`: Return default preferences for reset functionality
   - Translated toast notifications for corrupted data and save failures

2. **PreferencesContext** - React context with:
   - Lazy initialization from preferencesService
   - Auto-persist on state changes
   - Cross-tab synchronization via storage events
   - `updatePreferences()` for partial updates
   - `resetPreferences()` for defaults restoration

3. **Translation keys** - Added toast.preferences namespace:
   - `corrupted`: Warning when localStorage data is invalid
   - `saveFailed`: Error when localStorage.setItem fails

4. **App.tsx integration** - PreferencesProvider wrapped around ProjectProvider

## How It Works

**Initialization flow:**
1. PreferencesProvider mounts, lazy initializer calls preferencesService.load()
2. preferencesService reads localStorage, validates structure, merges with defaults
3. If corrupted: log error, show warning toast, return defaults
4. State initialized with valid preferences

**Update flow:**
1. Component calls updatePreferences({ fontSize: 'large' })
2. Context merges update with current state
3. useEffect triggers, calls preferencesService.save()
4. localStorage updated with new JSON
5. storage event fires in other tabs
6. Other tabs' PreferencesContext receives event, updates state

**Error handling:**
- Invalid JSON → warning toast, reset to defaults
- Missing keys → merge with defaults (graceful degradation)
- localStorage quota exceeded → error toast, log error
- Storage event parse failure → keep current preferences, log error

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Type-only import for UserPreferences**
- **Found during:** Task 3 build verification
- **Issue:** TypeScript error TS1484 - UserPreferences imported as value when verbatimModuleSyntax enabled
- **Fix:** Changed to `import type { UserPreferences }`
- **Files modified:** frontend/src/contexts/PreferencesContext.tsx
- **Commit:** 9185fa4

## Technical Decisions

**localStorage key structure:**
- Single key `userPreferences` stores entire preferences object as JSON
- Simpler than multiple keys, atomic updates, easier cross-tab sync

**Validation strategy:**
- Explicit validation function checks enum values and types
- Catches corrupted data before it enters React state
- Prevents invalid preferences from propagating

**Cross-tab sync mechanism:**
- storage events (not BroadcastChannel) for broader browser support
- Automatic state update without user notification (silent sync)
- Parse errors handled gracefully without breaking other tabs

**Schema evolution:**
- Merge-with-defaults on load ensures missing keys filled in
- Allows adding new preferences without breaking existing users
- Old preferences preserved, new ones get defaults

## Files Changed

**Created (2 files):**
- `frontend/src/services/preferencesService.ts` (100 lines) - localStorage abstraction
- `frontend/src/contexts/PreferencesContext.tsx` (75 lines) - React context provider

**Modified (3 files):**
- `frontend/public/locales/en/common.json` - Added toast.preferences keys
- `frontend/public/locales/zh-TW/common.json` - Added toast.preferences keys
- `frontend/src/App.tsx` - Wrapped PreferencesProvider

**Total impact:** ~180 lines added

## Testing Performed

1. **TypeScript compilation:** `npx tsc --noEmit` passes
2. **Production build:** `npm run build` succeeds
3. **JSON validation:** Both locale files parse without errors
4. **Import validation:** Type-only imports comply with verbatimModuleSyntax

## Next Phase Readiness

**Ready for 05-02 (Settings UI):**
- ✅ usePreferences hook exported and available
- ✅ updatePreferences() accepts partial updates
- ✅ resetPreferences() ready for "Reset All" button
- ✅ Translation keys exist for toast notifications

**Ready for 05-03/04/05 (Apply preferences):**
- ✅ preferences.fontSize available for typography
- ✅ preferences.density available for spacing
- ✅ preferences.reducedMotion available for animations
- ✅ Cross-tab sync ensures consistency

**No blockers identified.**

## Lessons Learned

1. **verbatimModuleSyntax strictness**: TypeScript's verbatimModuleSyntax requires type-only imports for type exports. Build tool catches this even when `tsc --noEmit` doesn't always surface it clearly.

2. **Storage events don't fire in same tab**: Window storage events only fire in OTHER tabs, not the tab that made the change. This is why we persist via useEffect, not via storage event handler.

3. **Lazy initialization pattern**: Using a function initializer for useState prevents reading localStorage on every render, only on mount.

4. **Merge-with-defaults is essential**: Without it, adding new preferences in the future would break for users with existing localStorage data.

## Metadata

**Wave:** 1 (Foundation)
**Duration:** 3 minutes 20 seconds
**Commits:** 5 (4 feature + 1 fix)
**Tasks completed:** 4/4

---

*Generated: 2026-01-30*
*Phase: 05-preferences-system*
*Plan: 01*
