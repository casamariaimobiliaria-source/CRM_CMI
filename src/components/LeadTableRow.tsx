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
    const isOverdue = lead.nextContact && new Date(lead.nextContact) < new Date();

    if (isOverdue) return "bg-red-500/10 border-red-200/50 hover:bg-red-500/20";
    if (lead.status === 'Agendou') return "bg-amber-500/10 border-amber-200/50 hover:bg-amber-500/20";
    if (lead.status === 'Comprou') return "bg-emerald-500/10 border-emerald-200/50 hover:bg-emerald-500/20";
    if (lead.status === 'Não Responde' || lead.status === 'Perdido') return "bg-slate-500/10 border-slate-200/50 hover:bg-slate-500/20 text-muted-foreground";

    return "bg-card hover:bg-muted/50 border-border/50";
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
            className="group flex flex-col md:flex-row items-center py-5 px-5 md:px-8 transition-all cursor-pointer relative overflow-hidden bg-card hover:bg-accent/30 border-b border-border/40 last:border-0"
        >
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-start md:items-center">
                {/* Name & Avatar */}
                <div className="col-span-1 md:col-span-4 flex items-center gap-4 min-w-0 w-full mb-2 md:mb-0">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-background border border-border shadow-sm text-primary font-display font-bold italic text-base shrink-0 group-hover:border-primary/50 group-hover:shadow-gold-glow transition-all duration-500">
                        {String(lead?.nome || '?').charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between md:justify-start gap-2">
                            <h3 className="font-display font-bold text-foreground text-[16px] truncate tracking-tight group-hover:text-primary transition-colors leading-tight">
                                {lead?.nome || 'Anônimo'}
                            </h3>
                            {/* Mobile Status Badge inside Name area */}
                            <div className="md:hidden">
                                <Badge variant={getStatusVariant(lead?.status || 'Ativo') as any} className="text-[9px] py-0.5 px-2 bg-background border-border font-bold tracking-widest uppercase">
                                    {lead?.status}
                                </Badge>
                            </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60">{lead.telefone}</span>
                    </div>
                </div>

                {/* Project & Registrant */}
                <div className="col-span-1 md:col-span-3 min-w-0 md:pl-0">
                    <div className="flex flex-col gap-1 pl-14 md:pl-0">
                        <span className="text-[11px] font-bold text-primary/90 truncate uppercase tracking-[0.05em] italic block">
                            {lead.empreendimento || 'IMÓVEL PREMIUM'}
                        </span>
                        <div className="flex items-center gap-1.5 opacity-50">
                            <User className="w-2.5 h-2.5" />
                            <span className="text-[9px] font-bold truncate uppercase tracking-widest">{lead.corretor || 'SISTEMA'}</span>
                        </div>
                    </div>
                </div>

                {/* Status - Desktop Only */}
                <div className="hidden md:block md:col-span-2">
                    <Badge variant={getStatusVariant(lead?.status || 'Ativo') as any} className="text-[9px] py-0.5 px-2.5 bg-background border-border font-bold tracking-widest uppercase shadow-sm group-hover:border-primary/30 transition-colors">
                        {lead?.status}
                    </Badge>
                </div>

                {/* Next Contact */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-end md:pl-0">
                    <div className="pl-15 md:pl-0">
                        {lead.nextContact && (
                            <div className={cn(
                                "text-[10px] font-bold flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background shadow-premium inline-flex",
                                new Date(lead.nextContact) < new Date() ? "text-destructive border-destructive/20" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                                <Calendar className="w-3 h-3 opacity-40" />
                                {format(new Date(lead.nextContact), "dd MMM", { locale: ptBR })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 md:col-span-1 flex items-center justify-end gap-4 absolute md:static top-5 right-5">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl bg-background border border-border hover:border-primary/60 hover:text-primary shadow-sm transition-all duration-300 active:scale-90"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://wa.me/55${String(lead?.telefone || '').replace(/\D/g, '')}`, '_blank');
                        }}
                    >
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c.908.523 1.985.903 3.162.903 3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm3.456 8.351c-.147.415-.75.762-1.031.812-.259.045-.598.082-1.391-.231-1.026-.402-1.742-1.428-1.791-1.493-.049-.064-.403-.532-.403-1.013 0-.481.253-.717.342-.816.089-.098.196-.123.261-.123s.131.002.188.007c.06.004.141-.023.221.171.081.194.279.678.305.731.026.053.043.115.008.186-.035.07-.052.115-.104.176-.052.061-.109.136-.156.183-.053.053-.108.111-.047.216.062.105.275.452.591.733.407.362.748.473.853.526.105.053.166.044.227-.026.061-.07.261-.304.331-.407.07-.104.14-.087.236-.052.096.035.607.286.711.338.105.053.175.08.2.123.025.044.025.253-.122.668z" /></svg>
                    </Button>
                    <div className="hidden md:flex w-9 h-9 rounded-xl border border-border items-center justify-center text-muted-foreground/20 group-hover:border-primary/40 group-hover:text-primary/60 transition-all duration-500 shadow-sm bg-background">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LeadTableRow;
