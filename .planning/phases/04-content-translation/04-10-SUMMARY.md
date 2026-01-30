---
phase: 04
plan: 10
subsystem: i18n
tags: [i18n, react, translation, enums, csv-import]
requires: [04-09]
provides: [profile-translations, import-dialog-translations]
affects: []
tech-stack:
  added: []
  patterns: [cross-namespace-translation, dynamic-enum-translation]
key-files:
  created: []
  modified:
    - frontend/src/pages/TeacherProfile.tsx
    - frontend/src/components/schools/ImportSchoolsDialog.tsx
    - frontend/src/pages/SchoolProfile.tsx
    - frontend/public/locales/en/schools.json
    - frontend/public/locales/zh-TW/schools.json
decisions:
  - id: schools-template-translation
    choice: "Added template translation keys to schools.json"
    rationale: "Ensured full translation coverage for the import dialog including template download section"
  - id: cross-namespace-enum
    choice: "Imported teachers namespace in SchoolProfile"
    rationale: "Reused existing status enum translations from teachers namespace instead of duplicating"
metrics:
  duration: 15m
  completed: 2026-01-29
---

# Phase 04 Plan 10: Translate Teacher and School Profiles Summary

**One-liner:** Fixed translation gaps in Teacher/School profiles and implemented full i18n for Schools import dialog with Traditional Chinese support

## What Was Built

### 1. Teacher Profile Translation Fixes
- **Status Badge:** Now displays translated enum values (e.g., "新進聘用" instead of "Newly Hired") using dynamic key lookup
- **Date Labels:** Replaced hardcoded "Expiry Date" and "Issue Date" with `t('profile.fields.*')` calls
- **Verification:** Consistent translation across all profile sections (Passport, ARC, Work Permit, Criminal Record)

### 2. Schools Import Dialog Translation
- **Full i18n Integration:** Refactored `ImportSchoolsDialog.tsx` to use `useTranslation('schools')`
- **Locale Keys:** Added comprehensive `importDialog` keys to `en/schools.json` and `zh-TW/schools.json` covering:
  - Dialog title and description
  - File selection and drag-drop text
  - Template download section
  - Loading states and success/error messages
- **Template Support:** Added specific translations for the CSV template section

### 3. School Profile Improvements
- **Enum Translation:** Updated employed teachers table to translate hiring status using `teachers` namespace
- **Cross-Namespace Pattern:** Implemented multi-namespace hook usage (`schools` + `common` + `teachers`)
- **Label Correction:** Updated "Contact Person" translation in Traditional Chinese from "主要人員" to "負責人" per requirements

## Deviations from Plan

### Auto-fixed Issues
- **1. [Rule 2 - Missing Critical] Added template translation keys**
  - **Issue:** Plan didn't specify keys for the "CSV Template" section in ImportDialog
  - **Fix:** Added `templateTitle`, `templateDesc`, and `downloadTemplate` keys to `schools.json`
  - **Impact:** Ensured 100% translation coverage for the dialog

## Key Implementation Patterns

### Cross-Namespace Enum Translation
```typescript
const { t: tTeachers } = useTranslation('teachers');
// ...
{tTeachers(`enums.status.${status.toLowerCase().replace(/\s+/g, '_')}`)}
```
Reused teacher status translations in the schools context to maintain consistency and avoid duplication.

### Dynamic Import Dialog Keys
Structured nested keys for clean organization:
- `importDialog.trigger`
- `importDialog.templateTitle`
- `importDialog.success` (with interpolation)

## Next Phase Readiness

**Blockers:** None
**Ready for:** 04-11 (Alert Settings & Toasts)

## Commits
- `fix(04-10): translate status badge and date labels in TeacherProfile`
- `feat(04-10): add schools import dialog translations and fix contact person label`
- `feat(04-10): integrate i18n in ImportSchoolsDialog`
- `feat(04-10): translate hiring status enum in SchoolProfile`
