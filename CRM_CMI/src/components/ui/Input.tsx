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
                    <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mb-2 block ml-1">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-14 w-full rounded-2xl border border-input bg-secondary/50 px-5 text-base transition-all duration-500 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
                        error && "border-destructive focus:ring-destructive",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="text-xs text-destructive font-medium ml-1">{error}</p>}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
