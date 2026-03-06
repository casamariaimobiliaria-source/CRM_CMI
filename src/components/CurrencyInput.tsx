import * as React from "react"
import { cn } from "../lib/utils"

export interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, label, error, onChange, value, defaultValue, ...props }, ref) => {

        const formatCurrency = (val: string | number | undefined | null) => {
            if (val === undefined || val === null || val === "") return "";

            let onlyNums = "";
            if (typeof val === 'number') {
                onlyNums = Math.round(val * 100).toString();
            } else {
                onlyNums = val.replace(/\D/g, "");
            }

            if (!onlyNums) return "";

            const numberValue = parseFloat(onlyNums) / 100;

            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numberValue);
        };

        const [displayValue, setDisplayValue] = React.useState(() => formatCurrency((value || defaultValue) as any));

        React.useEffect(() => {
            setDisplayValue(formatCurrency((value || defaultValue) as any));
        }, [value, defaultValue]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value;
            const formattedValue = formatCurrency(rawValue);

            setDisplayValue(formattedValue);

            // For react-hook-form to get the formatted value
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
                    type="text"
                    ref={ref}
                    value={displayValue}
                    onChange={handleChange}
                    className={cn(
                        "flex h-14 w-full rounded-2xl border border-input bg-secondary/50 px-5 text-base transition-all duration-500 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 text-foreground font-medium",
                        error && "border-destructive focus:ring-destructive",
                        className
                    )}
                />
                {error && <p className="text-[10px] text-destructive font-bold mt-1 ml-1 uppercase tracking-wider">{error}</p>}
            </div>
        )
    }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
