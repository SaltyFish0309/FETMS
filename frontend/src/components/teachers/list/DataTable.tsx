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
import { DataTableToolbar } from "./DataTableToolbar"
import { PINNED_COLUMN_IDS } from "./columns"
import type { ViewMode } from "./ViewModeToggle"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    meta?: any
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
    onDeleteSelected?: (selectedIds: string[]) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    meta,
    viewMode,
    onViewModeChange,
    onDeleteSelected,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
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
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                onDeleteSelected={onDeleteSelected}
            />
            <div className="rounded-md border bg-white overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    <Table className="relative" style={{ tableLayout: 'fixed' }}>
                        <TableHeader className="bg-slate-50 sticky top-0 z-30">
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
                                                className={isPinned ? 'bg-slate-50' : ''}
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
                                        className="hover:bg-slate-50"
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const isPinned = cell.column.getIsPinned();
                                            const leftOffset = isPinned === 'left' ? getPinnedLeftOffset(cell.column.id) : undefined;

                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    style={{
                                                        width: cell.column.getSize(),
                                                        minWidth: cell.column.getSize(),
                                                        maxWidth: isPinned ? cell.column.getSize() : undefined,
                                                        position: isPinned ? 'sticky' : undefined,
                                                        left: leftOffset,
                                                        zIndex: isPinned ? 20 : 10,
                                                    }}
                                                    className={isPinned ? 'bg-white' : ''}
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
