import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRangeValue {
  from?: string;
  to?: string;
}

interface DateRangeFilterProps {
  title: string;
  value: DateRangeValue | undefined;
  onChange: (value: DateRangeValue | undefined) => void;
}

export function DateRangeFilter({ title, value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false);

  const fromDate = value?.from ? new Date(value.from) : undefined;
  const toDate = value?.to ? new Date(value.to) : undefined;

  const hasValue = value?.from || value?.to;

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      onChange(undefined);
      return;
    }
    onChange({
      from: range.from?.toISOString(),
      to: range.to?.toISOString(),
    });
  };

  const formatDisplayValue = () => {
    if (fromDate && toDate) {
      return `${format(fromDate, 'MMM d')} - ${format(toDate, 'MMM d, yyyy')}`;
    }
    if (fromDate) {
      return `From ${format(fromDate, 'MMM d, yyyy')}`;
    }
    if (toDate) {
      return `Until ${format(toDate, 'MMM d, yyyy')}`;
    }
    return title;
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 border-dashed justify-start text-left font-normal",
              hasValue && "border-solid border-primary"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="truncate max-w-[150px]">{formatDisplayValue()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: fromDate, to: toDate }}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {hasValue && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange(undefined)}
          aria-label="Clear date filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
