"use client";

import { useState, forwardRef, useEffect } from "react";
import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js";
import { CircleFlag } from "react-circle-flags";
import { lookup, countries } from "country-data-list";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { ChevronDown, GlobeIcon, CheckIcon } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export const phoneSchema = z.string().refine((value) => {
    try {
        return isValidPhoneNumber(value);
    } catch {
        return false;
    }
}, "Invalid phone number");

export type CountryData = {
    alpha2: string;
    alpha3: string;
    countryCallingCodes: string[];
    currencies: string[];
    emoji?: string;
    ioc: string;
    languages: string[];
    name: string;
    status: string;
};

interface PhoneInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    onCountryChange?: (data: CountryData | undefined) => void;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    defaultCountry?: string;
    className?: string;
    inline?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
    (
        {
            className,
            onCountryChange,
            onChange,
            value,
            placeholder,
            defaultCountry,
            inline = false,
            ...props
        },
        ref
    ) => {
        const [countryData, setCountryData] = useState<CountryData | undefined>();
        const [hasInitialized, setHasInitialized] = useState(false);
        const [open, setOpen] = useState(false);

        // Get all countries for the dropdown
        // We use the same data source as the lookup function to ensure consistency
        // @ts-ignore
        const allCountries = countries.all.filter(
            (c: CountryData) => c.countryCallingCodes && c.countryCallingCodes.length > 0
        );

        useEffect(() => {
            if (defaultCountry && !hasInitialized) {
                const newCountryData = lookup.countries({
                    alpha2: defaultCountry.toLowerCase(),
                })[0];
                setCountryData(newCountryData);

                if (
                    newCountryData?.countryCallingCodes?.[0] &&
                    !value
                ) {
                    const syntheticEvent = {
                        target: {
                            value: newCountryData.countryCallingCodes[0],
                        },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange?.(syntheticEvent);
                    setHasInitialized(true);
                }
            }
        }, [defaultCountry, hasInitialized]);

        // Sync country data with value change
        useEffect(() => {
            if (value) {
                try {
                    const parsed = parsePhoneNumber(value);
                    if (parsed && parsed.country) {
                        const countryCode = parsed.country;
                        const countryInfo = lookup.countries({ alpha2: countryCode })[0];
                        if (countryInfo && countryInfo.alpha2 !== countryData?.alpha2) {
                            setCountryData(countryInfo);
                            onCountryChange?.(countryInfo);
                        }
                    }
                } catch (error) {
                    // Ignore parsing errors
                }
            }
        }, [value]);

        const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let newValue = e.target.value;

            // Ensure the value starts with "+"
            if (!newValue.startsWith("+")) {
                // Replace "00" at the start with "+" if present
                if (newValue.startsWith("00")) {
                    newValue = "+" + newValue.slice(2);
                } else {
                    // Otherwise just add "+" at the start
                    newValue = "+" + newValue;
                }
            }

            try {
                const parsed = parsePhoneNumber(newValue);

                if (parsed && parsed.country) {
                    const countryCode = parsed.country;
                    const countryInfo = lookup.countries({ alpha2: countryCode })[0];
                    setCountryData(countryInfo);
                    onCountryChange?.(countryInfo);

                    const syntheticEvent = {
                        ...e,
                        target: {
                            ...e.target,
                            value: parsed.number,
                        },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange?.(syntheticEvent);
                } else {
                    onChange?.(e);
                    setCountryData(undefined);
                    onCountryChange?.(undefined);
                }
            } catch (error) {
                onChange?.(e);
                setCountryData(undefined);
                onCountryChange?.(undefined);
            }
        };

        const handleCountrySelect = (country: CountryData) => {
            setCountryData(country);
            onCountryChange?.(country);
            setOpen(false);

            if (country.countryCallingCodes?.[0]) {
                const syntheticEvent = {
                    target: {
                        value: country.countryCallingCodes[0],
                    },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange?.(syntheticEvent);
            }
        };

        const inputClasses = cn(
            "flex items-center gap-2 relative bg-transparent transition-colors text-base rounded-md border border-input pl-3 h-9 shadow-sm md:text-sm has-[input:focus]:outline-none has-[input:focus]:ring-1 has-[input:focus]:ring-ring [interpolate-size:allow-keywords]",
            props.disabled && "cursor-not-allowed opacity-50 bg-slate-50 text-slate-500",
            inline && "rounded-l-none w-full",
            className
        );

        return (
            <div className={inputClasses}>
                {!inline && (
                    <div className="shrink-0">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    disabled={props.disabled}
                                    className="flex items-center gap-1 p-1 rounded-sm hover:bg-muted focus:outline-none disabled:cursor-not-allowed"
                                >
                                    <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                                        {countryData ? (
                                            <CircleFlag countryCode={countryData.alpha2.toLowerCase()} height={20} />
                                        ) : (
                                            <GlobeIcon size={16} />
                                        )}
                                    </div>
                                    <ChevronDown size={12} className="opacity-50" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[300px]" align="start">
                                <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                        <CommandEmpty>No country found.</CommandEmpty>
                                        <CommandGroup>
                                            {allCountries.map((country: CountryData) => (
                                                <CommandItem
                                                    key={country.alpha3}
                                                    onSelect={() => handleCountrySelect(country)}
                                                    className="gap-2"
                                                >
                                                    <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                                                        <CircleFlag countryCode={country.alpha2.toLowerCase()} height={20} />
                                                    </div>
                                                    <span className="flex-1 truncate">{country.name}</span>
                                                    <span className="text-muted-foreground text-xs">
                                                        {country.countryCallingCodes?.[0]}
                                                    </span>
                                                    {countryData?.alpha3 === country.alpha3 && (
                                                        <CheckIcon className="ml-auto h-4 w-4" />
                                                    )}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
                <input
                    ref={ref}
                    value={value}
                    onChange={handlePhoneChange}
                    placeholder={placeholder || "Enter number"}
                    type="tel"
                    autoComplete="tel"
                    name="phone"
                    className={cn(
                        "flex w-full border-none bg-transparent text-base transition-colors placeholder:text-muted-foreground outline-none h-9 py-1 p-0 leading-none md:text-sm [interpolate-size:allow-keywords]",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

PhoneInput.displayName = "PhoneInput";
