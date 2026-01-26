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
import { Calendar } from 'lucide-react';

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => navigate(`/edit/${lead.id}`)}
            className="group flex items-center py-5 px-8 transition-all cursor-pointer relative overflow-hidden hover:bg-white/[0.03]"
        >
            <div className="flex-1 grid grid-cols-12 gap-8 items-center">
                {/* Name & Avatar */}
                <div className="col-span-4 flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black border border-white/10 text-primary font-luxury italic text-sm shrink-0">
                        {String(lead?.nome || '?').charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="font-display font-bold text-foreground text-[15px] truncate tracking-tight group-hover:text-primary transition-colors">
                            {lead?.nome || 'Anônimo'}
                        </h3>
                        <span className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-widest">{lead.telefone}</span>
                    </div>
                </div>

                {/* Project */}
                <div className="col-span-3 min-w-0">
                    <span className="text-[11px] font-bold text-primary/80 truncate uppercase tracking-[0.1em] italic">
                        {lead.empreendimento || 'PREMIUM REAL ESTATE'}
                    </span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                    <Badge variant={getStatusVariant(lead?.status || 'Ativo') as any} className="text-[9px] py-0 h-4 border-white/5 bg-white/5 font-bold tracking-widest uppercase">
                        {lead?.status}
                    </Badge>
                </div>

                {/* Next Contact */}
                <div className="col-span-2 flex items-center justify-end">
                    {lead.nextContact && (
                        <div className={cn(
                            "text-[10px] font-bold flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02]",
                            new Date(lead.nextContact) < new Date() ? "text-destructive" : "text-muted-foreground/60"
                        )}>
                            <Calendar className="w-3 h-3 opacity-30" />
                            {format(new Date(lead.nextContact), "dd MMM", { locale: ptBR })}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-4">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-white/5 border border-white/5 hover:border-primary/40 hover:text-primary transition-all duration-500"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://wa.me/55${String(lead?.telefone || '').replace(/\D/g, '')}`, '_blank');
                        }}
                    >
                        <svg className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c.908.523 1.985.903 3.162.903 3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm3.456 8.351c-.147.415-.75.762-1.031.812-.259.045-.598.082-1.391-.231-1.026-.402-1.742-1.428-1.791-1.493-.049-.064-.403-.532-.403-1.013 0-.481.253-.717.342-.816.089-.098.196-.123.261-.123s.131.002.188.007c.06.004.141-.023.221.171.081.194.279.678.305.731.026.053.043.115.008.186-.035.07-.052.115-.104.176-.052.061-.109.136-.156.183-.053.053-.108.111-.047.216.062.105.275.452.591.733.407.362.748.473.853.526.105.053.166.044.227-.026.061-.07.261-.304.331-.407.07-.104.14-.087.236-.052.096.035.607.286.711.338.105.053.175.08.2.123.025.044.025.253-.122.668z" /></svg>
                    </Button>
                    <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-muted-foreground/20 group-hover:border-primary/20 group-hover:text-primary/40 transition-all duration-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LeadTableRow;
