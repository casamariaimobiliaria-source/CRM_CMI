import * as React from "react"
import { cn } from "../../lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'link' | 'luxury';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
    premium?: boolean; // Kept for API compatibility, but will just add a glow
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'default', isLoading, premium = false, children, ...props }, ref) => {

        // Modern Variants - Cyber/Tech Look
        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 border-0 transition-all duration-200",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/5 transition-all duration-200",
            ghost: "hover:bg-primary/10 hover:text-primary transition-all duration-200",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/20 transition-all duration-200",
            outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground transition-all duration-200",
            link: "text-primary underline-offset-4 hover:underline",
            luxury: "bg-primary text-primary-foreground font-bold shadow-luxury hover:scale-105 transition-all duration-300",
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        };

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

        const premiumGlow = premium ? "shadow-neon" : "";

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.primary, sizes[size], premiumGlow, className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
