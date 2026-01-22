import { describe, it, expect } from 'vitest';
import {
    ALL_COLUMNS,
    getFilterableColumns,
    getVisibleFilterableColumns,
    GROUP_LABELS,
    getGroupColumnIds,
    getDefaultVisibleColumnIds,
    getFrozenColumnIds,
} from '../columnConfig';

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

        it('getFilterableColumns should return columns with valid filter types', () => {
            const filterableColumns = getFilterableColumns();
            expect(filterableColumns.length).toBeGreaterThan(0);
            filterableColumns.forEach(col => {
                expect(col.filterType).toBeDefined();
            });
        });

        it('getVisibleFilterableColumns should return only filterable columns that are visible', () => {
            const visibleIds = new Set(['hiringStatus', 'gender', 'email', 'salary']);
            const result = getVisibleFilterableColumns(visibleIds);

            result.forEach(col => {
                expect(col.filterable).toBe(true);
                expect(visibleIds.has(col.id)).toBe(true);
            });
        });

        it('getVisibleFilterableColumns should return empty array when no visible columns are filterable', () => {
            const visibleIds = new Set(['nonExistentColumn']);
            const result = getVisibleFilterableColumns(visibleIds);
            expect(result).toHaveLength(0);
        });
    });

    describe('frozen columns', () => {
        it('should have englishName and serviceSchool as frozen columns', () => {
            const frozenIds = getFrozenColumnIds();
            expect(frozenIds).toContain('englishName');
            expect(frozenIds).toContain('serviceSchool');
        });

        it('getFrozenColumnIds should return array of frozen column IDs', () => {
            const frozenIds = getFrozenColumnIds();
            expect(Array.isArray(frozenIds)).toBe(true);
            frozenIds.forEach(id => {
                const col = ALL_COLUMNS.find(c => c.id === id);
                expect(col?.frozen).toBe(true);
            });
        });
    });

    describe('GROUP_LABELS', () => {
        it('should have exactly 4 group labels', () => {
            expect(GROUP_LABELS).toHaveLength(4);
        });

        it('should have the correct group IDs', () => {
            const groupIds = GROUP_LABELS.map(g => g.id);
            expect(groupIds).toContain('personalInfo');
            expect(groupIds).toContain('education');
            expect(groupIds).toContain('legalDocs');
            expect(groupIds).toContain('employment');
        });

        it('should have non-empty columnIds for each group', () => {
            GROUP_LABELS.forEach(group => {
                expect(group.columnIds.length).toBeGreaterThan(0);
            });
        });
    });

    describe('getGroupColumnIds', () => {
        it('should return column IDs for personalInfo group', () => {
            const columnIds = getGroupColumnIds('personalInfo');
            expect(columnIds).toContain('hiringStatus');
            expect(columnIds).toContain('chineseName');
            expect(columnIds).toContain('email');
        });

        it('should return column IDs for education group', () => {
            const columnIds = getGroupColumnIds('education');
            expect(columnIds).toContain('degree');
            expect(columnIds).toContain('major');
            expect(columnIds).toContain('school');
        });

        it('should return empty array for non-existent group', () => {
            const columnIds = getGroupColumnIds('nonExistent');
            expect(columnIds).toEqual([]);
        });
    });

    describe('getDefaultVisibleColumnIds', () => {
        it('should return a Set', () => {
            const result = getDefaultVisibleColumnIds();
            expect(result).toBeInstanceOf(Set);
        });

        it('should include all column IDs', () => {
            const result = getDefaultVisibleColumnIds();
            ALL_COLUMNS.forEach(col => {
                expect(result.has(col.id)).toBe(true);
            });
        });
    });
});
