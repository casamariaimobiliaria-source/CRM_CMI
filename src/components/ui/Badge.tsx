import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "bg-primary/5 text-primary border-primary/20",
        secondary: "bg-platinum-200/5 text-muted-foreground border-platinum-200/20",
        destructive: "bg-destructive/10 text-destructive border-destructive/20",
        outline: "text-foreground bg-transparent border-border hover:border-primary/30",
        success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
