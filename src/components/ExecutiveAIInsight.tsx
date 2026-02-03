import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, TrendingUp, AlertCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { Lead } from '../types';
import { getAIAnalysis } from '../services/aiService';
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
            // Enviamos uma amostra ou resumo dos leads para não exceder limites
            const limitedLeads = leads.slice(0, 10).map(l => ({
                nome: l.nome,
                status: l.status,
                projeto: l.empreendimento
            }));

            const result = await getAIAnalysis({ leads: limitedLeads, total: leads.length });

            if (result.error) throw new Error(result.error);

            // Adapta o formato da Edge Function para o que o componente espera
            // { status, insights: string[], sugestao: string }
            setInsight({
                status: result.status,
                insights: result.insights,
                sugestao: result.suggestao
            });
        } catch (error: any) {
            console.error('Erro Insight Executivo:', error);
            const { toast } = await import('sonner');
            toast.error(error.message || 'Erro ao gerar insight executivo');
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

                            <div className="min-h-[60px]">
                                {loading ? (
                                    <div className="flex items-center gap-2 text-primary text-sm italic animate-pulse">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Processando performance operacional...
                                    </div>
                                ) : insight ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-500">
                                        {insight.insight ? (
                                            <p className="text-base text-foreground font-medium max-w-2xl leading-relaxed italic">
                                                "{insight.insight}"
                                            </p>
                                        ) : (
                                            <p className="text-xs text-destructive italic">Insight gerado sem texto formatado.</p>
                                        )}
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-xl border border-border/50 shadow-sm">
                                                <AlertCircle className={cn("w-4 h-4", insight.prioridade === 'alta' ? "text-destructive" : "text-amber-500")} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Prioridade {insight.prioridade || 'Normal'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                                <TrendingUp className="w-4 h-4 text-primary" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-bold">Ação Sugerida: {insight.acao_sugerida || 'Aguardando...'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic opacity-60">
                                        Analise o comportamento de {leads.length} leads em tempo real.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={fetchInsight}
                        disabled={loading}
                        className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground shadow-neon-cyan hover:scale-105 transition-all text-[10px] font-bold tracking-[0.2em] uppercase shrink-0"
                    >
                        {loading ? 'PROCESSANDO...' : (insight ? 'RECRIAR ANÁLISE' : 'GERAR INSIGHT')}
                    </Button>
                </div>
            </CardContent>

            {/* Support Data Link */}
            {insight && (
                <div className="px-8 pb-4">
                    <details className="cursor-pointer group">
                        <summary className="text-[8px] font-mono text-muted-foreground/30 uppercase group-hover:text-primary transition-colors">Technical Trace</summary>
                        <pre className="text-[9px] font-mono bg-black/5 p-3 rounded-xl mt-2 overflow-auto max-h-32 text-muted-foreground/50">
                            {JSON.stringify(insight, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </Card>
    );
};

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-card border border-border rounded-3xl", className)}>{children}</div>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("p-6", className)}>{children}</div>
);
