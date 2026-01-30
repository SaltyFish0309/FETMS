---
status: diagnosed
phase: 04-content-translation
source: 04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md, 04-05-SUMMARY.md, 04-06-SUMMARY.md
started: 2026-01-29T06:45:00Z
updated: 2026-01-29T07:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Sidebar Navigation Translation
expected: Sidebar navigation items translate when switching languages (Dashboard → 儀表板, Teachers → 教師, Schools → 學校, Documents → 文件, Settings → 設定)
result: pass

### 2. Header Search Placeholder Translation
expected: Header search placeholder changes from "Search..." to Chinese equivalent when switching languages
result: pass

### 3. Settings Page Translation
expected: Settings page shows translated title "設定", subtitle, section headings (5 sections), and action labels when language is Traditional Chinese
result: issue
reported: "The 5 cards in Settings are translated successfully. However, the content in each card is not."
severity: minor

### 4. Dashboard KPI Cards Translation
expected: Dashboard KPI card labels translate: Total Teachers → 教師總數, Partner Schools → 合作學校, In Recruitment → 招募中, Actions Needed → 待處理事項
result: issue
reported: "Pass, but the Action Center and the Qualified Candidates are not translated."
severity: major

### 5. Dashboard Chart Titles Translation
expected: All 7 dashboard chart titles translate: Recruitment Pipeline → 招募流程, Nationality → 國籍分布, Gender Distribution → 性別分布, Hiring Status → 聘用狀態, Education Level → 教育程度, Salary Distribution → 薪資分布, Years of Experience → 教學年資
result: pass

### 6. Dashboard Filter Controls Translation
expected: Dashboard filter UI shows "篩選條件：" and "清除全部" button when in Traditional Chinese
result: issue
reported: "Pass. However, if I apply '續聘' filter, the label in the filter is still English: 狀態:Re-Hired. Furthermore, in the chart '教育程度', it's still in English, 'Bachelor' and 'Master'."
severity: major

### 7. Teachers Page Data Table Columns
expected: Teachers page table column headers translate (Name, Email, Nationality, Status, Gender, Education, etc.) when language is Traditional Chinese
result: pass

### 8. Teachers Page Filter UI
expected: Teachers page filter search placeholder and filter labels translate when switching to Traditional Chinese
result: issue
reported: "The filter side window and the labels are still in English. Column Visibility is all in English as well. The button 'Import CSV' is English, too."
severity: major

### 9. Teacher Profile Enum Values
expected: Teacher profile shows translated enum values for Status (新進聘用/續聘), Gender (男性/女性/其他), Degree (學士/碩士/博士) when in Traditional Chinese
result: issue
reported: "Pass, but a few places are still in English: 1) Newly Hired in Badge, 2) Expiry Date and Issue Date labels"
severity: major

### 10. Schools Page Translation
expected: Schools page title, column headers, and all UI text translate to Traditional Chinese when language is switched
result: issue
reported: "A few places not in English: 1) Import CSV button 2) Re-Hired status in table. One minor better translation: 主要人員 should be 負責人 instead"
severity: major

### 11. School Profile Page Translation
expected: School profile page shows translated section headings, labels, and buttons when language is Traditional Chinese
result: skipped
reason: Covered in Test 10

### 12. Documents Page Translation
expected: Documents page title, upload button, table headers, and filter controls translate to Traditional Chinese
result: pass

### 13. Validation Error Messages
expected: Trigger a required field validation error in Settings Alert Rules - error message shows in selected language (required field message in English or Traditional Chinese)
result: issue
reported: "A toast message in English appear: Failed to save alert rule"
severity: major

### 14. Table Enum Badge Translation
expected: Teacher list table shows translated status, gender, and degree values (e.g., "新進聘用" not "Newly Hired") when language is Traditional Chinese
result: pass

### 15. Demographics Chart Enum Labels
expected: Dashboard demographics charts (Gender, Hiring Status) display translated enum values in chart labels and legend when language is Traditional Chinese
result: pass

### 16. Alert Rules Table Translation
expected: Settings page Alert Rules table shows translated column headers, document types, conditions, and statuses in Traditional Chinese
result: issue
reported: "Pass, but the popup Window to edit the rule or add rule is in English: Create Alert Rule, Edit Alert Rule, all form fields. Toast message as well: Alert rule updated"
severity: major

## Summary

total: 16
passed: 6
issues: 8
pending: 0
skipped: 1

## Gaps

- truth: "Settings card content displays in selected language"
  status: failed
  reason: "User reported: The 5 cards in Settings are translated successfully. However, the content in each card is not."
  severity: minor
  test: 3
  root_cause: "Settings card content uses hardcoded English strings instead of i18n translation keys - components are missing useTranslation() hook integration"
  artifacts:
    - path: "frontend/src/pages/ProjectSettings.tsx"
      issue: "All UI text hardcoded - missing useTranslation integration"
    - path: "frontend/src/pages/AlertSettings.tsx"
      issue: "Page header and button text hardcoded"
    - path: "frontend/src/pages/StageSettings.tsx"
      issue: "Page header and messages hardcoded"
    - path: "frontend/src/pages/PreferencesSettings.tsx"
      issue: "All card content hardcoded"
    - path: "frontend/src/pages/ImportSettings.tsx"
      issue: "All content hardcoded"
    - path: "frontend/src/components/projects/CreateProjectDialog.tsx"
      issue: "Dialog entirely in English"
    - path: "frontend/src/components/projects/EditProjectDialog.tsx"
      issue: "Dialog entirely in English"
    - path: "frontend/src/components/settings/AlertRuleDialog.tsx"
      issue: "All form content hardcoded"
    - path: "frontend/src/components/settings/CreateStageDialog.tsx"
      issue: "Dialog entirely in English"
    - path: "frontend/src/components/settings/SortableStageItem.tsx"
      issue: "Label hardcoded"
  missing:
    - "Import useTranslation hook from react-i18next in all listed components"
    - "Add translation keys to frontend/public/locales/en/settings.json"
    - "Add Traditional Chinese translations to frontend/public/locales/zh-TW/settings.json"
    - "Replace ~200+ hardcoded strings with t('key') calls across 10 files"
  debug_session: ""

- truth: "Dashboard Action Center and Qualified Candidates sections translate"
  status: failed
  reason: "User reported: Pass, but the Action Center and the Qualified Candidates are not translated."
  severity: major
  test: 4
  root_cause: "ExpiryWidget and CandidateList components have hardcoded English strings and lack i18n integration"
  artifacts:
    - path: "frontend/src/components/dashboard/ExpiryWidget.tsx"
      issue: "8+ hardcoded English strings - missing useTranslation integration"
    - path: "frontend/src/components/dashboard/CandidateList.tsx"
      issue: "6+ hardcoded English strings - missing useTranslation integration"
    - path: "frontend/public/locales/en/dashboard.json"
      issue: "Missing translation keys for actionCenter and qualifiedCandidates"
    - path: "frontend/public/locales/zh-TW/dashboard.json"
      issue: "Missing translation keys for actionCenter and qualifiedCandidates"
  missing:
    - "Add useTranslation('dashboard') hook to both components"
    - "Replace all hardcoded strings with t('key') calls"
    - "Add actionCenter.* keys to dashboard.json (title, description, tabs, alerts, settings)"
    - "Add qualifiedCandidates.* keys to dashboard.json (title, description, empty states, labels)"
  debug_session: ""

- truth: "Dashboard filter values and chart data display in selected language"
  status: failed
  reason: "User reported: Pass. However, if I apply '續聘' filter, the label in the filter is still English: 狀態:Re-Hired. Furthermore, in the chart '教育程度', it's still in English, 'Bachelor' and 'Master'."
  severity: major
  test: 6
  root_cause: "Filter badges and EducationChart data labels display raw enum values instead of translating them using the teachers namespace enum translation pattern"
  artifacts:
    - path: "frontend/src/pages/Dashboard.tsx"
      issue: "Lines 140-156 - Filter badge rendering uses raw value and only translates the filter key, not the enum value itself"
    - path: "frontend/src/components/dashboard/EducationChart.tsx"
      issue: "Lines 22-30 - Chart receives data with raw English enum values and displays them directly in YAxis without translation"
  missing:
    - "Dashboard.tsx needs to import useTranslation('teachers') and translate enum values in filter badges based on filter key type"
    - "EducationChart.tsx needs to import useTranslation('teachers') and create a translated data array mapping item.name through tTeachers('enums.degree.${item.name.toLowerCase()}')"
  debug_session: ""

- truth: "Teachers page filter panel, column visibility, and import button translate"
  status: failed
  reason: "User reported: The filter side window and the labels are still in English. Column Visibility is all in English as well. The button 'Import CSV' is English, too."
  severity: major
  test: 8
  root_cause: "Three components lack i18n integration: ImportTeachersDialog, DataTableViewOptions, and FilterSheet are using hardcoded English strings"
  artifacts:
    - path: "frontend/src/components/teachers/ImportTeachersDialog.tsx"
      issue: "All UI text hardcoded - missing useTranslation('teachers') hook"
    - path: "frontend/src/components/teachers/list/DataTableViewOptions.tsx"
      issue: "Button label, dropdown header, and action buttons hardcoded - missing useTranslation('teachers') hook"
    - path: "frontend/src/components/teachers/list/filters/FilterSheet.tsx"
      issue: "Sheet title, badge text, search placeholder, empty state, and Reset button hardcoded - missing useTranslation('teachers') hook"
  missing:
    - "Add useTranslation('teachers') import and hook to all three components"
    - "Add translation keys to frontend/public/locales/en/teachers.json for import, columnVisibility, and filterSheet sections"
    - "Add corresponding Chinese translations to frontend/public/locales/zh-TW/teachers.json"
    - "Replace all hardcoded strings with t() calls"
  debug_session: ""

- truth: "Teacher profile badges and date labels display in selected language"
  status: failed
  reason: "User reported: Pass, but a few places are still in English: 1) Newly Hired in Badge, 2) Expiry Date and Issue Date labels"
  severity: major
  test: 9
  root_cause: "Status badge displays raw database value instead of translated enum, and two date labels are hardcoded in English"
  artifacts:
    - path: "frontend/src/pages/TeacherProfile.tsx"
      issue: "Line 400 - Status badge displays teacher.personalInfo.hiringStatus directly instead of translating it"
    - path: "frontend/src/pages/TeacherProfile.tsx"
      issue: "Line 867 - Expiry Date hardcoded in English"
    - path: "frontend/src/pages/TeacherProfile.tsx"
      issue: "Line 887 - Issue Date hardcoded in English"
  missing:
    - "Status badge needs to translate the enum value using t('enums.status.' + hiringStatus.toLowerCase())"
    - "Expiry Date label needs to use {t('profile.fields.expiryDate')}"
    - "Issue Date label needs to use {t('profile.fields.issueDate')}"
  debug_session: ""

- truth: "Schools page Import CSV button and enum values translate correctly"
  status: failed
  reason: "User reported: A few places not in English: 1) Import CSV button 2) Re-Hired status in table. One minor better translation: 主要人員 should be 負責人 instead"
  severity: major
  test: 10
  root_cause: "ImportSchoolsDialog has no i18n integration, SchoolProfile renders hiring status as raw enum value, and translation quality issue with Contact Person label"
  artifacts:
    - path: "frontend/src/components/schools/ImportSchoolsDialog.tsx"
      issue: "10+ hardcoded English strings - component never uses useTranslation hook"
    - path: "frontend/src/pages/SchoolProfile.tsx"
      issue: "Line 241 - Status rendered directly without translation lookup"
    - path: "frontend/public/locales/zh-TW/schools.json"
      issue: "Line 40 - 主要人員 should be 負責人 for Contact Person"
  missing:
    - "Add import dialog translation keys to both en/schools.json and zh-TW/schools.json"
    - "Integrate useTranslation hook in ImportSchoolsDialog and replace all hardcoded strings"
    - "Apply enum translation pattern to status rendering in SchoolProfile (use teachers:enums.status namespace)"
    - "Update keyPersonnel translation to 負責人 in zh-TW/schools.json"
  debug_session: ""

- truth: "Toast error messages display in selected language"
  status: failed
  reason: "User reported: A toast message in English appear: Failed to save alert rule"
  severity: major
  test: 13
  root_cause: "Toast messages in AlertSettings.tsx and AlertRulesManager.tsx use hardcoded English strings instead of translation keys from i18n"
  artifacts:
    - path: "frontend/src/pages/AlertSettings.tsx"
      issue: "Lines 31, 68, 71, 78, 87, 91 - all 6 toast messages use hardcoded English strings"
    - path: "frontend/src/components/settings/AlertRulesManager.tsx"
      issue: "Lines 51, 64, 85, 92, 95, 104, 108 - 7 toast messages use hardcoded English strings"
    - path: "frontend/public/locales/en/settings.json"
      issue: "Missing toast section for alert-related messages"
  missing:
    - "Add toast section to frontend/public/locales/en/settings.json with keys for alertRules.loadError, createSuccess, updateSuccess, saveError, deleteSuccess, deleteError"
    - "Add corresponding Chinese translations to frontend/public/locales/zh-TW/settings.json"
    - "Update AlertSettings.tsx to import useTranslation and replace 6 hardcoded toast strings"
    - "Update AlertRulesManager.tsx to replace 6 remaining hardcoded toast strings"
  debug_session: ""

- truth: "Alert Rules dialog and success messages translate"
  status: failed
  reason: "User reported: Pass, but the popup Window to edit the rule or add rule is in English: Create Alert Rule, Edit Alert Rule, all form fields. Toast message as well: Alert rule updated"
  severity: major
  test: 16
  root_cause: "AlertRuleDialog component lacks useTranslation hook and contains hardcoded English strings; AlertSettings page has hardcoded toast messages and page title/description"
  artifacts:
    - path: "frontend/src/components/settings/AlertRuleDialog.tsx"
      issue: "No useTranslation import/usage; 21 hardcoded strings (titles, labels, buttons, placeholders, select options)"
    - path: "frontend/src/pages/AlertSettings.tsx"
      issue: "No useTranslation import/usage; hardcoded page title, description, button label, confirm dialog, and 6 toast messages"
  missing:
    - "AlertRuleDialog.tsx needs to import and use useTranslation('settings')"
    - "Add translation keys to settings.json for alertRuleDialog.title, description, fields, placeholders, buttons, selectOptions"
    - "AlertSettings.tsx needs to import and use useTranslation('settings')"
    - "Add translation keys to settings.json for alertRulesPage.title, subtitle, addButton, deleteConfirm, toast messages"
  debug_session: ""
