# Teachers Page Redesign: Unified Toolbar + Hierarchical Filters

**Date:** 2026-01-15
**Status:** Approved for Implementation

## Problem Statement

The current `/teachers` page has UX issues:

1. **Visual hierarchy confusion** - Three separate visual layers (header, floating view toggle box, toolbar) create unnecessary complexity
2. **Inconsistent filter UX** - List view uses a popover with 6 filters; Kanban view shows inline filters
3. **Limited filtering** - Only 6 of 43 data columns are filterable
4. **No visibility-filter connection** - Hidden columns still show filters (wasteful UI)

## Solution Overview

### 1. Unified Toolbar

Consolidate all controls into a single toolbar row:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [🔍 Search...]  [Gender ▾] [Stage ▾] [Status ▾]  [+ Filters]           │
│                                                                          │
│  Active: [Gender: Male ✕] [Stage: Onboarding ✕]              [Clear all]│
│  ─────────────────────────────────────────────  [List|Kanban] [⚙] [⬇]  │
└──────────────────────────────────────────────────────────────────────────┘
```

- Remove the floating white box wrapping View Toggle
- View Toggle (List/Kanban) integrated into toolbar right side
- ⚙ = Column visibility settings
- ⬇ = Export

### 2. Hierarchical Column-Filter Relationship

**Rule:** `Filter available ⟺ Column visible`

When a column is hidden, its corresponding filter is removed from the UI. This reduces clutter and cognitive load.

### 3. Comprehensive Filtering

All 43 columns become filterable with appropriate filter types:

| Filter Type | Columns | UI Component |
|-------------|---------|--------------|
| Select (enum) | Gender, Hiring Status, Degree, Stage, ARC Purpose, Has Salary Increase | Dropdown checkboxes |
| Multi-select (dynamic) | Nationality, Service School, Passport Country | Searchable dropdown |
| Text search | Names, Email, Phone, Addresses | Text input |
| Date range | DOB, expiry dates, contract dates | Date range picker |
| Number range | Salary, Est. Promoted Salary | Min-Max inputs |

### 4. Filter Panel (Sheet)

"+ Filters" button opens a slide-out Sheet containing all available filters grouped by category:

```
┌─────────────────────────────────────┐
│  All Filters                    [✕] │
│  ─────────────────────────────────  │
│  🔍 Search filters...               │
│                                     │
│  ▼ 個人基本資訊                      │
│    Gender         [Any ▾]           │
│    Nationality    [Any ▾]           │
│    Date of Birth  [From] - [To]     │
│                                     │
│  ▼ Education                        │
│    Degree         [Any ▾]           │
│                                     │
│  ▼ Legal Documents                  │
│    Passport Expiry [From] - [To]    │
│    ...                              │
│                                     │
│  ▼ Employment                       │
│    Stage          [Any ▾]           │
│    Salary         [$___] - [$___]   │
│                                     │
│  [Reset All]              [Apply]   │
└─────────────────────────────────────┘
```

Only filters for **visible columns** appear in this panel.

## Technical Design

### Column Configuration Extension

Extend `columnConfig.ts` to include filter metadata:

```typescript
export interface ColumnDef {
  id: string;
  label: string;
  accessor: (teacher: Teacher) => string | number | undefined;
  frozen?: boolean;
  // New filter properties
  filterable?: boolean;
  filterType?: 'select' | 'multi-select' | 'text' | 'date-range' | 'number-range';
  filterOptions?: string[];  // For enum select types
}
```

### New Components

1. **`FilterSheet.tsx`** - Slide-out panel with all filters grouped
2. **`SelectFilter.tsx`** - Dropdown with checkboxes for enum values
3. **`MultiSelectFilter.tsx`** - Searchable dropdown for dynamic values
4. **`DateRangeFilter.tsx`** - Date picker with from/to
5. **`NumberRangeFilter.tsx`** - Min/max inputs for numeric fields
6. **`QuickFilters.tsx`** - Inline quick filters (Gender, Stage, Status)
7. **`ViewModeToggle.tsx`** - Segmented control for List/Kanban

### State Management

Filter state continues to use TanStack Table's built-in `columnFilters` state. The hierarchical visibility logic will be implemented in the toolbar by:

```typescript
const visibleFilterableColumns = useMemo(() => {
  return ALL_COLUMNS.filter(col =>
    col.filterable &&
    table.getColumn(col.id)?.getIsVisible()
  );
}, [table.getState().columnVisibility]);
```

### Files to Modify

1. `frontend/src/pages/Teachers.tsx` - Remove floating view toggle wrapper
2. `frontend/src/components/teachers/list/DataTableToolbar.tsx` - Major refactor
3. `frontend/src/components/teachers/list/DataTableViewOptions.tsx` - Move to gear icon
4. `frontend/src/components/teachers/list/columnConfig.ts` - Add filter metadata
5. `frontend/src/components/teachers/list/columns.tsx` - Add filterFn to all columns

### Files to Create

1. `frontend/src/components/teachers/list/filters/FilterSheet.tsx`
2. `frontend/src/components/teachers/list/filters/SelectFilter.tsx`
3. `frontend/src/components/teachers/list/filters/MultiSelectFilter.tsx`
4. `frontend/src/components/teachers/list/filters/DateRangeFilter.tsx`
5. `frontend/src/components/teachers/list/filters/NumberRangeFilter.tsx`
6. `frontend/src/components/teachers/list/filters/QuickFilters.tsx`
7. `frontend/src/components/teachers/list/ViewModeToggle.tsx`

## Success Criteria

- [ ] Single unified toolbar (no floating view toggle box)
- [ ] View toggle integrated into toolbar
- [ ] All 43 columns filterable with appropriate filter types
- [ ] Hidden columns have hidden filters (hierarchical)
- [ ] Quick filters surface top 3 most-used filters inline
- [ ] "+ Filters" opens sheet with grouped filters
- [ ] Active filters displayed as dismissible badges
- [ ] Consistent UX between List and Kanban views
- [ ] All existing tests pass
- [ ] New filter components have unit tests

## Out of Scope

- Saved filter presets (future enhancement)
- Filter persistence across sessions (future enhancement)
- Advanced query builder (future enhancement)
