import { Settings2, Check, Square, CheckSquare } from "lucide-react"
import type { Table } from "@tanstack/react-table"

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

interface DataTableViewOptionsProps<TData> {
    table: Table<TData>
}

export function DataTableViewOptions<TData>({
    table,
}: DataTableViewOptionsProps<TData>) {

    // Helper to get column by ID
    const getCol = (id: string) => table.getColumn(id);

    // Get human-readable label for a column
    const getColumnLabel = (colId: string): string => {
        const colDef = COLUMN_MAP.get(colId);
        if (colDef) return colDef.label;
        return colId;
    };

    // Check if all columns in a group are visible
    const isGroupFullyVisible = (groupId: string): boolean => {
        const group = GROUP_LABELS.find(g => g.id === groupId);
        if (!group) return false;
        return group.columnIds.every(colId => {
            const col = getCol(colId);
            return col ? col.getIsVisible() : true; // If column doesn't exist, treat as visible
        });
    };

    // Check if some columns in a group are visible (partial)
    const isGroupPartiallyVisible = (groupId: string): boolean => {
        const group = GROUP_LABELS.find(g => g.id === groupId);
        if (!group) return false;
        const visibleCount = group.columnIds.filter(colId => {
            const col = getCol(colId);
            return col?.getIsVisible();
        }).length;
        return visibleCount > 0 && visibleCount < group.columnIds.length;
    };

    // Toggle all columns in a group
    const toggleGroup = (groupId: string, visible: boolean) => {
        const group = GROUP_LABELS.find(g => g.id === groupId);
        if (!group) return;
        group.columnIds.forEach(colId => {
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                >
                    <Settings2 className="h-4 w-4" />
                    <span className="sr-only">Toggle columns</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px] max-h-[80vh] overflow-y-auto">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Select All / Deselect All buttons */}
                <div className="flex gap-1 px-2 py-1">
                    <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={selectAll}>
                        <CheckSquare className="mr-1 h-3 w-3" /> All
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={deselectAll}>
                        <Square className="mr-1 h-3 w-3" /> None
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
                                <span className="text-sm font-medium">{group.label}</span>
                            </div>

                            {/* Individual columns */}
                            {group.columnIds.map(colId => {
                                const column = getCol(colId);
                                if (!column) return null;
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
