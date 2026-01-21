import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTableToolbar } from '../DataTableToolbar';

// Mock the DataTableViewOptions component
vi.mock('../DataTableViewOptions', () => ({
  DataTableViewOptions: () => <div data-testid="view-options">View Options</div>
}));

// Mock the FilterSheet component
vi.mock('../filters/FilterSheet', () => ({
  FilterSheet: () => <div data-testid="filter-sheet">Filter Sheet</div>
}));

describe('DataTableToolbar', () => {
  const createMockTable = (rowSelection = {}) => ({
    getColumn: (id: string) => ({
      id,
      getFilterValue: () => '',
      setFilterValue: vi.fn(),
      getIsVisible: () => false,
      getFacetedUniqueValues: () => new Map(),
    }),
    getState: () => ({
      columnFilters: [],
      rowSelection,
    }),
    resetColumnFilters: vi.fn(),
    getFilteredRowModel: () => ({ rows: [] }),
    getVisibleLeafColumns: () => [],
    options: {
      meta: {
        stages: [],
      },
    },
  });

  it('renders search input', () => {
    const table = createMockTable();
    render(<DataTableToolbar table={table as any} />);

    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
  });

  it('renders Filters button', () => {
    const table = createMockTable();
    render(<DataTableToolbar table={table as any} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('does not render inline quick filters', () => {
    const table = createMockTable();
    render(<DataTableToolbar table={table as any} />);

    // Quick filters for gender, pipelineStage, and hiringStatus should not be rendered inline
    // The only filter button should be the main "Filters" button
    const filterButtons = screen.queryAllByRole('button', { name: /filter/i });

    // Should only have the main "Filters" button, not individual quick filter buttons
    expect(filterButtons.length).toBeLessThanOrEqual(1);
  });

  it('renders custom action buttons when provided', () => {
    const table = createMockTable();
    const actionButtons = (
      <>
        <button>Import CSV</button>
        <button>Add Teacher</button>
      </>
    );

    render(<DataTableToolbar table={table as any} actionButtons={actionButtons} />);

    expect(screen.getByText('Import CSV')).toBeInTheDocument();
    expect(screen.getByText('Add Teacher')).toBeInTheDocument();
  });

  it('renders Export button', () => {
    const table = createMockTable();
    render(<DataTableToolbar table={table as any} />);

    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders View Options', () => {
    const table = createMockTable();
    render(<DataTableToolbar table={table as any} />);

    expect(screen.getByTestId('view-options')).toBeInTheDocument();
  });

  it('renders Delete button when rows are selected', () => {
    const table = createMockTable({ '1': true, '2': true });

    const onDeleteSelected = vi.fn();
    render(<DataTableToolbar table={table as any} onDeleteSelected={onDeleteSelected} />);

    expect(screen.getByText(/Delete \(2\)/)).toBeInTheDocument();
  });

  it('does not render Delete button when no rows are selected', () => {
    const table = createMockTable();
    const onDeleteSelected = vi.fn();
    render(<DataTableToolbar table={table as any} onDeleteSelected={onDeleteSelected} />);

    expect(screen.queryByText(/Delete/)).not.toBeInTheDocument();
  });
});
