# Teachers Page Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Teachers page with a unified toolbar and hierarchical column-aware filters.

**Architecture:** Extend columnConfig.ts with filter metadata, create reusable filter components (SelectFilter, DateRangeFilter, NumberRangeFilter), build a FilterSheet that respects column visibility, and refactor the toolbar to integrate view toggle and quick filters.

**Tech Stack:** React 19, TypeScript, TanStack Table, Shadcn/UI (Sheet, Command, Popover, DatePicker), Tailwind CSS

---

## Phase 1: Foundation - Column Configuration

### Task 1.1: Extend Column Configuration with Filter Metadata

**Files:**
- Modify: `frontend/src/components/teachers/list/columnConfig.ts`
- Test: `frontend/src/components/teachers/list/__tests__/columnConfig.test.ts`

**Step 1: Write the failing test**

Create test file:

```typescript
// frontend/src/components/teachers/list/__tests__/columnConfig.test.ts
import { describe, it, expect } from 'vitest';
import { ALL_COLUMNS, getFilterableColumns, type FilterType } from '../columnConfig';

describe('columnConfig', () => {
  describe('filter metadata', () => {
    it('should have filterType defined for filterable columns', () => {
      const filterableColumns = ALL_COLUMNS.filter(col => col.filterable);

      filterableColumns.forEach(col => {
        expect(col.filterType).toBeDefined();
        expect(['select', 'multi-select', 'text', 'date-range', 'number-range']).toContain(col.filterType);
      });
    });

    it('should have filterOptions for select type columns', () => {
      const selectColumns = ALL_COLUMNS.filter(col => col.filterType === 'select');

      selectColumns.forEach(col => {
        expect(col.filterOptions).toBeDefined();
        expect(Array.isArray(col.filterOptions)).toBe(true);
        expect(col.filterOptions!.length).toBeGreaterThan(0);
      });
    });

    it('getFilterableColumns should return only filterable columns', () => {
      const filterableColumns = getFilterableColumns();

      filterableColumns.forEach(col => {
        expect(col.filterable).toBe(true);
      });
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- --run columnConfig.test.ts`
Expected: FAIL - `getFilterableColumns` is not exported

**Step 3: Update columnConfig.ts with filter metadata**

```typescript
// Add to existing ColumnDef interface
export type FilterType = 'select' | 'multi-select' | 'text' | 'date-range' | 'number-range';

export interface ColumnDef {
    id: string;
    label: string;
    accessor: (teacher: Teacher) => string | number | boolean | undefined;
    frozen?: boolean;
    // Filter properties
    filterable?: boolean;
    filterType?: FilterType;
    filterOptions?: string[];  // For select types with fixed options
}

// Update ALL_COLUMNS with filter metadata
export const ALL_COLUMNS: ColumnDef[] = [
    // GL1: Personal Information
    {
        id: 'hiringStatus',
        label: 'Hiring Status',
        accessor: (t) => t.personalInfo?.hiringStatus,
        filterable: true,
        filterType: 'select',
        filterOptions: ['Newly Hired', 'Re-Hired']
    },
    {
        id: 'chineseName',
        label: 'Chinese Name',
        accessor: (t) => t.personalInfo?.chineseName,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'englishName',
        label: 'English Name',
        accessor: (t) => `${t.firstName} ${t.middleName ? t.middleName + ' ' : ''}${t.lastName}`,
        frozen: true,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'email',
        label: 'Email',
        accessor: (t) => t.email,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'phone',
        label: 'Phone',
        accessor: (t) => t.personalInfo?.phone,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'dob',
        label: 'Date of Birth',
        accessor: (t) => t.personalInfo?.dob ? new Date(t.personalInfo.dob).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'gender',
        label: 'Gender',
        accessor: (t) => t.personalInfo?.gender,
        filterable: true,
        filterType: 'select',
        filterOptions: ['Male', 'Female']
    },
    {
        id: 'nationalityEn',
        label: 'Nationality (EN)',
        accessor: (t) => t.personalInfo?.nationality?.english,
        filterable: true,
        filterType: 'multi-select'  // Dynamic options from data
    },
    {
        id: 'nationalityCn',
        label: 'Nationality (CN)',
        accessor: (t) => t.personalInfo?.nationality?.chinese,
        filterable: false  // Use EN version for filtering
    },
    {
        id: 'addressTaiwan',
        label: 'Address (Taiwan)',
        accessor: (t) => t.personalInfo?.address?.taiwan,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'addressHome',
        label: 'Address (Home)',
        accessor: (t) => t.personalInfo?.address?.home,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'emergencyName',
        label: 'Emergency Contact',
        accessor: (t) => t.emergencyContact?.name,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'emergencyRelationship',
        label: 'Emergency Relationship',
        accessor: (t) => t.emergencyContact?.relationship,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'emergencyPhone',
        label: 'Emergency Phone',
        accessor: (t) => t.emergencyContact?.phone,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'emergencyEmail',
        label: 'Emergency Email',
        accessor: (t) => t.emergencyContact?.email,
        filterable: true,
        filterType: 'text'
    },

    // GL2: Education
    {
        id: 'degree',
        label: 'Degree',
        accessor: (t) => t.education?.degree,
        filterable: true,
        filterType: 'select',
        filterOptions: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate']
    },
    {
        id: 'major',
        label: 'Major',
        accessor: (t) => t.education?.major,
        filterable: true,
        filterType: 'multi-select'
    },
    {
        id: 'school',
        label: 'School',
        accessor: (t) => t.education?.school,
        filterable: true,
        filterType: 'multi-select'
    },

    // GL3: Legal Documents - Passport
    {
        id: 'passportNumber',
        label: 'Passport No.',
        accessor: (t) => t.passportDetails?.number,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'passportExpiry',
        label: 'Passport Expiry',
        accessor: (t) => t.passportDetails?.expiryDate ? new Date(t.passportDetails.expiryDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'passportIssueDate',
        label: 'Passport Issue Date',
        accessor: (t) => t.passportDetails?.issueDate ? new Date(t.passportDetails.issueDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'passportCountry',
        label: 'Passport Country',
        accessor: (t) => t.passportDetails?.issuingCountry,
        filterable: true,
        filterType: 'multi-select'
    },
    {
        id: 'passportAuthority',
        label: 'Passport Authority',
        accessor: (t) => t.passportDetails?.issuingAuthority,
        filterable: true,
        filterType: 'text'
    },

    // GL3: Legal Documents - ARC
    {
        id: 'arcExpiry',
        label: 'ARC Expiry',
        accessor: (t) => t.arcDetails?.expiryDate ? new Date(t.arcDetails.expiryDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'arcPurpose',
        label: 'ARC Purpose',
        accessor: (t) => t.arcDetails?.purpose,
        filterable: true,
        filterType: 'select',
        filterOptions: ['Work', 'Study', 'Dependent', 'Other']
    },

    // GL3: Legal Documents - Work Permit
    {
        id: 'workPermitNumber',
        label: 'Work Permit No.',
        accessor: (t) => t.workPermitDetails?.permitNumber,
        filterable: true,
        filterType: 'text'
    },
    {
        id: 'workPermitExpiry',
        label: 'Work Permit Expiry',
        accessor: (t) => t.workPermitDetails?.expiryDate ? new Date(t.workPermitDetails.expiryDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'workPermitIssueDate',
        label: 'Work Permit Issue',
        accessor: (t) => t.workPermitDetails?.issueDate ? new Date(t.workPermitDetails.issueDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'workPermitStartDate',
        label: 'Work Permit Start',
        accessor: (t) => t.workPermitDetails?.startDate ? new Date(t.workPermitDetails.startDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },

    // GL3: Legal Documents - Teaching License & Criminal Record
    {
        id: 'teachingLicenseExpiry',
        label: 'Teaching License Expiry',
        accessor: (t) => t.teachingLicense?.expiryDate ? new Date(t.teachingLicense.expiryDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'criminalRecordIssue',
        label: 'Criminal Record Issue',
        accessor: (t) => t.criminalRecord?.issueDate ? new Date(t.criminalRecord.issueDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },

    // GL4: Employment
    {
        id: 'serviceSchool',
        label: 'Service School',
        accessor: (t) => t.personalInfo?.serviceSchool,
        frozen: true,
        filterable: true,
        filterType: 'multi-select'
    },
    {
        id: 'contractStart',
        label: 'Contract Start',
        accessor: (t) => t.contractDetails?.contractStartDate ? new Date(t.contractDetails.contractStartDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'contractEnd',
        label: 'Contract End',
        accessor: (t) => t.contractDetails?.contractEndDate ? new Date(t.contractDetails.contractEndDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'payStart',
        label: 'Pay Start',
        accessor: (t) => t.contractDetails?.payStartDate ? new Date(t.contractDetails.payStartDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'payEnd',
        label: 'Pay End',
        accessor: (t) => t.contractDetails?.payEndDate ? new Date(t.contractDetails.payEndDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'salary',
        label: 'Salary',
        accessor: (t) => t.contractDetails?.salary,
        filterable: true,
        filterType: 'number-range'
    },
    {
        id: 'senioritySalary',
        label: 'Seniority (Salary)',
        accessor: (t) => t.contractDetails?.senioritySalary,
        filterable: true,
        filterType: 'number-range'
    },
    {
        id: 'seniorityLeave',
        label: 'Seniority (Leave)',
        accessor: (t) => t.contractDetails?.seniorityLeave,
        filterable: true,
        filterType: 'number-range'
    },
    {
        id: 'hasSalaryIncrease',
        label: 'Has Salary Increase',
        accessor: (t) => t.contractDetails?.hasSalaryIncrease ? 'Yes' : (t.contractDetails?.hasSalaryIncrease === false ? 'No' : undefined),
        filterable: true,
        filterType: 'select',
        filterOptions: ['Yes', 'No']
    },
    {
        id: 'salaryIncreaseDate',
        label: 'Salary Increase Date',
        accessor: (t) => t.contractDetails?.salaryIncreaseDate ? new Date(t.contractDetails.salaryIncreaseDate).toLocaleDateString() : undefined,
        filterable: true,
        filterType: 'date-range'
    },
    {
        id: 'estimatedPromotedSalary',
        label: 'Est. Promoted Salary',
        accessor: (t) => t.contractDetails?.estimatedPromotedSalary,
        filterable: true,
        filterType: 'number-range'
    },

    // Pipeline Stage
    {
        id: 'pipelineStage',
        label: 'Current Stage',
        accessor: (t) => t.pipelineStage,
        filterable: true,
        filterType: 'multi-select'  // Dynamic from stages API
    },
];

// Add helper function
export function getFilterableColumns(): ColumnDef[] {
    return ALL_COLUMNS.filter(col => col.filterable === true);
}

export function getVisibleFilterableColumns(visibleColumnIds: Set<string>): ColumnDef[] {
    return ALL_COLUMNS.filter(col =>
        col.filterable === true && visibleColumnIds.has(col.id)
    );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- --run columnConfig.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/teachers/list/columnConfig.ts frontend/src/components/teachers/list/__tests__/columnConfig.test.ts
git commit -m "feat(teachers): add filter metadata to column configuration"
```

---

## Phase 2: Filter Components

### Task 2.1: Create ViewModeToggle Component

**Files:**
- Create: `frontend/src/components/teachers/list/ViewModeToggle.tsx`
- Test: `frontend/src/components/teachers/list/__tests__/ViewModeToggle.test.tsx`

**Step 1: Write the failing test**

```typescript
// frontend/src/components/teachers/list/__tests__/ViewModeToggle.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewModeToggle } from '../ViewModeToggle';

describe('ViewModeToggle', () => {
  it('renders list and kanban options', () => {
    render(<ViewModeToggle value="list" onChange={() => {}} />);

    expect(screen.getByRole('button', { name: /list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kanban/i })).toBeInTheDocument();
  });

  it('highlights the active mode', () => {
    render(<ViewModeToggle value="list" onChange={() => {}} />);

    const listButton = screen.getByRole('button', { name: /list/i });
    expect(listButton).toHaveClass('bg-white');
  });

  it('calls onChange when mode is switched', () => {
    const onChange = vi.fn();
    render(<ViewModeToggle value="list" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /kanban/i }));
    expect(onChange).toHaveBeenCalledWith('kanban');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- --run ViewModeToggle.test.tsx`
Expected: FAIL - module not found

**Step 3: Implement ViewModeToggle**

```typescript
// frontend/src/components/teachers/list/ViewModeToggle.tsx
import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = 'list' | 'kanban';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('list')}
        className={value === 'list'
          ? 'bg-white text-slate-900 shadow-sm hover:bg-white'
          : 'text-slate-500 hover:text-slate-900 hover:bg-transparent'
        }
        aria-label="List view"
      >
        <List className="h-4 w-4 mr-2" /> List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('kanban')}
        className={value === 'kanban'
          ? 'bg-white text-slate-900 shadow-sm hover:bg-white'
          : 'text-slate-500 hover:text-slate-900 hover:bg-transparent'
        }
        aria-label="Kanban view"
      >
        <LayoutGrid className="h-4 w-4 mr-2" /> Kanban
      </Button>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- --run ViewModeToggle.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/teachers/list/ViewModeToggle.tsx frontend/src/components/teachers/list/__tests__/ViewModeToggle.test.tsx
git commit -m "feat(teachers): add ViewModeToggle component"
```

---

### Task 2.2: Create DateRangeFilter Component

**Files:**
- Create: `frontend/src/components/teachers/list/filters/DateRangeFilter.tsx`
- Test: `frontend/src/components/teachers/list/filters/__tests__/DateRangeFilter.test.tsx`

**Step 1: Write the failing test**

```typescript
// frontend/src/components/teachers/list/filters/__tests__/DateRangeFilter.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangeFilter } from '../DateRangeFilter';

describe('DateRangeFilter', () => {
  it('renders with title', () => {
    render(
      <DateRangeFilter
        title="Contract Start"
        value={undefined}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Contract Start')).toBeInTheDocument();
  });

  it('shows active state when value is set', () => {
    render(
      <DateRangeFilter
        title="Contract Start"
        value={{ from: '2024-01-01', to: '2024-12-31' }}
        onChange={() => {}}
      />
    );

    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('calls onChange with undefined when cleared', () => {
    const onChange = vi.fn();
    render(
      <DateRangeFilter
        title="Contract Start"
        value={{ from: '2024-01-01', to: '2024-12-31' }}
        onChange={onChange}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- --run DateRangeFilter.test.tsx`
Expected: FAIL - module not found

**Step 3: Create filters directory and implement DateRangeFilter**

```typescript
// frontend/src/components/teachers/list/filters/DateRangeFilter.tsx
import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRangeValue {
  from?: string;
  to?: string;
}

interface DateRangeFilterProps {
  title: string;
  value: DateRangeValue | undefined;
  onChange: (value: DateRangeValue | undefined) => void;
}

export function DateRangeFilter({ title, value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false);

  const fromDate = value?.from ? new Date(value.from) : undefined;
  const toDate = value?.to ? new Date(value.to) : undefined;

  const hasValue = value?.from || value?.to;

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      onChange(undefined);
      return;
    }
    onChange({
      from: range.from?.toISOString(),
      to: range.to?.toISOString(),
    });
  };

  const formatDisplayValue = () => {
    if (fromDate && toDate) {
      return `${format(fromDate, 'MMM d')} - ${format(toDate, 'MMM d, yyyy')}`;
    }
    if (fromDate) {
      return `From ${format(fromDate, 'MMM d, yyyy')}`;
    }
    if (toDate) {
      return `Until ${format(toDate, 'MMM d, yyyy')}`;
    }
    return title;
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 border-dashed justify-start text-left font-normal",
              hasValue && "border-solid border-primary"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="truncate max-w-[150px]">{formatDisplayValue()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: fromDate, to: toDate }}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {hasValue && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange(undefined)}
          aria-label="Clear date filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- --run DateRangeFilter.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/teachers/list/filters/
git commit -m "feat(teachers): add DateRangeFilter component"
```

---

### Task 2.3: Create NumberRangeFilter Component

**Files:**
- Create: `frontend/src/components/teachers/list/filters/NumberRangeFilter.tsx`
- Test: `frontend/src/components/teachers/list/filters/__tests__/NumberRangeFilter.test.tsx`

**Step 1: Write the failing test**

```typescript
// frontend/src/components/teachers/list/filters/__tests__/NumberRangeFilter.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberRangeFilter } from '../NumberRangeFilter';

describe('NumberRangeFilter', () => {
  it('renders with title', () => {
    render(
      <NumberRangeFilter
        title="Salary"
        value={undefined}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('shows min and max inputs in popover', () => {
    render(
      <NumberRangeFilter
        title="Salary"
        value={undefined}
        onChange={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /salary/i }));

    expect(screen.getByPlaceholderText(/min/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/max/i)).toBeInTheDocument();
  });

  it('calls onChange when values are entered', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeFilter
        title="Salary"
        value={undefined}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /salary/i }));

    const minInput = screen.getByPlaceholderText(/min/i);
    fireEvent.change(minInput, { target: { value: '50000' } });
    fireEvent.blur(minInput);

    expect(onChange).toHaveBeenCalledWith({ min: 50000, max: undefined });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- --run NumberRangeFilter.test.tsx`
Expected: FAIL - module not found

**Step 3: Implement NumberRangeFilter**

```typescript
// frontend/src/components/teachers/list/filters/NumberRangeFilter.tsx
import * as React from "react";
import { DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface NumberRangeValue {
  min?: number;
  max?: number;
}

interface NumberRangeFilterProps {
  title: string;
  value: NumberRangeValue | undefined;
  onChange: (value: NumberRangeValue | undefined) => void;
  prefix?: string;
}

export function NumberRangeFilter({
  title,
  value,
  onChange,
  prefix = "$"
}: NumberRangeFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [localMin, setLocalMin] = React.useState(value?.min?.toString() ?? '');
  const [localMax, setLocalMax] = React.useState(value?.max?.toString() ?? '');

  const hasValue = value?.min !== undefined || value?.max !== undefined;

  React.useEffect(() => {
    setLocalMin(value?.min?.toString() ?? '');
    setLocalMax(value?.max?.toString() ?? '');
  }, [value]);

  const handleApply = () => {
    const min = localMin ? parseInt(localMin, 10) : undefined;
    const max = localMax ? parseInt(localMax, 10) : undefined;

    if (min === undefined && max === undefined) {
      onChange(undefined);
    } else {
      onChange({ min, max });
    }
    setOpen(false);
  };

  const handleClear = () => {
    setLocalMin('');
    setLocalMax('');
    onChange(undefined);
  };

  const formatDisplayValue = () => {
    if (value?.min !== undefined && value?.max !== undefined) {
      return `${prefix}${value.min.toLocaleString()} - ${prefix}${value.max.toLocaleString()}`;
    }
    if (value?.min !== undefined) {
      return `≥ ${prefix}${value.min.toLocaleString()}`;
    }
    if (value?.max !== undefined) {
      return `≤ ${prefix}${value.max.toLocaleString()}`;
    }
    return title;
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 border-dashed justify-start text-left font-normal",
              hasValue && "border-solid border-primary"
            )}
            aria-label={title}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            <span className="truncate max-w-[120px]">{formatDisplayValue()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min">Minimum</Label>
              <Input
                id="min"
                type="number"
                placeholder="Min"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Maximum</Label>
              <Input
                id="max"
                type="number"
                placeholder="Max"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleClear}>
                Clear
              </Button>
              <Button size="sm" className="flex-1" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {hasValue && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleClear}
          aria-label="Clear number filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- --run NumberRangeFilter.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/teachers/list/filters/NumberRangeFilter.tsx frontend/src/components/teachers/list/filters/__tests__/NumberRangeFilter.test.tsx
git commit -m "feat(teachers): add NumberRangeFilter component"
```

---

### Task 2.4: Create filters/index.ts barrel export

**Files:**
- Create: `frontend/src/components/teachers/list/filters/index.ts`

**Step 1: Create barrel export**

```typescript
// frontend/src/components/teachers/list/filters/index.ts
export { DateRangeFilter, type DateRangeValue } from './DateRangeFilter';
export { NumberRangeFilter, type NumberRangeValue } from './NumberRangeFilter';
```

**Step 2: Commit**

```bash
git add frontend/src/components/teachers/list/filters/index.ts
git commit -m "chore(teachers): add filters barrel export"
```

---

## Phase 3: FilterSheet Component

### Task 3.1: Create FilterSheet Component

**Files:**
- Create: `frontend/src/components/teachers/list/filters/FilterSheet.tsx`
- Test: `frontend/src/components/teachers/list/filters/__tests__/FilterSheet.test.tsx`

**Step 1: Write the failing test**

```typescript
// frontend/src/components/teachers/list/filters/__tests__/FilterSheet.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterSheet } from '../FilterSheet';

// Mock table with visibility state
const createMockTable = (visibleColumns: string[]) => ({
  getColumn: (id: string) => ({
    id,
    getIsVisible: () => visibleColumns.includes(id),
    getFilterValue: () => undefined,
    setFilterValue: vi.fn(),
    getFacetedUniqueValues: () => new Map(),
  }),
  getState: () => ({
    columnVisibility: Object.fromEntries(
      visibleColumns.map(id => [id, true])
    ),
    columnFilters: [],
  }),
  resetColumnFilters: vi.fn(),
});

describe('FilterSheet', () => {
  it('renders filter groups', () => {
    const table = createMockTable(['gender', 'degree', 'salary']);

    render(
      <FilterSheet
        open={true}
        onOpenChange={() => {}}
        table={table as any}
      />
    );

    expect(screen.getByText('個人基本資訊')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Employment')).toBeInTheDocument();
  });

  it('only shows filters for visible columns', () => {
    const table = createMockTable(['gender']); // Only gender visible

    render(
      <FilterSheet
        open={true}
        onOpenChange={() => {}}
        table={table as any}
      />
    );

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.queryByText('Degree')).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test --prefix frontend -- --run FilterSheet.test.tsx`
Expected: FAIL - module not found

**Step 3: Implement FilterSheet**

```typescript
// frontend/src/components/teachers/list/filters/FilterSheet.tsx
import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { X, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { DataTableFacetedFilter } from "../DataTableFacetedFilter";
import { DateRangeFilter, type DateRangeValue } from "./DateRangeFilter";
import { NumberRangeFilter, type NumberRangeValue } from "./NumberRangeFilter";
import {
  ALL_COLUMNS,
  GROUP_LABELS,
  COLUMN_MAP,
  type ColumnDef
} from "../columnConfig";

interface FilterSheetProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  stageMap?: Map<string, string>;
}

export function FilterSheet<TData>({
  open,
  onOpenChange,
  table,
  stageMap
}: FilterSheetProps<TData>) {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get visible and filterable columns
  const visibleFilterableColumns = React.useMemo(() => {
    return ALL_COLUMNS.filter(col => {
      if (!col.filterable) return false;
      const column = table.getColumn(col.id);
      return column?.getIsVisible() ?? false;
    });
  }, [table.getState().columnVisibility]);

  // Filter columns by search query
  const filteredColumns = React.useMemo(() => {
    if (!searchQuery) return visibleFilterableColumns;
    const query = searchQuery.toLowerCase();
    return visibleFilterableColumns.filter(col =>
      col.label.toLowerCase().includes(query)
    );
  }, [visibleFilterableColumns, searchQuery]);

  // Group filtered columns
  const groupedColumns = React.useMemo(() => {
    return GROUP_LABELS.map(group => ({
      ...group,
      columns: group.columnIds
        .map(id => filteredColumns.find(col => col.id === id))
        .filter((col): col is ColumnDef => col !== undefined)
    })).filter(group => group.columns.length > 0);
  }, [filteredColumns]);

  // Count active filters
  const activeFilterCount = table.getState().columnFilters.length;

  const handleResetAll = () => {
    table.resetColumnFilters();
  };

  const renderFilter = (colDef: ColumnDef) => {
    const column = table.getColumn(colDef.id);
    if (!column) return null;

    switch (colDef.filterType) {
      case 'select':
      case 'multi-select':
        return (
          <DataTableFacetedFilter
            key={colDef.id}
            column={column}
            title={colDef.label}
            options={colDef.filterOptions?.map(opt => ({ label: opt, value: opt }))}
            stageMap={colDef.id === 'pipelineStage' ? stageMap : undefined}
          />
        );

      case 'date-range':
        return (
          <DateRangeFilter
            key={colDef.id}
            title={colDef.label}
            value={column.getFilterValue() as DateRangeValue | undefined}
            onChange={(value) => column.setFilterValue(value)}
          />
        );

      case 'number-range':
        return (
          <NumberRangeFilter
            key={colDef.id}
            title={colDef.label}
            value={column.getFilterValue() as NumberRangeValue | undefined}
            onChange={(value) => column.setFilterValue(value)}
          />
        );

      case 'text':
        return (
          <Input
            key={colDef.id}
            placeholder={`Filter ${colDef.label}...`}
            value={(column.getFilterValue() as string) ?? ''}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            className="h-8 w-full"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="space-y-4 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              All Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount} active</Badge>
              )}
            </SheetTitle>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search filters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </SheetHeader>

        <div className="py-4">
          {groupedColumns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No filters available. Show more columns to see their filters.
            </p>
          ) : (
            <Accordion type="multiple" defaultValue={groupedColumns.map(g => g.id)}>
              {groupedColumns.map(group => (
                <AccordionItem key={group.id} value={group.id}>
                  <AccordionTrigger className="text-sm font-medium">
                    {group.label}
                    <Badge variant="outline" className="ml-2">
                      {group.columns.length}
                    </Badge>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {group.columns.map(col => (
                        <div key={col.id} className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            {col.label}
                          </span>
                          {renderFilter(col)}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {activeFilterCount > 0 && (
          <div className="sticky bottom-0 bg-background border-t pt-4 pb-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResetAll}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset All Filters
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test --prefix frontend -- --run FilterSheet.test.tsx`
Expected: PASS

**Step 5: Update barrel export and commit**

```typescript
// Update frontend/src/components/teachers/list/filters/index.ts
export { DateRangeFilter, type DateRangeValue } from './DateRangeFilter';
export { NumberRangeFilter, type NumberRangeValue } from './NumberRangeFilter';
export { FilterSheet } from './FilterSheet';
```

```bash
git add frontend/src/components/teachers/list/filters/
git commit -m "feat(teachers): add FilterSheet with hierarchical visibility"
```

---

## Phase 4: Toolbar Refactor

### Task 4.1: Refactor DataTableToolbar with Unified Layout

**Files:**
- Modify: `frontend/src/components/teachers/list/DataTableToolbar.tsx`

**Step 1: Update imports and add new props**

The toolbar now receives viewMode and onViewModeChange props, and uses the FilterSheet.

**Step 2: Implement the refactored toolbar**

```typescript
// frontend/src/components/teachers/list/DataTableToolbar.tsx
import type { Table } from "@tanstack/react-table"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./DataTableViewOptions"
import { DataTableFacetedFilter } from "./DataTableFacetedFilter"
import { FilterSheet } from "./filters"
import { ViewModeToggle, type ViewMode } from "./ViewModeToggle"
import { Download, Trash2, X, SlidersHorizontal, Settings2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { COLUMN_MAP, ALL_COLUMNS } from "./columnConfig"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    onDeleteSelected?: (selectedIds: string[]) => void
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
}

// Quick filter column IDs - most commonly used
const QUICK_FILTER_IDS = ['gender', 'pipelineStage', 'hiringStatus'];

export function DataTableToolbar<TData>({
    table,
    onDeleteSelected,
    viewMode,
    onViewModeChange,
}: DataTableToolbarProps<TData>) {
    const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);

    const isFiltered = table.getState().columnFilters.length > 0;
    const selectedCount = Object.keys(table.getState().rowSelection).length;
    const globalFilter = (table.getColumn("englishName")?.getFilterValue() as string) ?? "";

    // Get stages from table meta
    const stages = (table.options.meta as any)?.stages as { _id: string; title: string }[] || [];
    const stageMap = React.useMemo(() => {
        const map = new Map<string, string>();
        stages.forEach(s => map.set(s._id, s.title));
        return map;
    }, [stages]);

    // Get visible quick filters
    const visibleQuickFilters = React.useMemo(() => {
        return QUICK_FILTER_IDS.filter(id => {
            const column = table.getColumn(id);
            return column?.getIsVisible() ?? false;
        }).map(id => {
            const colDef = ALL_COLUMNS.find(c => c.id === id);
            return { id, colDef };
        }).filter(item => item.colDef);
    }, [table.getState().columnVisibility]);

    const handleExport = () => {
        const rows = table.getFilteredRowModel().rows;
        const visibleColumns = table.getVisibleLeafColumns().filter(
            col => col.id !== 'select' && col.id !== 'actions' && col.id !== 'avatar'
        );

        const headers = visibleColumns.map(col => {
            const colDef = COLUMN_MAP.get(col.id);
            return colDef ? colDef.label : col.id;
        });

        const csvRows = rows.map(row => {
            return visibleColumns.map(col => {
                let value = row.getValue(col.id);
                if (col.id === 'pipelineStage') {
                    value = stageMap.get(String(value)) ?? value;
                } else if (value instanceof Date) {
                    value = value.toLocaleDateString();
                } else if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }
                const strValue = value === undefined || value === null ? '' : String(value);
                if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                    return `"${strValue.replace(/"/g, '""')}"`;
                }
                return strValue;
            }).join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `teachers_export_${today}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const activeFilterCount = table.getState().columnFilters.length + (globalFilter ? 1 : 0);

    return (
        <div className="space-y-3">
            {/* Main toolbar row */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <Input
                    placeholder="Search by name..."
                    value={globalFilter}
                    onChange={(event) =>
                        table.getColumn("englishName")?.setFilterValue(event.target.value)
                    }
                    className="h-9 w-[200px] lg:w-[280px]"
                />

                {/* Quick Filters */}
                <div className="hidden md:flex items-center gap-2">
                    {visibleQuickFilters.map(({ id, colDef }) => {
                        const column = table.getColumn(id);
                        if (!column || !colDef) return null;
                        return (
                            <DataTableFacetedFilter
                                key={id}
                                column={column}
                                title={colDef.label}
                                options={colDef.filterOptions?.map(opt => ({ label: opt, value: opt }))}
                                stageMap={id === 'pipelineStage' ? stageMap : undefined}
                            />
                        );
                    })}
                </div>

                {/* More Filters Button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => setFilterSheetOpen(true)}
                >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2 rounded-full px-1.5">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Right side controls */}
                <div className="flex items-center gap-2">
                    {/* Delete Button */}
                    {selectedCount > 0 && onDeleteSelected && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDeleteSelected(Object.keys(table.getState().rowSelection))}
                            className="h-9"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete ({selectedCount})
                        </Button>
                    )}

                    {/* View Mode Toggle */}
                    <ViewModeToggle value={viewMode} onChange={onViewModeChange} />

                    {/* Column Visibility (gear icon) */}
                    <DataTableViewOptions table={table} />

                    {/* Export */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={handleExport}
                        disabled={table.getFilteredRowModel().rows.length === 0}
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden lg:inline ml-2">Export</span>
                    </Button>
                </div>
            </div>

            {/* Active filters display */}
            {(isFiltered || globalFilter) && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Active:</span>
                    {globalFilter && (
                        <Badge variant="secondary" className="gap-1">
                            Name: {globalFilter}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => table.getColumn("englishName")?.setFilterValue("")}
                            />
                        </Badge>
                    )}
                    {table.getState().columnFilters.map(filter => {
                        const colDef = COLUMN_MAP.get(filter.id);
                        const label = colDef ? colDef.label : filter.id;
                        const values = filter.value;

                        let displayValue: string;
                        if (Array.isArray(values)) {
                            displayValue = filter.id === 'pipelineStage'
                                ? values.map(v => stageMap.get(v) || v).join(', ')
                                : values.join(', ');
                            if (displayValue.length > 20) {
                                displayValue = `${values.length} selected`;
                            }
                        } else if (typeof values === 'object' && values !== null) {
                            // Date or number range
                            if ('from' in values || 'to' in values) {
                                displayValue = 'Date range';
                            } else if ('min' in values || 'max' in values) {
                                displayValue = 'Number range';
                            } else {
                                displayValue = JSON.stringify(values);
                            }
                        } else {
                            displayValue = String(values);
                        }

                        return (
                            <Badge key={filter.id} variant="secondary" className="gap-1">
                                {label}: {displayValue}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)}
                                />
                            </Badge>
                        );
                    })}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                            table.resetColumnFilters();
                            table.getColumn("englishName")?.setFilterValue("");
                        }}
                    >
                        Clear all
                    </Button>
                </div>
            )}

            {/* Filter Sheet */}
            <FilterSheet
                open={filterSheetOpen}
                onOpenChange={setFilterSheetOpen}
                table={table}
                stageMap={stageMap}
            />
        </div>
    )
}
```

**Step 3: Commit**

```bash
git add frontend/src/components/teachers/list/DataTableToolbar.tsx
git commit -m "refactor(teachers): unified toolbar with quick filters and FilterSheet"
```

---

### Task 4.2: Update DataTableViewOptions to use gear icon

**Files:**
- Modify: `frontend/src/components/teachers/list/DataTableViewOptions.tsx`

**Step 1: Change icon from SlidersHorizontal to Settings2**

Update line 81-88:

```typescript
<Button
    variant="outline"
    size="sm"
    className="h-9 w-9 p-0"  // Square button
>
    <Settings2 className="h-4 w-4" />
    <span className="sr-only">Toggle columns</span>
</Button>
```

**Step 2: Commit**

```bash
git add frontend/src/components/teachers/list/DataTableViewOptions.tsx
git commit -m "refactor(teachers): change column visibility to gear icon"
```

---

## Phase 5: Page Integration

### Task 5.1: Update Teachers.tsx to remove floating wrapper

**Files:**
- Modify: `frontend/src/pages/Teachers.tsx`

**Step 1: Remove the floating view toggle wrapper and pass viewMode to DataTable**

Key changes:
1. Remove the white box wrapper around view toggle (lines 217-237)
2. Pass `viewMode` and `onViewModeChange` to DataTable
3. Update DataTable to pass these to toolbar

**Step 2: Update Teachers.tsx**

Remove lines 216-375 (the entire view toggle and filter section) and simplify to:

```typescript
// In Teachers.tsx, update the return section after the header

{viewMode === 'list' ? (
    <DataTable
        columns={columns}
        data={teachers}
        meta={{ stages }}
        onDeleteSelected={(ids) => {
            setSelectedIds(new Set(ids));
            setShowDeleteAlert(true);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
    />
) : (
    <>
        {/* Kanban toolbar - simplified */}
        <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                    placeholder="Search by name or school..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>
        <TeacherKanbanBoard
            teachers={kanbanFilteredTeachers}
            onRefresh={loadTeachers}
            selectedStages={selectedStages}
        />
    </>
)}
```

**Step 3: Update DataTable props interface**

```typescript
// In DataTable.tsx, add to interface
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    meta?: any
    onDeleteSelected?: (selectedIds: string[]) => void
    viewMode?: 'list' | 'kanban'
    onViewModeChange?: (mode: 'list' | 'kanban') => void
}
```

And pass to toolbar:

```typescript
<DataTableToolbar
    table={table}
    onDeleteSelected={onDeleteSelected}
    viewMode={viewMode ?? 'list'}
    onViewModeChange={onViewModeChange ?? (() => {})}
/>
```

**Step 4: Commit**

```bash
git add frontend/src/pages/Teachers.tsx frontend/src/components/teachers/list/DataTable.tsx
git commit -m "refactor(teachers): integrate unified toolbar, remove floating wrapper"
```

---

## Phase 6: Add filterFn to all columns

### Task 6.1: Update columns.tsx with filterFn for all filterable columns

**Files:**
- Modify: `frontend/src/components/teachers/list/columns.tsx`

**Step 1: Add custom filter functions for date-range and number-range**

Add at the top of columns.tsx:

```typescript
import type { FilterFn } from "@tanstack/react-table";
import type { DateRangeValue } from "./filters/DateRangeFilter";
import type { NumberRangeValue } from "./filters/NumberRangeFilter";

// Custom filter for date ranges
const dateRangeFilter: FilterFn<any> = (row, columnId, filterValue: DateRangeValue) => {
    if (!filterValue?.from && !filterValue?.to) return true;

    const cellValue = row.getValue(columnId) as string | undefined;
    if (!cellValue) return false;

    const cellDate = new Date(cellValue);
    if (isNaN(cellDate.getTime())) return false;

    if (filterValue.from) {
        const fromDate = new Date(filterValue.from);
        if (cellDate < fromDate) return false;
    }

    if (filterValue.to) {
        const toDate = new Date(filterValue.to);
        if (cellDate > toDate) return false;
    }

    return true;
};

// Custom filter for number ranges
const numberRangeFilter: FilterFn<any> = (row, columnId, filterValue: NumberRangeValue) => {
    if (filterValue?.min === undefined && filterValue?.max === undefined) return true;

    const cellValue = row.getValue(columnId) as number | undefined;
    if (cellValue === undefined || cellValue === null) return false;

    if (filterValue.min !== undefined && cellValue < filterValue.min) return false;
    if (filterValue.max !== undefined && cellValue > filterValue.max) return false;

    return true;
};

// Text contains filter
const textFilter: FilterFn<any> = (row, columnId, filterValue: string) => {
    if (!filterValue) return true;
    const cellValue = row.getValue(columnId) as string | undefined;
    if (!cellValue) return false;
    return cellValue.toLowerCase().includes(filterValue.toLowerCase());
};
```

**Step 2: Add filterFn to each column definition**

For each column, add the appropriate filterFn:
- Select/Multi-select: `filterFn: 'arrIncludesSome'`
- Date range: `filterFn: dateRangeFilter`
- Number range: `filterFn: numberRangeFilter`
- Text: `filterFn: textFilter`

**Step 3: Commit**

```bash
git add frontend/src/components/teachers/list/columns.tsx
git commit -m "feat(teachers): add filterFn to all columns for comprehensive filtering"
```

---

## Phase 7: Testing & Verification

### Task 7.1: Run all tests

**Step 1: Run test suite**

```bash
npm test --prefix frontend
```

Expected: All tests pass

**Step 2: Manual verification checklist**

- [ ] Teachers page loads without errors
- [ ] Unified toolbar displays correctly
- [ ] View toggle switches between List and Kanban
- [ ] Quick filters (Gender, Stage, Status) work
- [ ] "Filters" button opens FilterSheet
- [ ] FilterSheet shows only visible column filters
- [ ] Hiding a column removes its filter from FilterSheet
- [ ] Date range filters work
- [ ] Number range filters work
- [ ] Active filters display as badges
- [ ] Clear all removes all filters
- [ ] Export works with filters applied
- [ ] Column visibility gear icon works

### Task 7.2: Final commit

```bash
git add -A
git commit -m "feat(teachers): complete unified toolbar with hierarchical filters"
```

---

## Summary

| Phase | Tasks | Components |
|-------|-------|------------|
| 1 | Column config extension | columnConfig.ts |
| 2 | Filter components | ViewModeToggle, DateRangeFilter, NumberRangeFilter |
| 3 | FilterSheet | FilterSheet with grouped, visibility-aware filters |
| 4 | Toolbar refactor | Unified DataTableToolbar |
| 5 | Page integration | Teachers.tsx, DataTable.tsx |
| 6 | Column filters | columns.tsx with all filterFns |
| 7 | Testing | Verify all functionality |

**Estimated tasks:** 12 bite-sized commits
**Dependencies:** Shadcn Sheet, Calendar, Accordion components (already installed)
