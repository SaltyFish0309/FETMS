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
        onOpenChange={() => { }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        table={table as any}
      />
    );

    // Check that group labels are rendered (from columnDefinitions.ts)
    expect(screen.getByText('個人基本資訊')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Employment')).toBeInTheDocument();
  });

  it('only shows filters for visible columns', () => {
    const table = createMockTable(['gender']); // Only gender visible

    render(
      <FilterSheet
        open={true}
        onOpenChange={() => { }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        table={table as any}
      />
    );

    // Gender label should appear (uses getAllByText since it appears in label and button)
    expect(screen.getAllByText('Gender').length).toBeGreaterThan(0);
    // Degree should not appear at all since that column is not visible
    expect(screen.queryByText('Degree')).not.toBeInTheDocument();
  });

  it('shows search input for filters', () => {
    const table = createMockTable(['gender', 'degree']);

    render(
      <FilterSheet
        open={true}
        onOpenChange={() => { }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        table={table as any}
      />
    );

    expect(screen.getByPlaceholderText(/search filters/i)).toBeInTheDocument();
  });
});
