import React from 'react';
import { Card, CardContent } from './ui/Card';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
    index?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass, index = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
    >
        <Card className="border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
            <CardContent className="p-6 flex items-center justify-between relative z-10">
                <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                    <p className={cn("text-3xl font-black mt-1 tracking-tighter", colorClass)}>{value}</p>
                </div>
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center bg-opacity-10 transition-transform group-hover:scale-110",
                    colorClass.replace('text-', 'bg-').replace('text-', 'text-')
                )}>
                    {icon}
                </div>
            </CardContent>
            {/* Subtle background glow */}
            <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-10 rounded-full",
                colorClass.replace('text-', 'bg-')
            )} />
        </Card>
    </motion.div>
);

export default StatCard;
