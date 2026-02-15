---
phase: 04
plan: 05
subsystem: ui-translation
tags: [i18n, schools, documents, react-i18next]
requires: [04-01]
provides:
  - Schools page translation
  - SchoolProfile page translation
  - Documents page translation
  - schools namespace translations (en, zh-TW)
  - documents namespace translations (en, zh-TW)
affects: [04-06]
decisions:
  - Used 'schools' namespace for all Schools-related pages
  - Used 'documents' namespace for Documents page
  - Applied namespace prefix pattern (e.g., 'schools:title') for all translations
tech-stack:
  added: []
  patterns:
    - i18n namespace organization for feature areas
key-files:
  created:
    - frontend/public/locales/en/schools.json
    - frontend/public/locales/zh-TW/schools.json
    - frontend/public/locales/en/documents.json
    - frontend/public/locales/zh-TW/documents.json
  modified:
    - frontend/src/pages/Schools.tsx
    - frontend/src/pages/SchoolProfile.tsx
    - frontend/src/pages/Documents.tsx
metrics:
  duration: 4m 14s
  completed: 2026-01-29
---

# Phase 4 Plan 5: Translate Schools and Documents Pages Summary

**One-liner:** Implemented comprehensive translation support for Schools management and Documents pages using react-i18next namespaces.

## What Was Implemented

### Task 1: Created schools and documents locale files (Commit: 3d36f9b)
- Created `frontend/public/locales/en/schools.json` with complete translations covering:
  - Page title and subtitle
  - Button labels (add, import, select, cancel, edit, save, back)
  - Table column headers and empty states
  - Dialog content for add/delete operations
  - Profile section titles and field labels
  - Teacher table headers
  - Toast notification messages
- Created `frontend/public/locales/zh-TW/schools.json` with Traditional Chinese translations
- Created `frontend/public/locales/en/documents.json` with basic translations (title, subtitle, coming soon message)
- Created `frontend/public/locales/zh-TW/documents.json` with Traditional Chinese translations

### Task 2: Translated Schools page (Commit: c4c63e8)
- Added `useTranslation` hook to `Schools.tsx` with `['schools', 'common']` namespaces
- Translated all user-facing text:
  - Page header (title, subtitle)
  - Action buttons (Add School, Import Schools, Select Schools, Cancel Selection, Delete)
  - Search placeholder
  - Dialog content (add school form, delete confirmation)
  - Table headers
  - Empty state message
- Added `useTranslation` hook to `SchoolProfile.tsx` with `['schools', 'common']` namespaces
- Translated all user-facing text:
  - Page header and fallback text ("No English Name")
  - Action buttons (Edit Profile, Save Changes, Cancel)
  - Section titles (Basic Information, Key Personnel, Employed Teachers)
  - Form field labels (all Chinese/English name and address fields, principal fields, contact fields)
  - Teacher table headers
  - Toast notification messages (load error, update success/error)
  - Empty state message for teachers table

### Task 3: Translated Documents page (Commit: d6a49df)
- Added `useTranslation` hook with `'documents'` namespace
- Translated page title, subtitle, and coming soon message

## Technical Implementation

**Translation Key Organization:**
- Structured keys by functionality: `title`, `subtitle`, `buttons.*`, `table.*`, `dialog.*`, `profile.*`, `toast.*`
- Used namespace prefix pattern (e.g., `t('schools:title')`, `t('common:actions.cancel')`)
- Multiple namespace support for shared common actions

**Component Integration:**
- Added `useTranslation` import to all three page components
- Used array syntax for multiple namespaces: `useTranslation(['schools', 'common'])`
- Replaced all hardcoded strings with `t()` function calls
- Maintained existing component structure and logic

## Decisions Made

1. **Namespace Organization:** Used feature-based namespaces (`schools`, `documents`) for better code organization and lazy loading
2. **Shared Actions:** Leveraged `common` namespace for frequently used actions (save, cancel, delete, edit) to maintain consistency
3. **Toast Messages:** Included toast notification translations in feature namespace for complete translation coverage
4. **Callback Dependencies:** Updated `loadSchool` useCallback dependency array to include `t` for proper translation updates

## Deviations from Plan

None - plan executed exactly as written.

## Verification Completed

- ✅ Schools.tsx uses `t()` for all user-facing strings
- ✅ SchoolProfile.tsx uses `t()` for all user-facing strings
- ✅ Documents.tsx uses `t()` for all user-facing strings
- ✅ All four locale files (en/zh-TW for schools/documents) created with proper structure
- ✅ Table headers translated
- ✅ Dialog content translated
- ✅ Profile sections and form labels translated
- ✅ Toast messages translated
- ✅ Empty state messages translated

## Files Changed

**Created:**
- `frontend/public/locales/en/schools.json` - 68 lines
- `frontend/public/locales/zh-TW/schools.json` - 68 lines
- `frontend/public/locales/en/documents.json` - 5 lines
- `frontend/public/locales/zh-TW/documents.json` - 5 lines

**Modified:**
- `frontend/src/pages/Schools.tsx` - Added i18n integration (51 insertions, 47 deletions)
- `frontend/src/pages/SchoolProfile.tsx` - Added i18n integration with toast translations
- `frontend/src/pages/Documents.tsx` - Added i18n integration (6 insertions, 4 deletions)

## Testing Notes

- Translation keys are properly namespaced and structured
- All user-facing text in Schools and Documents pages is translatable
- Component logic unchanged - only string replacements
- Ready for manual testing with language switching

## Next Phase Readiness

**Blockers:** None

**Dependencies satisfied:**
- Builds on 04-01 (common translations and i18n setup)
- Provides translations for Schools and Documents sections

**Recommendations:**
- Manual QA should verify all translations display correctly in both English and Traditional Chinese
- Test language switching on Schools and SchoolProfile pages
- Verify toast notifications appear in correct language
- Consider native speaker review for Traditional Chinese translation quality

## Performance Impact

- Minimal - leveraging existing i18n infrastructure
- Locale files loaded lazily by namespace (from 04-01 setup)
- No additional bundle size impact beyond locale JSON files

## Links

- Plan: `.planning/phases/04-content-translation/04-05-PLAN.md`
- Related: `04-01-SUMMARY.md` (common UI translations)
