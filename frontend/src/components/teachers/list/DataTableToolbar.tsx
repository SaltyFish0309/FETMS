import type { Table } from "@tanstack/react-table"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./DataTableViewOptions"
import { DataTableFacetedFilter } from "./DataTableFacetedFilter"
import { Trash2, X, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { COLUMN_MAP } from "./columnConfig"
import { FilterSheet } from "./filters/FilterSheet"
import { ExportButton } from "@/components/common/ExportButton"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    onDeleteSelected?: (selectedIds: string[]) => void
    actionButtons?: React.ReactNode
}

// Quick filter IDs that appear inline
const QUICK_FILTER_IDS: string[] = [];

export function DataTableToolbar<TData>({
    table,
    onDeleteSelected,
    actionButtons,
}: DataTableToolbarProps<TData>) {
    const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);

    const isFiltered = table.getState().columnFilters.length > 0
    const selectedCount = Object.keys(table.getState().rowSelection).length
    const globalFilter = (table.getColumn("englishName")?.getFilterValue() as string) ?? ""

    // Get stages from table meta for Stage filter display
    const stages = React.useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (table.options.meta as any)?.stages as { _id: string; title: string }[] || [];
    }, [table.options.meta]);

    const stageMap = React.useMemo(() => {
        const map = new Map<string, string>();
        stages.forEach(s => map.set(s._id, s.title));
        return map;
    }, [stages]);

    // Calculate visible quick filters based on column visibility
    const visibleQuickFilters = React.useMemo(() => {
        return QUICK_FILTER_IDS.filter(filterId => {
            const column = table.getColumn(filterId);
            return column?.getIsVisible() ?? false;
        });
    }, [table]);

    const handleExportCSV = React.useCallback(() => {
        const rows = table.getFilteredRowModel().rows;
        const visibleColumns = table.getVisibleLeafColumns().filter(
            col => col.id !== 'select' && col.id !== 'actions' && col.id !== 'avatar'
        );

        // Headers - use COLUMN_MAP for human-readable labels
        const headers = visibleColumns.map(col => {
            const colDef = COLUMN_MAP.get(col.id);
            return colDef ? colDef.label : col.id;
        });

        // Data rows
        const csvRows = rows.map(row => {
            return visibleColumns.map(col => {
                let value = row.getValue(col.id);

                // Handle special cases
                if (col.id === 'pipelineStage') {
                    value = stageMap.get(String(value)) ?? value;
                } else if (value instanceof Date) {
                    value = value.toLocaleDateString();
                } else if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }

                // Escape CSV special characters
                const strValue = value === undefined || value === null ? '' : String(value);
                if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                    return `"${strValue.replace(/"/g, '""')}"`;
                }
                return strValue;
            }).join(',');
        });

        // Generate and download CSV
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `teachers_export_${today}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [table, stageMap]);

    const activeFilterCount = table.getState().columnFilters.length;

    // Helper to get filter label
    const getFilterLabel = (filterId: string): string => {
        const colDef = COLUMN_MAP.get(filterId);
        return colDef?.label ?? filterId;
    };

    // Helper to render quick filter
    const renderQuickFilter = (filterId: string) => {
        const column = table.getColumn(filterId);
        if (!column) return null;

        return (
            <DataTableFacetedFilter
                key={filterId}
                column={column}
                title={getFilterLabel(filterId)}
                stageMap={filterId === 'pipelineStage' ? stageMap : undefined}
            />
        );
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Main toolbar row */}
            <div className="flex items-center gap-2">
                {/* Search input */}
                <Input
                    placeholder="Search by name..."
                    value={globalFilter}
                    onChange={(event) =>
                        table.getColumn("englishName")?.setFilterValue(event.target.value)
                    }
                    className="h-9 w-[200px] lg:w-[300px]"
                />

                {/* Quick filters (inline) */}
                {visibleQuickFilters.map(filterId => renderQuickFilter(filterId))}

                {/* "Filters" button with active count badge */}
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => setFilterSheetOpen(true)}
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2 rounded-full px-1.5">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Delete button (if selection active) */}
                {selectedCount > 0 && onDeleteSelected && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteSelected(Object.keys(table.getState().rowSelection))}
                        className="h-9"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete ({selectedCount})
                    </Button>
                )}

                {/* Action buttons (Import CSV, Add Teacher) */}
                {actionButtons}

                {/* Column visibility options */}
                <DataTableViewOptions table={table} />

                {/* Export button with dropdown */}
                <ExportButton
                    onExportCSV={handleExportCSV}
                    label="Export"
                    isLoading={table.getFilteredRowModel().rows.length === 0}
                />
            </div>

            {/* Active filters row (conditional) */}
            {(isFiltered || globalFilter) && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Active:</span>
                    {globalFilter && (
                        <Badge variant="secondary" className="gap-1">
                            Name: {globalFilter}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => table.getColumn("englishName")?.setFilterValue("")}
                            />
                        </Badge>
                    )}
                    {table.getState().columnFilters.map(filter => {
                        const label = getFilterLabel(filter.id);
                        const values = Array.isArray(filter.value) ? filter.value : [filter.value];
                        const displayValue = filter.id === 'pipelineStage'
                            ? values.map(v => stageMap.get(String(v)) || v).join(', ')
                            : values.join(', ');

                        return (
                            <Badge key={filter.id} variant="secondary" className="gap-1">
                                {label}: {displayValue.length > 20 ? `${values.length} selected` : displayValue}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)}
                                />
                            </Badge>
                        );
                    })}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                            table.resetColumnFilters();
                            table.getColumn("englishName")?.setFilterValue("");
                        }}
                    >
                        Clear all
                    </Button>
                </div>
            )}

            {/* FilterSheet component */}
            <FilterSheet
                open={filterSheetOpen}
                onOpenChange={setFilterSheetOpen}
                table={table}
                stageMap={stageMap}
            />
        </div>
    )
}
