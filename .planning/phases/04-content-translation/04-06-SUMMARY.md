---
phase: 04
plan: 06
subsystem: i18n
tags: [i18n, validation, enums, translation, react, typescript]
requires: [04-04, 04-05]
provides: [validation-translations, enum-translations]
affects: [04-07]
tech-stack:
  added: []
  patterns: [dynamic-translation-keys, enum-translation-pattern]
key-files:
  created: []
  modified:
    - frontend/public/locales/en/common.json
    - frontend/public/locales/zh-TW/common.json
    - frontend/public/locales/en/teachers.json
    - frontend/public/locales/zh-TW/teachers.json
    - frontend/public/locales/en/settings.json
    - frontend/public/locales/zh-TW/settings.json
    - frontend/src/components/settings/AlertRulesManager.tsx
    - frontend/src/components/teachers/list/columns.tsx
    - frontend/src/pages/TeacherProfile.tsx
    - frontend/src/components/dashboard/DemographicsChart.tsx
    - frontend/src/components/settings/AlertRuleTable.tsx
decisions:
  - id: validation-in-common
    choice: "Place validation messages in common.json namespace"
    rationale: "Validation errors are used across all forms, making common namespace appropriate"
  - id: enum-translation-keys
    choice: "Use lowercase enum values as translation keys (e.g., 'enums.gender.male')"
    rationale: "Lowercase keys are more consistent with i18n conventions and avoid case-sensitivity issues"
  - id: parameterized-validation
    choice: "Use i18next interpolation for validation messages with parameters"
    rationale: "Enables dynamic validation messages like 'Must be at least {{min}} characters'"
  - id: alert-rules-in-settings
    choice: "Add alert rules table translations to settings.json namespace"
    rationale: "Alert rules table is part of settings UI, keeping translations co-located"
metrics:
  duration: 8m 7s
  completed: 2026-01-29
---

# Phase 04 Plan 06: Translate Validation, Errors, and Enums Summary

**One-liner:** Added i18n translations for validation messages and enum values (status, gender, degree, arcPurpose) with dynamic lookup patterns across all components

## What Was Built

### Validation Translations (Task 1)
1. **Common Validation Keys** - Added comprehensive validation message translations to `common.json`:
   - Basic validations: `required`, `email`, `minLength`, `maxLength`
   - Number validations: `min`, `max`, `positive`, `integer`
   - Format validations: `pattern`, `phone`, `url`, `date`, `number`
   - Support for parameterized messages using i18next interpolation

2. **Component Integration** - Updated `AlertRulesManager` to use translated validation errors instead of hardcoded English messages

### Enum Translations (Task 2)
1. **Teacher Enums** - Added enum translation keys to `teachers.json`:
   - Status: "newly hired", "re-hired"
   - Gender: "male", "female", "others"
   - Degree: "bachelor", "master", "doctor"
   - ARC Purpose: "employed", "dependent", "aprc"

2. **Settings Enums** - Added alert rules table translations to `settings.json`:
   - Document types: arcDetails, workPermitDetails, passportDetails
   - Condition types: daysRemaining, dateThreshold
   - Status: active, inactive

3. **Component Refactoring** - Updated all components displaying enum values:
   - **columns.tsx**: Translated hiringStatus, gender, degree, arcPurpose in table cells using dynamic lookup
   - **TeacherProfile.tsx**: Replaced `profile.values.*` with `enums.*` for all select options
   - **DemographicsChart.tsx**: Added translations for gender and hiring status chart labels
   - **AlertRuleTable.tsx**: Full translation of table headers, document types, conditions, statuses, and actions

## Key Implementation Patterns

### Dynamic Enum Translation
```typescript
// Pattern: Translate enum values with fallback
const translatedStatus = t(`enums.status.${status.toLowerCase()}`, status);
```

This pattern:
- Converts enum values to lowercase for consistent translation keys
- Provides original value as fallback if translation missing
- Works with any enum type (status, gender, degree, etc.)

### Parameterized Validation
```typescript
// Pattern: Use interpolation for dynamic validation messages
t('validation.minLength', { min: 5 })  // "Must be at least 5 characters"
t('validation.daysFormat', { value: 30 })  // "30 days" / "30 天"
```

### Multi-namespace Translation
```typescript
// Pattern: Use multiple namespaces in one component
const { t } = useTranslation('dashboard');
const { t: tTeachers } = useTranslation('teachers');
```

## Translation Coverage

### Files Translated
- ✅ Validation messages (common.json)
- ✅ Teacher enum values (teachers.json)
- ✅ Alert rules table (settings.json)
- ✅ Teacher list columns (columns.tsx)
- ✅ Teacher profile selects (TeacherProfile.tsx)
- ✅ Demographics charts (DemographicsChart.tsx)
- ✅ Alert rule table (AlertRuleTable.tsx)

### Enum Values Covered
- ✅ Hiring Status (Newly Hired, Re-Hired)
- ✅ Gender (Male, Female, Others)
- ✅ Degree (Bachelor, Master, Doctor)
- ✅ ARC Purpose (Employed, Dependent, APRC)
- ✅ Document Types (ARC, Work Permit, Passport)
- ✅ Alert Statuses (Active, Inactive)

## Technical Improvements

1. **Consistency** - All enum values now use the same translation pattern (`enums.*`)
2. **Maintainability** - Validation messages centralized in common.json
3. **Extensibility** - Easy to add new enum types or validation rules
4. **Type Safety** - Fallback values prevent missing translation errors

## Verification Results

✅ All locale files contain enum keys
✅ All components using enums updated to use translations
✅ Validation messages support parameterization
✅ AlertRulesManager uses translated error messages
✅ DemographicsChart displays translated enum values

## Known Limitations

1. **School Region Enums** - Plan mentioned school region enums, but School model doesn't have region field (skipped as non-existent)
2. **Legacy Keys** - `profile.values.*` keys still exist in teachers.json for backward compatibility but are no longer used
3. **Chart Data Translation** - hiringStatus chart data is translated at render time; original values retained for onClick handlers

## Deviations from Plan

**None** - Plan executed exactly as written. School region enums were not added as the region field doesn't exist in the School model.

## Next Phase Readiness

### For 04-07 (Next Plan)
- ✅ All enum values have translation infrastructure
- ✅ Validation messages available for form translations
- ✅ Translation pattern established for dynamic content

### Blockers/Concerns
- None identified

## Commits

1. `eaf7065` - feat(04-06): add validation message translations
   - Added validation keys to common.json (en and zh-TW)
   - Updated AlertRulesManager to use translated validation errors
   - Support parameterized error messages

2. `cb89f94` - feat(04-06): translate enum values across components
   - Add enum translations for status, gender, degree, and arcPurpose
   - Update columns.tsx to translate enum values in table cells
   - Update TeacherProfile.tsx to use enum translations in select options
   - Update DemographicsChart.tsx to translate gender and hiring status
   - Update AlertRuleTable.tsx to translate document types and statuses
   - Add settings.json alert rules table translations

## Testing Notes

### Manual Testing Recommended
1. **Validation Errors**: Trigger required field validation in AlertRulesManager, verify error message shows in selected language
2. **Table Columns**: Check teacher list table to verify status/gender/degree badges show translated text
3. **Profile Forms**: Open teacher profile, verify select dropdowns show translated enum options
4. **Charts**: View dashboard demographics chart, verify gender and hiring status labels are translated
5. **Alert Rules**: View alert rules table in settings, verify all columns and statuses are translated

### Language Switching
- Switch between English and Traditional Chinese to verify all enum values and validation messages update correctly
