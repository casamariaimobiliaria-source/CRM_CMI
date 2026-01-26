import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLead } from '../contexts/LeadContext';
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
        case 'Perdido': return 'destructive';
        case 'Agendou': return 'secondary';
        default: return 'outline';
    }
}

const getCardColor = (lead: Lead) => {
    const isOverdue = lead.nextContact && new Date(lead.nextContact) < new Date();

    if (isOverdue) return "bg-destructive/5 border-destructive/20 hover:border-destructive/40";
    if (lead.status === 'Agendou') return "bg-secondary/5 border-secondary/20 hover:border-secondary/40";
    if (lead.status === 'Comprou') return "bg-primary/5 border-primary/20 hover:border-primary/40";
    if (lead.status === 'Não Responde' || lead.status === 'Perdido') return "bg-muted/30 border-muted-foreground/10 hover:border-muted-foreground/20";

    return "bg-card border-border hover:border-border/60";
}

const getTempColor = (temp: string) => {
    switch (temp) {
        case 'Quente': return 'border-l-destructive/60';
        case 'Morno': return 'border-l-secondary/60';
        default: return 'border-l-accent/60';
    }
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
    const navigate = useNavigate();
    const { userProfile } = useLead();
    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'owner';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.005 }}
            onClick={() => navigate(`/edit/${lead.id}`)}
            className={cn(
                "relative flex flex-col md:flex-row items-center p-4 md:p-5 bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl transition-all duration-700 cursor-pointer group shadow-premium hover:shadow-2xl hover:border-primary/20 overflow-hidden",
                lead.status === 'Agendou' && "bg-secondary/5",
                lead.status === 'Comprou' && "bg-primary/5 shadow-gold-glow/5"
            )}
        >
            {/* Ambient Background Light */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />

            <div className="flex w-full md:w-auto items-center md:block">
                {/* Avatar - High End */}
                <div className="relative w-12 h-12 md:w-14 md:h-14 bg-black border border-white/10 rounded-full flex items-center justify-center overflow-hidden shrink-0 transition-all duration-700 group-hover:border-primary/40 group-hover:shadow-gold-glow">
                    <span className="font-luxury italic text-lg md:text-xl text-primary drop-shadow-sm">
                        {String(lead?.nome || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>

                {/* Mobile Name & Status */}
                <div className="md:hidden ml-4 flex-1">
                    <h3 className="font-display font-bold text-base text-foreground tracking-tight">
                        {lead?.nome || 'Anônimo'}
                    </h3>
                    <Badge variant={getStatusVariant(lead?.status || 'Ativo') as any} className="text-[9px] px-2 py-0 border-white/5 font-bold tracking-widest uppercase h-4 bg-white/5 mt-1">
                        {lead?.status}
                    </Badge>
                </div>
            </div>

            <div className="flex-1 min-w-0 w-full mt-4 md:mt-0 md:ml-6">
                <div className="hidden md:flex items-center gap-3 mb-1">
                    <h3 className="font-display font-bold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors duration-500">
                        {lead?.nome || 'Anônimo'}
                    </h3>
                    <Badge variant={getStatusVariant(lead?.status || 'Ativo') as any} className="text-[9px] px-2 py-0 border-white/5 font-bold tracking-widest uppercase h-4 bg-white/5">
                        {lead?.status}
                    </Badge>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    <div className="flex items-center gap-1.5 md:border-r border-white/10 pr-0 md:pr-4">
                        <span className="text-foreground/80">{lead.telefone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:border-r border-white/10 pr-0 md:pr-4">
                        <span className="text-primary tracking-[0.1em] font-bold italic truncate">{lead.empreendimento || 'PREMIUM PROPERTY'}</span>
                    </div>
                    {lead.nextContact && (
                        <div className={cn(
                            "flex items-center gap-1.5",
                            new Date(lead.nextContact) < new Date() ? "text-destructive" : "text-muted-foreground"
                        )}>
                            <span className="opacity-50 italic">NEXT:</span>
                            <span>{format(new Date(lead.nextContact), "dd MMM HH:mm", { locale: ptBR })}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6 ml-0 md:ml-4 w-full md:w-auto justify-end mt-4 md:mt-0 absolute top-4 right-4 md:static">
                {/* Temp Indicator */}
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Temperature</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3 h-0.5 rounded-full transition-all duration-700",
                                    i === 1 && lead.temperatura === 'Frio' && "bg-accent",
                                    i <= 2 && lead.temperatura === 'Morno' && "bg-secondary",
                                    i <= 3 && lead.temperatura === 'Quente' && "bg-destructive",
                                    (i > 1 && lead.temperatura === 'Frio') || (i > 2 && lead.temperatura === 'Morno') ? "bg-white/5" : ""
                                )}
                            />
                        ))}
                    </div>
                </div>

                <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full bg-white/5 border border-white/5 hover:border-primary/40 hover:text-primary transition-all duration-500"
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
