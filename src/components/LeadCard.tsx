import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { Lead } from '../types';

interface LeadCardProps {
    lead: Lead;
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Ativo': return 'success';
        case 'Comprou': return 'default';
        case 'Inativo': return 'destructive';
        case 'Agendou': return 'secondary';
        default: return 'outline';
    }
}

const getCardColor = (lead: Lead) => {
    const isOverdue = lead.proximo_contato && new Date(lead.proximo_contato) < new Date();

    if (isOverdue) return "bg-red-500/5 border-red-500/20 hover:border-red-500/40";
    if (lead.status === 'Comprou') return "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40";
    if (lead.status === 'Agendou') return "bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40";
    if (lead.status === 'Não Responde') return "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0";
    if (lead.status === 'Inativo') return "opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700";

    return "hover:border-primary/30 hover:bg-primary/5 bg-card/40 backdrop-blur-md shadow-premium border-border/40 hover:shadow-luxury";
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
    const navigate = useNavigate();
    const { userProfile } = useUser();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={() => navigate(`/edit/${lead.id}`)}
            className={cn(
                "relative flex flex-col md:flex-row items-center p-6 rounded-[2rem] transition-all duration-500 cursor-pointer group overflow-hidden",
                getCardColor(lead)
            )}
        >
            {/* Ambient Background Light */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-all duration-500" />

            <div className="flex w-full md:w-auto items-center md:block">
                {/* Avatar */}
                <div className="relative w-14 h-14 md:w-16 md:h-16 bg-card rounded-[1.25rem] flex items-center justify-center overflow-hidden shrink-0 transition-all duration-700 border border-border/40 group-hover:border-primary/40 group-hover:shadow-gold-glow">
                    <span className="font-display font-bold text-xl md:text-2xl text-primary italic">
                        {String(lead?.nome || '?').charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* Mobile Name & Status */}
                <div className="md:hidden ml-4 flex-1">
                    <h3 className="font-display font-bold text-base text-foreground italic tracking-tight">
                        {lead?.nome || 'Anônimo'}
                    </h3>
                    <Badge variant={getStatusVariant(lead?.status || 'Ativo') as any} className="text-[10px] px-2 py-0.5 mt-1 bg-background border-border shadow-sm">
                        {lead?.status}
                    </Badge>
                </div>
            </div>

            <div className="flex-1 min-w-0 w-full mt-4 md:mt-0 md:ml-6">
                <div className="hidden md:flex items-center gap-3 mb-1">
                    <h3 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-200 italic tracking-tight">
                        {lead?.nome || 'Anônimo'}
                    </h3>
                    <Badge variant={getStatusVariant(lead?.status || 'Ativo') as any} className="text-[10px] px-3 py-1 bg-background/50 backdrop-blur-sm border-border/40 shadow-sm font-display italic">
                        {lead?.status}
                    </Badge>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 text-[10px] font-bold tracking-[0.2em] text-muted-foreground/40 uppercase">
                    <div className="flex items-center gap-2 md:border-r border-border/20 pr-0 md:pr-6">
                        <span className="text-foreground/60">{lead.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2 md:border-r border-border/20 pr-0 md:pr-6 italic">
                        <span className="opacity-40">CADASTRO:</span>
                        <span className="text-primary/70 truncate max-w-[120px] font-display">{lead.corretor || 'SISTEMA'}</span>
                    </div>
                    <div className="flex items-center gap-2 md:border-r border-border/20 pr-0 md:pr-6">
                        <span className="text-primary font-display font-bold italic truncate tracking-[0.1em] text-[11px]">{lead.empreendimento || 'IMÓVEL PREMIUM'}</span>
                    </div>
                    {lead.proximo_contato && (
                        <div className={cn(
                            "flex items-center gap-2",
                            new Date(lead.proximo_contato) < new Date() ? "text-destructive" : "text-muted-foreground/40"
                        )}>
                            <span className="opacity-40 italic">PRÓXIMO:</span>
                            <span className="font-display">{format(new Date(lead.proximo_contato), "dd MMM · HH:mm", { locale: ptBR })}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6 ml-0 md:ml-4 w-full md:w-auto justify-end mt-4 md:mt-0 absolute top-4 right-4 md:static">
                {/* Temp Indicator */}
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest block mb-2">Temperatura</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3 h-0.5 rounded-full transition-all duration-700",
                                    i === 1 && lead.temperatura === 'Frio' && "bg-accent",
                                    i <= 2 && lead.temperatura === 'Morno' && "bg-secondary",
                                    i <= 3 && lead.temperatura === 'Quente' && "bg-destructive",
                                    (i > 1 && lead.temperatura === 'Frio') || (i > 2 && lead.temperatura === 'Morno') ? "bg-foreground/10" : ""
                                )}
                            />
                        ))}
                    </div>
                </div>

                <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full bg-foreground/5 border border-border/50 hover:border-primary/40 hover:text-primary transition-all duration-500"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://wa.me/55${String(lead?.telefone || '').replace(/\D/g, '')}`, '_blank');
                    }}
                >
                    <svg className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c.908.523 1.985.903 3.162.903 3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm3.456 8.351c-.147.415-.75.762-1.031.812-.259.045-.598.082-1.391-.231-1.026-.402-1.742-1.428-1.791-1.493-.049-.064-.403-.532-.403-1.013 0-.481.253-.717.342-.816.089-.098.196-.123.261-.123s.131.002.188.007c.06.004.141-.023.221.171.081.194.279.678.305.731.026.053.043.115.008.186-.035.07-.052.115-.104.176-.052.061-.109.136-.156.183-.053.053-.108.111-.047.216.062.105.275.452.591.733.407.362.748.473.853.526.105.053.166.044.227-.026.061-.07.261-.304.331-.407.07-.104.14-.087.236-.052.096.035.607.286.711.338.105.053.175.08.2.123.025.044.025.253-.122.668z" /></svg>
                </Button>
            </div>
        </motion.div >
    );
};

export default LeadCard;
