import * as React from "react"
import { cn } from "../lib/utils"

export interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
    ({ className, label, error, onChange, ...props }, ref) => {

        const formatPhoneNumber = (value: string) => {
            if (!value) return value;
            const phoneNumber = value.replace(/\D/g, '');
            const phoneNumberLength = phoneNumber.length;

            if (phoneNumberLength < 3) return phoneNumber;
            if (phoneNumberLength < 7) {
                return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
            }
            if (phoneNumberLength < 11) {
                return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
            }
            return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const formattedValue = formatPhoneNumber(e.target.value);
            e.target.value = formattedValue;
            if (onChange) {
                onChange(e);
            }
        };

        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mb-2 block ml-1">
                        {label}
                    </label>
                )}
                <input
                    {...props}
                    ref={ref}
                    onChange={handleChange}
                    className={cn(
                        "flex h-14 w-full rounded-2xl border border-input bg-secondary/50 px-5 text-base transition-all duration-500 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
                        error && "border-destructive focus:ring-destructive",
                        className
                    )}
                />
                {error && <p className="text-xs text-destructive font-medium ml-1">{error}</p>}
            </div>
        )
    }
)
MaskedInput.displayName = "MaskedInput"

export { MaskedInput }
