import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTableToolbar } from '../DataTableToolbar';

// Mock sub-components that are not relevant to the email button test
vi.mock('../DataTableViewOptions', () => ({
    DataTableViewOptions: () => null,
}));
vi.mock('../filters/FilterSheet', () => ({
    FilterSheet: () => null,
}));
vi.mock('@/components/common/ExportButton', () => ({
    ExportButton: () => null,
}));

interface SampleTeacher {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

const sampleTeachers: SampleTeacher[] = [
    { _id: 'tid1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
    { _id: 'tid2', firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' },
];

const makeMockTable = (selectedCount: number, selectedData: SampleTeacher[]) => ({
    getState: () => ({
        rowSelection: Object.fromEntries(selectedData.map((_, i) => [String(i), true])),
        columnFilters: [],
    }),
    getColumn: () => undefined,
    options: { meta: { stages: [] } },
    getSelectedRowModel: () => ({
        rows: selectedData.map((original) => ({ original })),
    }),
    getFilteredRowModel: () => ({ rows: [] }),
    getFilteredSelectedRowModel: () => ({ rows: new Array(selectedCount) }),
    getVisibleLeafColumns: () => [],
    getLeftLeafColumns: () => [],
    resetColumnFilters: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

describe('DataTableToolbar email integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not show email button when no rows selected', () => {
        const mockTable = makeMockTable(0, []);
        const onEmailSelected = vi.fn();

        render(
            <DataTableToolbar
                table={mockTable}
                onEmailSelected={onEmailSelected}
            />
        );

        expect(screen.queryByRole('button', { name: /email selected/i })).not.toBeInTheDocument();
    });

    it('shows email button with correct count when 2 rows selected', () => {
        const mockTable = makeMockTable(2, sampleTeachers);
        const onEmailSelected = vi.fn();

        render(
            <DataTableToolbar
                table={mockTable}
                onEmailSelected={onEmailSelected}
            />
        );

        expect(screen.getByRole('button', { name: /email selected.*2/i })).toBeInTheDocument();
    });

    it('calls onEmailSelected with selected row data when clicked', async () => {
        const user = userEvent.setup();
        const mockTable = makeMockTable(2, sampleTeachers);
        const onEmailSelected = vi.fn();

        render(
            <DataTableToolbar
                table={mockTable}
                onEmailSelected={onEmailSelected}
            />
        );

        await user.click(screen.getByRole('button', { name: /email selected.*2/i }));

        expect(onEmailSelected).toHaveBeenCalledWith(sampleTeachers);
    });
});
