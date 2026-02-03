import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-semibold text-foreground tracking-tight">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-11 w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary/30",
                        error && "border-destructive/50 focus-visible:ring-destructive/20 focus-visible:border-destructive",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
