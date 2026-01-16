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
    const { userProfile } = useLead();
    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'owner';

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => navigate(`/edit/${lead.id}`)}
            className={cn(
                "group border-b flex items-center py-2 px-4 transition-all cursor-pointer relative overflow-hidden",
                getRowColor(lead)
            )}
        >
            {/* Temperature Indicator Strip */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                lead.temperatura === 'Quente' ? 'bg-rose-500' : lead.temperatura === 'Morno' ? 'bg-amber-500' : 'bg-blue-500'
            )} />

            <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-2">
                {/* Name */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-secondary/10 text-secondary-foreground font-black text-[10px] shrink-0 uppercase">
                        {String(lead?.nome || '?').charAt(0)}
                    </div>
                    <h3 className="font-bold text-foreground text-xs truncate uppercase tracking-tight group-hover:text-primary transition-colors">
                        {lead?.nome || 'Sem Nome'}
                    </h3>
                </div>

                {/* Contact */}
                <div className="col-span-2 text-[11px] text-muted-foreground font-medium truncate">
                    {lead.telefone}
                </div>

                {/* Project & Broker */}
                <div className="col-span-2 min-w-0 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-primary truncate uppercase tracking-tight">
                        {lead.empreendimento || 'Geral'}
                    </span>
                    {isAdmin && lead.corretor && (
                        <span className="text-[9px] text-muted-foreground truncate italic">
                            By: {lead.corretor}
                        </span>
                    )}
                </div>

                {/* Status & Temp */}
                <div className="col-span-2 flex items-center gap-2">
                    <Badge variant={getStatusVariant(lead?.status || 'Ativo') as any} className="text-[8px] py-0 h-4 px-1.5 uppercase font-black">
                        {lead?.status}
                    </Badge>
                </div>

                {/* Schedule & Actions */}
                <div className="col-span-2 flex items-center justify-end gap-3">
                    {lead.nextContact && (
                        <div className={cn(
                            "text-[9px] font-bold flex items-center gap-1 shrink-0",
                            new Date(lead.nextContact) < new Date() ? "text-rose-500" : "text-emerald-600"
                        )}>
                            📅 {format(new Date(lead.nextContact), "dd/MM", { locale: ptBR })}
                        </div>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="icon"
                            className="h-7 w-7 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none shadow-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://wa.me/55${String(lead?.telefone || '').replace(/\D/g, '')}`, '_blank');
                            }}
                        >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c.908.523 1.985.903 3.162.903 3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm3.456 8.351c-.147.415-.75.762-1.031.812-.259.045-.598.082-1.391-.231-1.026-.402-1.742-1.428-1.791-1.493-.049-.064-.403-.532-.403-1.013 0-.481.253-.717.342-.816.089-.098.196-.123.261-.123s.131.002.188.007c.06.004.141-.023.221.171.081.194.279.678.305.731.026.053.043.115.008.186-.035.07-.052.115-.104.176-.052.061-.109.136-.156.183-.053.053-.108.111-.047.216.062.105.275.452.591.733.407.362.748.473.853.526.105.053.166.044.227-.026.061-.07.261-.304.331-.407.07-.104.14-.087.236-.052.096.035.607.286.711.338.105.053.175.08.2.123.025.044.025.253-.122.668z" /></svg>
                        </Button>
                        <div className="text-muted-foreground/30">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LeadTableRow;
