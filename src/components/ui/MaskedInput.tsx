import * as React from "react"
import { cn } from "../../lib/utils"

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
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                        {label}
                    </label>
                )}
                <input
                    {...props}
                    ref={ref}
                    onChange={handleChange}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-destructive focus-visible:ring-destructive",
                        className
                    )}
                />
                {error && <p className="text-[10px] text-destructive font-medium ml-1">{error}</p>}
            </div>
        )
    }
)
MaskedInput.displayName = "MaskedInput"

export { MaskedInput }
