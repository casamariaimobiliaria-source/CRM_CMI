import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, TrendingUp, AlertCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { Lead } from '../types';
import { getExecutiveInsights } from '../lib/openai';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

interface ExecutiveAIInsightProps {
    leads: Lead[];
}

export const ExecutiveAIInsight: React.FC<ExecutiveAIInsightProps> = ({ leads }) => {
    const [loading, setLoading] = useState(false);
    const [insight, setInsight] = useState<any>(null);

    const fetchInsight = async () => {
        if (leads.length === 0) return;
        setLoading(true);
        try {
            const data = await getExecutiveInsights(leads);
            setInsight(data);
        } catch (error) {
            console.error('Erro Insight:', error);
        } finally {
            setLoading(false);
        }
    };

    // Removido o useEffect para evitar chamadas automáticas

    if (leads.length === 0) return null;

    return (
        <Card className="relative overflow-hidden border-none bg-gradient-to-r from-blue-600/10 via-primary/5 to-purple-600/10 backdrop-blur-3xl shadow-premium">
            {/* Animated Background Decor */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <BrainCircuit className="w-32 h-32 animate-pulse" />
            </div>

            <CardContent className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-neon shrink-0">
                            <Zap className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-display font-bold italic text-xl tracking-tight">Executive Insight AI</h3>
                                <div className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
                                    Beta
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 text-muted-foreground/60 text-sm italic"
                                    >
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Processando performance operacional...
                                    </motion.div>
                                ) : insight ? (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        <p className="text-base text-foreground font-medium max-w-2xl leading-relaxed">
                                            "{insight.insight}"
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-xl border border-border/50">
                                                <AlertCircle className={cn("w-4 h-4", insight.prioridade === 'alta' ? "text-destructive" : "text-amber-500")} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Prioridade {insight.prioridade}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20">
                                                <TrendingUp className="w-4 h-4 text-primary" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Ação: {insight.acao_sugerida}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Clique para gerar uma análise estratégica da sua base.</p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <Button
                        onClick={fetchInsight}
                        disabled={loading}
                        className="h-12 px-8 rounded-2xl bg-foreground/10 border border-white/10 hover:bg-foreground/20 text-foreground text-[10px] font-bold tracking-[0.2em] uppercase shrink-0 transition-all backdrop-blur-md"
                    >
                        {loading ? 'ANALISANDO...' : (insight ? 'RECRIAR INSIGHT' : 'GERAR INSIGHT')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-card border border-border rounded-3xl", className)}>{children}</div>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("p-6", className)}>{children}</div>
);
