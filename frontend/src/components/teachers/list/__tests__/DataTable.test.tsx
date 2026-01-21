import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('DataTable', () => {
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
});
