/**
 * Column Configuration for Teachers Table
 *
 * Re-exports types and column definitions from split modules,
 * and provides helper functions for column operations.
 */

// Re-export types
export type { FilterType, ColumnDef, GroupLabel } from './columnConfig.types';

// Re-export column definitions
export { ALL_COLUMNS, GROUP_LABELS } from './columnDefinitions';

import { ALL_COLUMNS, GROUP_LABELS } from './columnDefinitions';
import type { ColumnDef } from './columnConfig.types';

// Map for quick column lookup
export const COLUMN_MAP = new Map<string, ColumnDef>(
    ALL_COLUMNS.map(col => [col.id, col])
);

/**
 * Get frozen column IDs
 */
export function getFrozenColumnIds(): string[] {
    return ALL_COLUMNS.filter(col => col.frozen).map(col => col.id);
}

/**
 * Get all toggleable column IDs for a specific group
 */
export function getGroupColumnIds(groupId: string): string[] {
    const group = GROUP_LABELS.find(g => g.id === groupId);
    return group?.columnIds ?? [];
}

/**
 * Get default visible column IDs (all columns)
 */
export function getDefaultVisibleColumnIds(): Set<string> {
    return new Set(ALL_COLUMNS.map(col => col.id));
}

/**
 * Get all filterable columns
 */
export function getFilterableColumns(): ColumnDef[] {
    return ALL_COLUMNS.filter(col => col.filterable);
}

/**
 * Get filterable columns that are currently visible
 */
export function getVisibleFilterableColumns(visibleColumnIds: Set<string>): ColumnDef[] {
    return ALL_COLUMNS.filter(col => col.filterable && visibleColumnIds.has(col.id));
}
