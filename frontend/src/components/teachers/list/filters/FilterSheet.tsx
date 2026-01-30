import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { DataTableFacetedFilter } from "../DataTableFacetedFilter";
import { DateRangeFilter, type DateRangeValue } from "./DateRangeFilter";
import { NumberRangeFilter, type NumberRangeValue } from "./NumberRangeFilter";
import {
  ALL_COLUMNS,
  GROUP_LABELS,
  type ColumnDef
} from "../columnConfig";
import { useTranslation } from 'react-i18next';

interface FilterSheetProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  stageMap?: Map<string, string>;
}

export function FilterSheet<TData>({
  open,
  onOpenChange,
  table,
  stageMap
}: FilterSheetProps<TData>) {
  const { t } = useTranslation('teachers');
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get column visibility state for the memo dependency
  const columnVisibilityState = table.getState().columnVisibility;

  // Get visible and filterable columns
  const visibleFilterableColumns = React.useMemo(() => {
    return ALL_COLUMNS.filter(col => {
      if (!col.filterable) return false;
      const column = table.getColumn(col.id);
      return column?.getIsVisible() ?? false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, columnVisibilityState]);

  // Filter columns by search query
  const filteredColumns = React.useMemo(() => {
    if (!searchQuery) return visibleFilterableColumns;
    const query = searchQuery.toLowerCase();
    return visibleFilterableColumns.filter(col =>
      t(col.labelKey).toLowerCase().includes(query)
    );
  }, [visibleFilterableColumns, searchQuery, t]);

  // Group filtered columns
  const groupedColumns = React.useMemo(() => {
    return GROUP_LABELS.map(group => ({
      ...group,
      columns: group.columnIds
        .map(id => filteredColumns.find(col => col.id === id))
        .filter((col): col is ColumnDef => col !== undefined)
    })).filter(group => group.columns.length > 0);
  }, [filteredColumns]);

  // Count active filters
  const activeFilterCount = table.getState().columnFilters.length;

  const renderFilter = (colDef: ColumnDef) => {
    const column = table.getColumn(colDef.id);
    if (!column) return null;

    switch (colDef.filterType) {
      case 'select':
      case 'multi-select':
        return (
          <DataTableFacetedFilter
            key={colDef.id}
            column={column}
            title={colDef.label}
            options={colDef.filterOptions?.map(opt => ({ label: opt, value: opt }))}
            stageMap={colDef.id === 'pipelineStage' ? stageMap : undefined}
          />
        );

      case 'date-range':
        return (
          <DateRangeFilter
            key={colDef.id}
            title={colDef.label}
            value={column.getFilterValue() as DateRangeValue | undefined}
            onChange={(value) => column.setFilterValue(value)}
          />
        );

      case 'number-range':
        return (
          <NumberRangeFilter
            key={colDef.id}
            title={colDef.label}
            value={column.getFilterValue() as NumberRangeValue | undefined}
            onChange={(value) => column.setFilterValue(value)}
          />
        );

      case 'text':
        return (
          <Input
            key={colDef.id}
            placeholder={`Filter ${colDef.label}...`}
            value={(column.getFilterValue() as string) ?? ''}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            className="h-8 w-full"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="space-y-4 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              {t('filterSheet.title')}
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{t('filterSheet.activeFilters', { count: activeFilterCount })}</Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              {t('filterSheet.description')}
            </SheetDescription>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('filterSheet.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </SheetHeader>

        <div className="py-4">
          {groupedColumns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('filterSheet.noFilters')}
            </p>
          ) : (
            <Accordion type="multiple" defaultValue={groupedColumns.map(g => g.id)}>
              {groupedColumns.map(group => (
                <AccordionItem key={group.id} value={group.id}>
                  <AccordionTrigger className="text-sm font-medium">
                    {t(group.labelKey)}
                    <Badge variant="outline" className="ml-2">
                      {group.columns.length}
                    </Badge>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {group.columns.map(col => (
                        <div key={col.id} className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">
                            {t(col.labelKey)}
                          </span>
                          {renderFilter(col)}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {activeFilterCount > 0 && (
          <div className="sticky bottom-0 bg-background border-t pt-4 pb-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => table.resetColumnFilters()}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('filterSheet.reset')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
