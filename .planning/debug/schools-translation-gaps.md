---
status: investigating
trigger: "Schools page Import CSV button and Re-Hired status showing in English, plus translation quality issue"
created: 2026-01-29T00:00:00Z
updated: 2026-01-29T00:00:00Z
---

## Current Focus

hypothesis: confirmed - multiple translation gaps found
test: complete
expecting: ready to return diagnosis
next_action: return diagnosis to caller

## Symptoms

expected: Import CSV button translates, status values show in Chinese, Contact Person label shows as 負責人
actual: Import CSV button in English, Re-Hired status in English, Contact Person shows as 主要人員
errors: none
reproduction: navigate to Schools page with Chinese locale
started: Phase 4 Plan 5 translated pages but missed these elements

## Eliminated

## Evidence

- timestamp: 2026-01-29T00:00:00Z
  checked: ImportSchoolsDialog.tsx lines 161-227
  found: 10+ hardcoded English strings with no i18n hook usage
  implication: component never integrated with i18n system

- timestamp: 2026-01-29T00:00:00Z
  checked: SchoolProfile.tsx line 241
  found: status rendered as raw value {teacher.personalInfo?.hiringStatus || '-'}
  implication: no enum translation mapping applied

- timestamp: 2026-01-29T00:00:00Z
  checked: zh-TW/schools.json line 40
  found: "keyPersonnel": "主要人員"
  implication: translation quality issue - should be 負責人

- timestamp: 2026-01-29T00:00:00Z
  checked: zh-TW/teachers.json lines 78-79
  found: status translations exist as "newly hired": "新聘", "re-hired": "續聘"
  implication: translations available but not used in SchoolProfile

## Resolution

root_cause: Three separate issues - (1) ImportSchoolsDialog missing i18n integration, (2) SchoolProfile not using enum translation mapper for status, (3) translation quality issue in schools.json
fix: pending
verification: pending
files_changed: []
