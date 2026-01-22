import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import type { Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>
    }

    // Click cycles: no sort → asc → desc → no sort
    const handleClick = () => {
        const currentSort = column.getIsSorted();
        if (currentSort === false) {
            column.toggleSorting(false); // set to asc
        } else if (currentSort === "asc") {
            column.toggleSorting(true); // set to desc
        } else {
            column.clearSorting(); // clear sort
        }
    };

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={handleClick}
            >
                <span>{title}</span>
                {column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                )}
            </Button>
        </div>
    )
}
