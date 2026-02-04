import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ThemeToggleProps {
    className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative w-14 h-8 rounded-full border border-border/50 transition-all duration-300 hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40 overflow-hidden",
                theme === 'dark' ? 'bg-black' : 'bg-platinum-100',
                className
            )}
            aria-label="Toggle theme"
        >
            {/* Sliding Background */}
            <motion.div
                className={cn(
                    "absolute inset-0 rounded-full",
                    theme === 'dark' ? 'bg-premium-surface' : 'bg-platinum-50'
                )}
                initial={false}
                animate={{
                    x: theme === 'dark' ? '0%' : '0%',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {/* Sliding Circle */}
            <motion.div
                className={cn(
                    "absolute top-1 w-6 h-6 rounded-full shadow-premium flex items-center justify-center",
                    theme === 'dark' ? 'gold-gradient' : 'bg-white border border-border'
                )}
                initial={false}
                animate={{
                    x: theme === 'dark' ? '28px' : '4px',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                        <motion.div
                            key="moon"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Moon className="w-3.5 h-3.5 text-black" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Sun className="w-3.5 h-3.5 text-primary" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Icons on Track */}
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                <Sun className={cn(
                    "w-3 h-3 transition-opacity duration-300",
                    theme === 'light' ? 'opacity-0' : 'opacity-40 text-muted-foreground'
                )} />
                <Moon className={cn(
                    "w-3 h-3 transition-opacity duration-300",
                    theme === 'dark' ? 'opacity-0' : 'opacity-40 text-muted-foreground'
                )} />
            </div>
        </button>
    );
};
