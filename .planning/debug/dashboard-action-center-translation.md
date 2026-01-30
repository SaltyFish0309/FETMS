---
status: diagnosed
trigger: "Dashboard Action Center and Qualified Candidates not translated"
created: 2026-01-29T00:00:00Z
updated: 2026-01-29T00:03:30Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - Components have hardcoded English strings
test: Verified both components and translation infrastructure
expecting: Components need useTranslation hook and translation keys added
next_action: Return diagnosis to orchestrator

## Symptoms

expected: Action Center and Qualified Candidates section titles and content should translate
actual: They show English text (not translated)
errors: None
reproduction: Navigate to Dashboard, change language - Action Center and Qualified Candidates remain in English
started: After Phase 4 Plan 3 implementation (KPI cards and chart titles were translated)

## Eliminated

## Evidence

- timestamp: 2026-01-29T00:01:00Z
  checked: ExpiryWidget.tsx (lines 85-86, 96-99, 109-111, 35, 57, 60, 66)
  found: Hardcoded English strings - "Action Center", "Active Compliance Alerts", "Alert Rules Settings", "Configure custom alert triggers", "No active alerts", "Expires:", "Rule:", "Alert"
  implication: Component does not use useTranslation hook at all

- timestamp: 2026-01-29T00:02:00Z
  checked: CandidateList.tsx (lines 32, 35, 39, 49, 50, 56)
  found: Hardcoded English strings - "Qualified Candidates", "Found", "Teachers matching current filters", "Ready to Search", "Select segments on the charts or apply filters to see matching candidates here", "No candidates match these filters"
  implication: Component does not use useTranslation hook at all

- timestamp: 2026-01-29T00:03:00Z
  checked: Both components' imports
  found: Neither component imports 'useTranslation' from 'react-i18next'
  implication: No translation infrastructure in place for these components

- timestamp: 2026-01-29T00:03:30Z
  checked: frontend/public/locales/en/dashboard.json and zh-TW/dashboard.json
  found: Translation files exist with KPI and chart translations, but NO keys for Action Center or Qualified Candidates sections
  implication: Translation keys need to be added for both components

## Resolution

root_cause: ExpiryWidget and CandidateList components have hardcoded English strings, don't import useTranslation, and the dashboard.json files lack translation keys for these sections
fix: 
verification: 
files_changed: []
