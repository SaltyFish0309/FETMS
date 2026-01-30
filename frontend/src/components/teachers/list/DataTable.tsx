/* eslint-disable react-hooks/incompatible-library */
import * as React from "react"
import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    RowSelectionState,
    ColumnPinningState,
} from "@tanstack/react-table"
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { DataTableToolbar } from "./DataTableToolbar"
import { PINNED_COLUMN_IDS } from "./columns"

// Columns that should NOT be copyable (interactive elements)
const NON_COPYABLE_COLUMNS = ['select', 'actions', 'avatar'];

// Default visible columns (user's most-used columns)
// Frozen columns (select, actions, avatar, englishName, serviceSchool) are always visible
const DEFAULT_VISIBLE_COLUMNS = [
    'email',
    'passportExpiry',
    'teachingLicenseExpiry',
    'workPermitExpiry',
    'contractStart',
    'contractEnd',
    'payStart',
    'payEnd',
    'salaryIncreaseDate',
    'arcExpiry',
    'pipelineStage',
];

// All column IDs that should be hidden by default
const ALL_HIDEABLE_COLUMNS = [
    'hiringStatus', 'chineseName', 'phone', 'dob', 'gender',
    'nationalityEn', 'nationalityCn', 'addressTaiwan', 'addressHome',
    'emergencyName', 'emergencyRelationship', 'emergencyPhone', 'emergencyEmail',
    'degree', 'major', 'school',
    'passportNumber', 'passportIssueDate', 'passportCountry', 'passportAuthority',
    'arcPurpose',
    'workPermitNumber', 'workPermitIssueDate', 'workPermitStartDate',
    'criminalRecordIssue',
    'salary', 'senioritySalary', 'seniorityLeave', 'hasSalaryIncrease', 'estimatedPromotedSalary',
];

// Compute initial visibility state
const getInitialColumnVisibility = (): VisibilityState => {
    const visibility: VisibilityState = {};
    ALL_HIDEABLE_COLUMNS.forEach(colId => {
        visibility[colId] = DEFAULT_VISIBLE_COLUMNS.includes(colId);
    });
    return visibility;
};

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    meta?: Record<string, unknown>
    onDeleteSelected?: (selectedIds: string[]) => void
    actionButtons?: React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    data,
    meta,
    onDeleteSelected,
    actionButtons,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(getInitialColumnVisibility)
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: PINNED_COLUMN_IDS,
        right: [],
    })

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            columnPinning,
        },
        enableRowSelection: true,
        enableColumnPinning: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnPinningChange: setColumnPinning,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        meta,
    })

    // Calculate cumulative left offset for pinned columns
    const getPinnedLeftOffset = (columnId: string): number => {
        const pinnedCols = table.getLeftLeafColumns();
        let offset = 0;
        for (const col of pinnedCols) {
            if (col.id === columnId) break;
            offset += col.getSize();
        }
        return offset;
    };

    return (
        <div className="space-y-4">
            <DataTableToolbar
                table={table}
                onDeleteSelected={onDeleteSelected}
                actionButtons={actionButtons}
            />
            <div className="rounded-md border bg-card overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    <Table className="relative" style={{ tableLayout: 'fixed' }}>
                        <TableHeader className="bg-muted/50 sticky top-0 z-30">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isPinned = header.column.getIsPinned();
                                        const leftOffset = isPinned === 'left' ? getPinnedLeftOffset(header.column.id) : undefined;

                                        return (
                                            <TableHead
                                                key={header.id}
                                                style={{
                                                    width: header.getSize(),
                                                    minWidth: header.getSize(),
                                                    maxWidth: isPinned ? header.getSize() : undefined,
                                                    position: isPinned ? 'sticky' : undefined,
                                                    left: leftOffset,
                                                    zIndex: isPinned ? 40 : 30,
                                                }}
                                                className={isPinned ? 'bg-muted/50' : ''}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:bg-muted/50"
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const isPinned = cell.column.getIsPinned();
                                            const leftOffset = isPinned === 'left' ? getPinnedLeftOffset(cell.column.id) : undefined;
                                            const isCopyable = !NON_COPYABLE_COLUMNS.includes(cell.column.id);

                                            const handleCopy = () => {
                                                if (!isCopyable) return;
                                                const value = cell.getValue();
                                                if (value == null || value === '') return;

                                                let textValue = String(value);

                                                // Check if value is an ISO date string and format it for UTC+8
                                                const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
                                                if (isoDateRegex.test(textValue)) {
                                                    const date = new Date(textValue);
                                                    // Format as YYYY/M/D in UTC+8 timezone
                                                    textValue = date.toLocaleDateString('zh-TW', {
                                                        year: 'numeric',
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        timeZone: 'Asia/Taipei'
                                                    });
                                                }

                                                navigator.clipboard.writeText(textValue);
                                                toast.success(`Copied: ${textValue.length > 50 ? textValue.slice(0, 50) + '...' : textValue}`);
                                            };

                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    onClick={handleCopy}
                                                    style={{
                                                        width: cell.column.getSize(),
                                                        minWidth: cell.column.getSize(),
                                                        maxWidth: isPinned ? cell.column.getSize() : undefined,
                                                        position: isPinned ? 'sticky' : undefined,
                                                        left: leftOffset,
                                                        zIndex: isPinned ? 20 : 10,
                                                    }}
                                                    className={`${isPinned ? 'bg-card' : ''} ${isCopyable ? 'cursor-pointer hover:bg-muted' : ''}`}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
            </div>
        </div>
    )
}
