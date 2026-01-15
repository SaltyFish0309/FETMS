import * as React from "react";
import { DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface NumberRangeValue {
  min?: number;
  max?: number;
}

interface NumberRangeFilterProps {
  title: string;
  value: NumberRangeValue | undefined;
  onChange: (value: NumberRangeValue | undefined) => void;
  prefix?: string;
}

export function NumberRangeFilter({
  title,
  value,
  onChange,
  prefix = "$"
}: NumberRangeFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [localMin, setLocalMin] = React.useState(value?.min?.toString() ?? '');
  const [localMax, setLocalMax] = React.useState(value?.max?.toString() ?? '');

  const hasValue = value?.min !== undefined || value?.max !== undefined;

  React.useEffect(() => {
    setLocalMin(value?.min?.toString() ?? '');
    setLocalMax(value?.max?.toString() ?? '');
  }, [value]);

  const handleApply = () => {
    const min = localMin ? parseInt(localMin, 10) : undefined;
    const max = localMax ? parseInt(localMax, 10) : undefined;

    if (min === undefined && max === undefined) {
      onChange(undefined);
    } else {
      onChange({ min, max });
    }
    setOpen(false);
  };

  const handleClear = () => {
    setLocalMin('');
    setLocalMax('');
    onChange(undefined);
  };

  const formatDisplayValue = () => {
    if (value?.min !== undefined && value?.max !== undefined) {
      return `${prefix}${value.min.toLocaleString()} - ${prefix}${value.max.toLocaleString()}`;
    }
    if (value?.min !== undefined) {
      return `≥ ${prefix}${value.min.toLocaleString()}`;
    }
    if (value?.max !== undefined) {
      return `≤ ${prefix}${value.max.toLocaleString()}`;
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
            aria-label={title}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            <span className="truncate max-w-[120px]">{formatDisplayValue()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min">Minimum</Label>
              <Input
                id="min"
                type="number"
                placeholder="Min"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Maximum</Label>
              <Input
                id="max"
                type="number"
                placeholder="Max"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleClear}>
                Clear
              </Button>
              <Button size="sm" className="flex-1" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {hasValue && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleClear}
          aria-label="Clear number filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
