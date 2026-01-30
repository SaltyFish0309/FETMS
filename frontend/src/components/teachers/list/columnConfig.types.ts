import type { Teacher } from '@/services/teacherService';

/**
 * Filter types for column filtering
 */
export type FilterType = 'select' | 'multi-select' | 'text' | 'date-range' | 'number-range';

/**
 * Column definition for the Teachers table
 */
export interface ColumnDef {
    id: string;
    labelKey: string;
    accessor: (teacher: Teacher) => string | number | undefined;
    frozen?: boolean; // Frozen columns are always visible and appear first
    filterable?: boolean; // Whether this column can be filtered
    filterType?: FilterType; // Type of filter to use
    filterOptions?: string[]; // Static options for select filters
}

/**
 * Group label containing multiple columns
 */
export interface GroupLabel {
    id: string;
    labelKey: string;
    columnIds: string[];
}
