"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
}

export function DatePickerWithInput({ value, onChange, disabled, className, placeholder = "Select date" }: DatePickerProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
                    disabled={disabled}
                >
                    {value ? format(value, "PPP") : placeholder}
                    <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 10}
                    onSelect={(date) => {
                        onChange?.(date)
                        setOpen(false)
                    }}
                />
            </PopoverContent>
        </Popover>
    )
}
