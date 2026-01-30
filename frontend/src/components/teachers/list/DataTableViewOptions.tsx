import { Settings2, Square, CheckSquare, RotateCcw } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { useTranslation } from 'react-i18next';

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GROUP_LABELS, COLUMN_MAP } from "./columnConfig"

// Default visible columns (same as DataTable.tsx)
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

interface DataTableViewOptionsProps<TData> {
    table: Table<TData>
}

export function DataTableViewOptions<TData>({
    table,
}: DataTableViewOptionsProps<TData>) {
    const { t } = useTranslation('teachers');

    // Helper to get column by ID
    const getCol = (id: string) => table.getColumn(id);

    // Get human-readable label for a column
    const getColumnLabel = (colId: string): string => {
        const colDef = COLUMN_MAP.get(colId);
        if (colDef) return colDef.label;
        return colId;
    };

    // Get hideable column IDs for a group (excludes frozen columns)
    const getHideableColumnIds = (groupId: string): string[] => {
        const group = GROUP_LABELS.find(g => g.id === groupId);
        if (!group) return [];
        return group.columnIds.filter(colId => {
            const col = getCol(colId);
            return col?.getCanHide();
        });
    };

    // Check if all hideable columns in a group are visible
    const isGroupFullyVisible = (groupId: string): boolean => {
        const hideableIds = getHideableColumnIds(groupId);
        if (hideableIds.length === 0) return true;
        return hideableIds.every(colId => {
            const col = getCol(colId);
            return col?.getIsVisible();
        });
    };

    // Check if some hideable columns in a group are visible (partial)
    const isGroupPartiallyVisible = (groupId: string): boolean => {
        const hideableIds = getHideableColumnIds(groupId);
        if (hideableIds.length === 0) return false;
        const visibleCount = hideableIds.filter(colId => {
            const col = getCol(colId);
            return col?.getIsVisible();
        }).length;
        return visibleCount > 0 && visibleCount < hideableIds.length;
    };

    // Toggle all hideable columns in a group
    const toggleGroup = (groupId: string, visible: boolean) => {
        const hideableIds = getHideableColumnIds(groupId);
        hideableIds.forEach(colId => {
            const col = getCol(colId);
            if (col) col.toggleVisibility(visible);
        });
    };

    // Select all toggleable columns
    const selectAll = () => {
        table.getAllColumns().forEach(col => {
            if (col.getCanHide()) col.toggleVisibility(true);
        });
    };

    // Deselect all toggleable columns
    const deselectAll = () => {
        table.getAllColumns().forEach(col => {
            if (col.getCanHide()) col.toggleVisibility(false);
        });
    };

    // Reset to default visibility
    const resetToDefault = () => {
        table.getAllColumns().forEach(col => {
            if (col.getCanHide()) {
                col.toggleVisibility(DEFAULT_VISIBLE_COLUMNS.includes(col.id));
            }
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                >
                    <Settings2 className="mr-2 h-4 w-4" />
                    {t('columnVisibility.trigger')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px] max-h-[80vh] overflow-y-auto">
                <DropdownMenuLabel>{t('columnVisibility.title')}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Select All / Deselect All / Default buttons */}
                <div className="flex gap-1 px-2 py-1">
                    <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={selectAll}>
                        <CheckSquare className="mr-1 h-3 w-3" /> {t('columnVisibility.showAll')}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={deselectAll}>
                        <Square className="mr-1 h-3 w-3" /> {t('columnVisibility.hideAll')}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={resetToDefault}>
                        <RotateCcw className="mr-1 h-3 w-3" /> {t('columnVisibility.default')}
                    </Button>
                </div>
                <DropdownMenuSeparator />

                {/* Render Groups with clickable labels */}
                {GROUP_LABELS.map(group => {
                    const isFullyVisible = isGroupFullyVisible(group.id);
                    const isPartiallyVisible = isGroupPartiallyVisible(group.id);

                    return (
                        <div key={group.id} className="mb-1">
                            {/* Group header - clickable to toggle all */}
                            <div
                                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                                onClick={() => toggleGroup(group.id, !isFullyVisible)}
                            >
                                <div className="flex h-4 w-4 items-center justify-center">
                                    {isFullyVisible ? (
                                        <CheckSquare className="h-4 w-4 text-primary" />
                                    ) : isPartiallyVisible ? (
                                        <div className="h-4 w-4 border-2 border-primary rounded-sm bg-primary/30" />
                                    ) : (
                                        <Square className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                                <span className="text-sm font-medium">{t(group.labelKey)}</span>
                            </div>

                            {/* Individual columns (only hideable ones) */}
                            {group.columnIds.map(colId => {
                                const column = getCol(colId);
                                // Skip columns that don't exist or can't be hidden (frozen)
                                if (!column || !column.getCanHide()) return null;
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={colId}
                                        className="pl-8"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {getColumnLabel(colId)}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                            <DropdownMenuSeparator className="my-1" />
                        </div>
                    );
                })}

                {/* Render Ungrouped columns (like pipelineStage if not in a group) */}
                {table
                    .getAllColumns()
                    .filter(
                        (column) =>
                            typeof column.accessorFn !== "undefined" &&
                            column.getCanHide() &&
                            !GROUP_LABELS.some(g => g.columnIds.includes(column.id))
                    )
                    .map((column) => (
                        <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                            {getColumnLabel(column.id)}
                        </DropdownMenuCheckboxItem>
                    ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
