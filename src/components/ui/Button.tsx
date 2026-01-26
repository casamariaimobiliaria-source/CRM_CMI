import * as React from "react"
import { cn } from "../../lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'link' | 'luxury' | 'platinum';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
    premium?: boolean; // Premium glow option
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'default', isLoading, premium = false, children, ...props }, ref) => {

        // Premium Variants - Elegant, Refined, Sophisticated
        const variants = {
            primary: "gold-gradient text-primary-foreground hover:opacity-90 shadow-gold-glow border border-white/10 transition-all duration-300",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-premium transition-all duration-300",
            luxury: "luxury-gradient text-white border border-primary/30 hover:border-primary/60 shadow-premium hover:shadow-gold-glow-lg transition-all duration-300",
            platinum: "platinum-gradient text-black hover:opacity-90 shadow-platinum-glow border border-black/5 transition-all duration-300",
            ghost: "hover:bg-accent/10 hover:text-accent-foreground border border-transparent hover:border-border/50 transition-all duration-300",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive/20 shadow-premium transition-all duration-300",
            outline: "border border-border bg-transparent hover:bg-secondary/50 hover:border-primary/30 hover:text-foreground shadow-premium transition-all duration-300",
            link: "text-primary underline-offset-4 hover:underline border-0 hover:text-primary/80 transition-colors duration-200",
        };

        const sizes = {
            default: "h-11 px-6 py-2.5",
            sm: "h-9 px-4 text-sm",
            lg: "h-14 px-8 text-base",
            icon: "h-11 w-11 p-0 flex items-center justify-center",
        };

        const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]";

        const premiumGlow = premium ? "shadow-gold-glow" : "";

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], premiumGlow, className)}
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
