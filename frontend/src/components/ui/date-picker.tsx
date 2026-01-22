"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, parse, isValid } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    label?: string
    disabled?: boolean
    className?: string
    startYear?: number
    endYear?: number
    placeholder?: string
}

export function DatePicker({
    value,
    onChange,
    label,
    disabled,
    className,
    startYear = 1900,
    endYear = new Date().getFullYear() + 100,
    placeholder = "YYYY/MM/DD",
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    React.useEffect(() => {
        if (value) {
            setInputValue(format(value, "yyyy/MM/dd"))
        } else {
            setInputValue("")
        }
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)

        if (newValue.trim() === "") {
            onChange?.(undefined)
            return
        }

        const parsedDate = parse(newValue, "yyyy/MM/dd", new Date())
        if (isValid(parsedDate)) {
            onChange?.(parsedDate)
        }
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && <span className="text-sm font-medium">{label}</span>}
            <div className="relative">
                <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pl-10"
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            disabled={disabled}
                        >
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={value}
                            onSelect={(date) => {
                                onChange?.(date)
                                setOpen(false)
                            }}
                            captionLayout="dropdown"
                            fromYear={startYear}
                            toYear={endYear}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
