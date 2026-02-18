import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLead } from '../contexts/LeadContext';
import { useUser } from '../contexts/UserContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { Lead } from '../types';
import { Calendar, User } from 'lucide-react';

interface LeadTableRowProps {
    lead: Lead;
}

const getRowColor = (lead: Lead) => {
    const isOverdue = lead.proximo_contato && new Date(lead.proximo_contato) < new Date();

    if (isOverdue) return "hover:bg-red-500/5 hover:border-red-500/30";
    if (lead.status === 'Agendou') return "hover:bg-amber-500/5 hover:border-amber-500/30";
    if (lead.status === 'Comprou') return "hover:bg-emerald-500/5 hover:border-emerald-500/30";
    if (lead.status === 'Não Responde' || lead.status === 'Perdido') return "opacity-60 hover:opacity-100 transition-opacity";

    return "";
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

const LeadTableRow: React.FC<LeadTableRowProps> = ({ lead }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ x: 5 }}
            onClick={() => navigate(`/edit/${lead.id}`)}
            className={cn(
                "group flex flex-col md:flex-row items-center py-6 px-6 md:px-10 transition-all cursor-pointer relative overflow-hidden border-b border-border/20 last:border-0",
                getRowColor(lead)
            )}
        >
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10 items-start md:items-center relative z-10">
                {/* Name & Avatar */}
                <div className="col-span-1 md:col-span-4 flex items-center gap-5 min-w-0 w-full">
                    <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-card border border-border/50 shadow-sm text-primary font-display font-bold italic text-xl group-hover:border-primary/50 group-hover:shadow-gold-glow transition-all duration-500">
                            {String(lead?.nome || '?').charAt(0)}
                        </div>
                        {lead.temperatura === 'Quente' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background animate-pulse" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between md:justify-start gap-3">
                            <h3 className="font-display font-bold text-foreground text-[18px] md:text-[20px] truncate tracking-tight group-hover:text-primary transition-colors leading-none italic">
                                {lead?.nome || 'Anônimo'}
                            </h3>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-[0.2em] mt-1.5">{lead.telefone}</span>
                    </div>
                </div>

                {/* Project & Registrant */}
                <div className="col-span-1 md:col-span-3 min-w-0">
                    <div className="flex flex-col gap-1.5 pl-17 md:pl-0">
                        <span className="text-[12px] font-bold text-primary tracking-[0.1em] font-display italic truncate block">
                            {lead.empreendimento || 'IMÓVEL PREMIUM'}
                        </span>
                        <div className="flex items-center gap-2 text-muted-foreground/40 text-[9px] font-bold uppercase tracking-widest">
                            <User className="w-3 h-3" />
                            <span>{lead.corretor || 'SISTEMA'}</span>
                        </div>
                    </div>
                </div>

                {/* Status - Desktop Only */}
                <div className="hidden md:flex md:col-span-2 justify-center">
                    <Badge variant={getStatusVariant(lead?.status || 'Ativo') as any} className="text-[10px] py-1 px-3 bg-background/50 border-border/40 font-bold tracking-widest uppercase shadow-sm group-hover:border-primary/30 transition-all font-display italic">
                        {lead?.status}
                    </Badge>
                </div>

                {/* Next Contact */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-end">
                    <div className="pl-17 md:pl-0">
                        {lead.proximo_contato && (
                            <div className={cn(
                                "text-[10px] font-bold flex items-center gap-2.5 px-4 py-2 rounded-2xl border border-border/30 bg-background/30 backdrop-blur-sm shadow-sm transition-all group-hover:bg-background/50",
                                new Date(lead.proximo_contato) < new Date() ? "text-destructive border-destructive/20 bg-destructive/5" : "text-muted-foreground/60 group-hover:text-foreground"
                            )}>
                                <Calendar className="w-3.5 h-3.5 opacity-40" />
                                <span>{format(new Date(lead.proximo_contato), "dd MMM · HH:mm", { locale: ptBR })}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile & Desktop Actions (hidden to keep it clean, but kept the logic) */}
                <div className="md:col-span-1 hidden md:flex items-center justify-end">
                    <div className="w-10 h-10 rounded-2xl border border-border/20 flex items-center justify-center text-muted-foreground/10 group-hover:border-primary/40 group-hover:text-primary transition-all duration-500 shadow-sm bg-background/30">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Subtle Gradient Hover Effect */}
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </motion.div>
    );
};

export default LeadTableRow;
