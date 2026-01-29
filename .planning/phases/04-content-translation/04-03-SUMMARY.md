---
phase: 04
plan: 03
subsystem: dashboard
tags: [i18n, dashboard, kpi, charts, analytics]
requires: [04-01]
provides: [dashboard-translation]
affects: [04-04, 04-05, 04-06]
tech-stack:
  added: []
  patterns: [namespace-loading, chart-translation]
key-files:
  created:
    - frontend/public/locales/en/dashboard.json
    - frontend/public/locales/zh-TW/dashboard.json
  modified:
    - frontend/src/pages/Dashboard.tsx
    - frontend/src/components/dashboard/PipelineChart.tsx
    - frontend/src/components/dashboard/DemographicsChart.tsx
    - frontend/src/components/dashboard/EducationChart.tsx
    - frontend/src/components/dashboard/SalaryChart.tsx
    - frontend/src/components/dashboard/SeniorityChart.tsx
decisions:
  - name: Chart namespace organization
    chosen: Single 'dashboard' namespace for all dashboard elements
    alternatives: [separate-namespaces-per-chart]
    rationale: Simpler management and all charts are conceptually part of dashboard
    date: 2026-01-29
  - name: Filter label translation
    chosen: Use t() with defaultValue fallback for dynamic filter keys
    alternatives: [hardcoded-mapping, enum-based]
    rationale: Flexible approach that handles unknown filter keys gracefully
    date: 2026-01-29
metrics:
  duration: 4m 15s
  completed: 2026-01-29
---

# Phase 04 Plan 03: Translate Dashboard Page Summary

**One-liner:** Internationalized Dashboard page with KPI cards, chart titles, analytics overview, and filter labels using 'dashboard' namespace.

## What Was Built

### Dashboard Translation

Implemented complete i18n for the Dashboard landing page:

1. **Locale Files**: Created `dashboard.json` for English and Traditional Chinese
   - KPI card labels (Total Teachers, Partner Schools, In Recruitment, Actions Needed)
   - Chart titles (Recruitment Pipeline, Nationality, Gender Distribution, Hiring Status, Education Level, Salary Distribution, Years of Experience)
   - Page metadata (title, subtitle, analyticsOverview)
   - Filter labels and controls (Filters:, Clear All, dynamic filter names)
   - Loading state message

2. **Component Updates**: Added `useTranslation('dashboard')` to:
   - Dashboard.tsx - Page title, subtitle, KPI cards, Analytics Overview header, filter UI
   - PipelineChart.tsx - "Recruitment Pipeline" title
   - DemographicsChart.tsx - "Nationality", "Gender Distribution", "Hiring Status" titles
   - EducationChart.tsx - "Education Level" title
   - SalaryChart.tsx - "Salary Distribution" title
   - SeniorityChart.tsx - "Years of Experience" title

### Translation Coverage

**English → Traditional Chinese mappings:**
- Total Teachers → 教師總數
- Partner Schools → 合作學校
- In Recruitment → 招募中
- Actions Needed → 待處理事項
- Recruitment Pipeline → 招募流程
- Nationality → 國籍分布
- Gender Distribution → 性別分布
- Hiring Status → 聘用狀態
- Education Level → 教育程度
- Salary Distribution → 薪資分布
- Years of Experience → 教學年資
- Analytics Overview → 分析總覽
- Filters: → 篩選條件：
- Clear All → 清除全部

### Technical Implementation

**Filter Label Translation:**
Used dynamic translation with fallback for filter badges:
```tsx
const filterLabel = t(`filters.${key}`, { defaultValue: key });
```

This pattern handles:
- Known filters (pipelineStage, salaryRange, degree, etc.) → translated labels
- Unknown filters → falls back to key name
- Prevents errors if new filters added before translations

**Namespace Loading:**
Dashboard components load 'dashboard' namespace automatically via useTranslation hook. No manual namespace registration needed due to i18next-http-backend lazy loading.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create dashboard locale files | 2abb986 | dashboard.json (en, zh-TW) |
| 2 | Translate Dashboard components | edd4428 | Dashboard.tsx, 6 chart components |

## Verification Results

✅ Dashboard title translated
✅ Dashboard subtitle translated
✅ Loading message translated
✅ All 4 KPI card titles translated
✅ All 7 chart titles translated (Pipeline, 3 Demographics, 3 Professional)
✅ Analytics Overview header translated
✅ Filter labels translated (Filters:, Clear All, individual filter names)
✅ Traditional Chinese locale files created with proper translations

## Deviations from Plan

**Auto-fixed Issues:**

**1. [Rule 2 - Missing Critical] Updated locale files with additional chart titles**
- **Found during:** Task 1
- **Issue:** Plan mentioned generic chart keys, but implementation revealed specific chart titles needed (Gender Distribution, Hiring Status, Salary Distribution, Years of Experience)
- **Fix:** Added complete chart title mappings to both locale files after reviewing actual component structure
- **Files modified:** dashboard.json (both locales)
- **Commit:** 2abb986 (included in Task 1 commit)

**2. [Rule 2 - Missing Critical] Added filter translation keys**
- **Found during:** Task 2
- **Issue:** Plan didn't specify filter label translations, but Dashboard UI shows filter badges and Clear All button
- **Fix:** Added filters section to locale files with label, clearAll, and individual filter name keys
- **Files modified:** dashboard.json (both locales)
- **Commit:** 2abb986 (included in Task 1 commit)

All other work completed exactly as planned.

## Decisions Made

### Chart Namespace Organization
**Decision:** Use single 'dashboard' namespace for all dashboard elements

**Context:** Dashboard has multiple chart components, could organize as:
- Option A: Single 'dashboard' namespace with charts.* keys
- Option B: Separate namespaces per chart (pipeline.json, demographics.json, etc.)

**Chosen:** Option A (single dashboard namespace)

**Rationale:**
- All charts are conceptually part of dashboard analytics
- Simpler namespace management (1 file vs 7 files per locale)
- Easier to maintain consistency across chart translations
- Lower overhead for i18next lazy loading

### Filter Label Translation
**Decision:** Use t() with defaultValue fallback for dynamic filter keys

**Context:** Filter badges show dynamically based on active filters. Could handle translation via:
- Option A: Hardcoded switch/case mapping filter keys to labels
- Option B: Enum-based filter type constants
- Option C: Dynamic t() with defaultValue fallback

**Chosen:** Option C (dynamic translation with fallback)

**Implementation:**
```tsx
const filterLabel = t(`filters.${key}`, { defaultValue: key });
```

**Rationale:**
- Handles all current filters (pipelineStage, salaryRange, degree, seniority, etc.)
- Gracefully handles future filters not yet in locale files (falls back to key)
- No code changes needed when adding new filter types
- Clean separation of concerns (translation in locale files, not code)

## Next Phase Readiness

**Phase 04-04 (Translate Teachers Page):** ✅ Ready
- Dashboard namespace pattern established
- Chart translation approach proven
- Filter label pattern reusable for teacher filters

**Phase 04-05 (Translate Schools Page):** ✅ Ready
- KPI card translation pattern established
- Can follow same namespace organization

**Phase 04-06 (Translate Documents Page):** ✅ Ready
- Component translation approach proven across 7 chart components
- Locale file structure consistent

**Blockers:** None

**Concerns:**
- Traditional Chinese chart terminology should be verified by native speaker
- Filter value translations (e.g., "Bachelor", "Master") still show in English - those come from database/backend and aren't covered by this plan's scope
- KPICard component itself doesn't use translations (receives translated title as prop) - component is reusable pattern

## Key Learnings

1. **Dynamic Filter Translation:** Using t() with defaultValue provides excellent flexibility for UI that renders based on runtime state
2. **Namespace Scope:** Single namespace works well for cohesive feature areas (dashboard), even when spread across multiple components
3. **Chart Component Translation:** Each chart component needs its own useTranslation hook - can't inherit from parent Dashboard component
4. **Locale File Discovery:** Reading actual component files revealed additional translation keys not specified in plan (filters, specific chart titles)

## Patterns Established

**Chart Title Translation Pattern:**
```tsx
// In each chart component
import { useTranslation } from "react-i18next";

export function ChartComponent() {
  const { t } = useTranslation('dashboard');

  return (
    <CardTitle>{t('charts.chartName')}</CardTitle>
  );
}
```

**Dynamic Filter Label Translation:**
```tsx
const filterLabel = t(`filters.${key}`, { defaultValue: key });
```

**Locale File Structure for Dashboard:**
```json
{
  "title": "page title",
  "subtitle": "page subtitle",
  "kpi": { "metric1": "label", ... },
  "charts": { "chart1": "title", ... },
  "filters": { "label": "text", "filterName": "label", ... }
}
```

## Testing Notes

**Manual Testing Recommended:**
1. Load Dashboard in English - verify all KPI cards, chart titles, filter labels appear
2. Switch to Traditional Chinese - verify translations applied
3. Apply filters - verify filter badge labels show in current language
4. Click Clear All - verify button text translated
5. Check loading state - verify loading message translated

**What to Test:**
- Page title/subtitle
- 4 KPI cards (Total Teachers, Partner Schools, In Recruitment, Actions Needed)
- 7 chart titles (Pipeline, Nationality, Gender, Status, Education, Salary, Seniority)
- Analytics Overview header
- Filter UI (Filters:, Clear All, individual filter labels)
- Loading state message

**Not Covered by This Plan:**
- Filter values (e.g., "Bachelor", "Male", "USA") - these come from data, not UI
- Expiry Widget - separate component, not in plan scope
- Candidate List - separate component, not in plan scope
- Chart axis labels - Recharts renders these from data
- Toast error messages - needs separate error translation plan
