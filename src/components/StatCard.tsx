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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            className="bg-card/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 group hover:border-primary/20 transition-all duration-700 shadow-premium hover:shadow-2xl relative overflow-hidden"
        >
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-primary/5 blur-[50px] pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />

            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">
                        {label}
                    </p>
                    <h3 className={cn(
                        "text-5xl font-display font-bold tracking-tight italic",
                        colorClass
                    )}>
                        {value}
                    </h3>
                </div>
                <div className={cn(
                    "w-10 h-10 rounded-full border border-white/5 flex items-center justify-center transition-all duration-700 group-hover:border-primary/40 group-hover:scale-110",
                    colorClass
                )}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
