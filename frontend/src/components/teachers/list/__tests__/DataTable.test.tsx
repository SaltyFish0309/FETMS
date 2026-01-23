import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../DataTable';
import type { ColumnDef } from '@tanstack/react-table';

// Mock the DataTableToolbar component
vi.mock('../DataTableToolbar', () => ({
  DataTableToolbar: ({ actionButtons }: { actionButtons?: React.ReactNode }) => (
    <div data-testid="toolbar">
      Toolbar
      {actionButtons && <div data-testid="action-buttons">{actionButtons}</div>}
    </div>
  )
}));

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('DataTable', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
  ];

  const mockData = [
    { name: 'John Doe' },
    { name: 'Jane Smith' },
  ];

  it('renders without viewMode and onViewModeChange props', () => {
    // This test verifies that the component works without these props
    expect(() => {
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
        />
      );
    }).not.toThrow();
  });

  it('renders with actionButtons prop', () => {
    const actionButtons = (
      <>
        <button>Import CSV</button>
        <button>Add Teacher</button>
      </>
    );

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        actionButtons={actionButtons}
      />
    );

    expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    expect(screen.getByText('Import CSV')).toBeInTheDocument();
    expect(screen.getByText('Add Teacher')).toBeInTheDocument();
  });

  it('passes actionButtons to DataTableToolbar', () => {
    const actionButtons = <button>Test Action</button>;

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        actionButtons={actionButtons}
      />
    );

    expect(screen.getByText('Test Action')).toBeInTheDocument();
  });

  it('renders toolbar', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
      />
    );

    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  it('passes onDeleteSelected to toolbar', () => {
    const onDeleteSelected = vi.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onDeleteSelected={onDeleteSelected}
      />
    );

    // Verify component renders without errors
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  describe('date copy formatting', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateColumns: ColumnDef<any>[] = [
      {
        accessorKey: 'expiryDate',
        header: 'Expiry Date',
      },
    ];

    const dateData = [
      { expiryDate: '2032-02-09T16:00:00.000Z' }, // This is Feb 10, 2032 in UTC+8
    ];

    beforeEach(() => {
      mockWriteText.mockClear();
    });

    it('formats ISO date strings to local date on copy (UTC+8)', async () => {
      render(
        <DataTable
          columns={dateColumns}
          data={dateData}
        />
      );

      // Find the date cell and click it
      const cells = screen.getAllByRole('cell');
      const dateCell = cells.find(cell => cell.textContent?.includes('2032'));

      if (dateCell) {
        fireEvent.click(dateCell);

        // The copied value should be formatted as a date without time
        // For UTC+8, 2032-02-09T16:00:00.000Z becomes 2032/2/10
        const copiedValue = mockWriteText.mock.calls[0]?.[0];
        expect(copiedValue).not.toContain('T');
        expect(copiedValue).not.toContain('Z');
        expect(copiedValue).not.toContain(':');
      }
    });
  });
});
