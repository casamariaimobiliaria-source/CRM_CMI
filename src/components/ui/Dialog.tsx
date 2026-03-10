import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    const [isRendered, setIsRendered] = useState(open);

    useEffect(() => {
        if (open) setIsRendered(true);
    }, [open]);

    if (!isRendered) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-all duration-200 flex items-center justify-center p-4",
                open ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => onOpenChange(false)}
            onTransitionEnd={() => !open && setIsRendered(false)}
        >
            <div
                className={cn(
                    "relative z-50 grid w-full max-w-lg scale-100 gap-4 border border-white/10 bg-[#161926] p-6 shadow-lg duration-200 sm:rounded-2xl",
                    open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                )}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X className="h-4 w-4 text-white" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    );
};

export const DialogContent = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("grid gap-4", className)}>
        {children}
    </div>
);

export const DialogHeader = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left pt-2 pb-1", className)}>
        {children}
    </div>
);

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2
            ref={ref}
            className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)}
            {...props}
        />
    )
);
DialogTitle.displayName = "DialogTitle";
