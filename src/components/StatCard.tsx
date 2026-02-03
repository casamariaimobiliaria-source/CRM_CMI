import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
    index: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            className="group relative overflow-hidden rounded-[2.5rem] bg-card/30 p-8 transition-all duration-700 hover:bg-card/40 border border-border/50 hover:border-primary/20 glass-high-fidelity"
        >
            <div className="absolute inset-0 subtle-dot-grid opacity-20 pointer-events-none" />
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-1000 group-hover:bg-primary/10" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                        {label}
                    </p>
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5 border border-border/50 transition-all duration-700 group-hover:scale-110 group-hover:border-primary/20 group-hover:bg-primary/5",
                        colorClass
                    )}>
                        {icon}
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className={cn(
                        "text-3xl font-display font-bold tracking-tight italic break-words",
                        colorClass
                    )}>
                        {value}
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">
                            +0.0% <span className="text-muted-foreground/30 ml-1">vs mês passado</span>
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
