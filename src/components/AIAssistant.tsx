import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Copy, Check, RefreshCw, BrainCircuit, Lightbulb } from 'lucide-react';
import { Lead } from '../types';
import { generateWhatsAppSuggestions, analyzeLeadProfile } from '../lib/openai';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface AIAssistantProps {
    lead: Lead;
    className?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ lead, className }) => {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const [suggs, anal] = await Promise.all([
                generateWhatsAppSuggestions(lead),
                analyzeLeadProfile(lead)
            ]);

            if (!suggs || !anal) {
                throw new Error('A IA não retornou dados válidos.');
            }

            setSuggestions(suggs);
            setAnalysis(anal);
            toast.success('IA gerou novas sugestões!');
        } catch (error) {
            console.error('AIAssistant Error:', error);
            toast.error('Erro ao consultar a IA. Verifique sua chave API ou histórico.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Copiado para o WhatsApp!');
        setTimeout(() => setCopiedIndex(null), 2000);

        // Opcional: Abrir WhatsApp diretamente
        const encodedText = encodeURIComponent(text);
        const win = window.open(`https://wa.me/55${lead.telefone.replace(/\D/g, '')}?text=${encodedText}`, '_blank');
        win?.focus();
    };

    return (
        <div className={cn("p-6 bg-primary/5 border border-primary/20 rounded-3xl relative overflow-hidden group/ai", className)}>
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 blur-[80px] pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-neon">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold italic text-lg tracking-tight">ImobLeads Brain</h3>
                        <p className="text-[9px] text-primary font-bold tracking-[0.2em] uppercase">Powered by OpenAI</p>
                    </div>
                </div>
                {!suggestions && (
                    <Button
                        size="sm"
                        onClick={handleGenerate}
                        isLoading={loading}
                        className="bg-primary text-primary-foreground rounded-full px-4 text-[10px] shadow-neon-cyan hover:scale-105 transition-all whitespace-nowrap"
                    >
                        Analisar Lead
                    </Button>
                )}
                {suggestions && (
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {!suggestions ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-8 text-center"
                    >
                        <BrainCircuit className="w-12 h-12 text-primary/20 mx-auto mb-4 animate-pulse" />
                        <p className="text-xs text-muted-foreground/60 max-w-[200px] mx-auto leading-relaxed italic">
                            Clique para analisar o perfil deste lead e gerar abordagens de alto impacto via WhatsApp.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Summary & Strategy */}
                        {analysis && (
                            <div className="p-4 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl space-y-3">
                                <div className="flex items-start gap-3">
                                    <MessageSquare className="w-4 h-4 text-primary mt-1 shrink-0" />
                                    <p className="text-xs text-foreground font-medium italic">"{analysis.resumo}"</p>
                                </div>
                                <div className="flex items-start gap-3 pt-2 border-t border-primary/10">
                                    <Lightbulb className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                    <p className="text-[11px] text-muted-foreground"><span className="font-bold text-amber-600 dark:text-amber-500">ESTRATÉGIA:</span> {analysis.dica}</p>
                                </div>
                            </div>
                        )}

                        {/* WhatsApp Options */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-primary tracking-widest uppercase ml-1">Sugestões de Abordagem</label>
                            {suggestions?.opcoes?.map((op: any, i: number) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 4 }}
                                    className="group relative p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/30 transition-all cursor-pointer shadow-premium"
                                    onClick={() => copyToClipboard(op.texto, i)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter px-2 py-0 h-4 border-primary/20 text-primary">
                                            {op.titulo}
                                        </Badge>
                                        <div className="p-1.5 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            {copiedIndex === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground line-clamp-2 italic leading-relaxed">
                                        "{op.texto}"
                                    </p>
                                </motion.div>
                            ))}
                            {(!suggestions?.opcoes || suggestions.opcoes.length === 0) && (
                                <p className="text-[10px] text-muted-foreground italic ml-1">Nenhuma sugestão disponível.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
