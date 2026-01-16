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

    if (isOverdue) return "bg-red-500/15 border-red-200/60 hover:bg-red-500/20";
    if (lead.status === 'Agendou') return "bg-amber-500/15 border-amber-200/60 hover:bg-amber-500/20";
    if (lead.status === 'Comprou') return "bg-emerald-500/15 border-emerald-200/60 hover:bg-emerald-500/20";
    if (lead.status === 'Não Responde' || lead.status === 'Perdido') return "bg-slate-500/15 border-slate-200/60 hover:bg-slate-500/20";

    return "bg-card border-border hover:bg-muted/30";
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
    const navigate = useNavigate();
    const { userProfile } = useLead();
    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'owner';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            onClick={() => navigate(`/edit/${lead.id}`)}
            className={cn(
                "flex items-center p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden border",
                getCardColor(lead)
            )}
        >
            {/* Temperature Indicator Strip */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5",
                lead.temperatura === 'Quente' ? 'bg-rose-500' : lead.temperatura === 'Morno' ? 'bg-amber-500' : 'bg-blue-500'
            )} />

            <div className="flex-1 min-w-0 flex items-center gap-4 pl-2">
                <div className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center bg-secondary/10 text-secondary-foreground font-black text-sm shrink-0 uppercase">
                    {String(lead?.nome || '?').charAt(0)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground text-sm truncate uppercase tracking-tight group-hover:text-primary transition-colors">{lead?.nome || 'Sem Nome'}</h3>
                        <Badge variant={getStatusVariant(lead?.status || 'Ativo') as any} className="text-[9px] py-0 h-5">
                            {lead?.status}
                        </Badge>
                        {lead.nextContact && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-[9px] py-0 h-5 border-dashed",
                                    new Date(lead.nextContact) < new Date()
                                        ? "text-rose-500 border-rose-200 bg-rose-50"
                                        : "text-emerald-600 border-emerald-200 bg-emerald-50"
                                )}
                            >
                                <span className="mr-1">📅</span>
                                {format(new Date(lead.nextContact), "dd MMM HH:mm", { locale: ptBR })}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
                        <span>{lead.telefone}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-primary font-bold">{lead.empreendimento || 'Geral'}</span>
                        {lead.dataCompra && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span>{(() => { try { return format(new Date(lead.dataCompra), "dd MMM", { locale: ptBR }) } catch (e) { return "" } })()}</span>
                            </>
                        )}
                        {isAdmin && lead.corretor && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span className="italic truncate">Corretor: {lead.corretor}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 ml-2">
                <div className="hidden xs:flex flex-col items-end shrink-0 mr-2">
                    <span className="text-[8px] font-black text-muted-foreground/50 uppercase leading-none tracking-widest">TEMPERATURA</span>
                    <span className={cn(
                        "text-[10px] font-black mt-0.5 uppercase tracking-wider",
                        lead?.temperatura === 'Quente' ? 'text-rose-500' : lead?.temperatura === 'Morno' ? 'text-amber-500' : 'text-blue-500'
                    )}>
                        {lead?.temperatura}
                    </span>
                </div>

                <div className="flex gap-1">
                    <Button
                        size="icon"
                        className="h-9 w-9 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-emerald-100 dark:border-emerald-500/20 shadow-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://wa.me/55${String(lead?.telefone || '').replace(/\D/g, '')}`, '_blank');
                        }}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c.908.523 1.985.903 3.162.903 3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm3.456 8.351c-.147.415-.75.762-1.031.812-.259.045-.598.082-1.391-.231-1.026-.402-1.742-1.428-1.791-1.493-.049-.064-.403-.532-.403-1.013 0-.481.253-.717.342-.816.089-.098.196-.123.261-.123s.131.002.188.007c.06.004.141-.023.221.171.081.194.279.678.305.731.026.053.043.115.008.186-.035.07-.052.115-.104.176-.052.061-.109.136-.156.183-.053.053-.108.111-.047.216.062.105.275.452.591.733.407.362.748.473.853.526.105.053.166.044.227-.026.061-.07.261-.304.331-.407.07-.104.14-.087.236-.052.096.035.607.286.711.338.105.053.175.08.2.123.025.044.025.253-.122.668z" /></svg>
                    </Button>
                    <div className="w-9 h-9 flex items-center justify-center text-muted-foreground/50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>
            </div>
        </motion.div >
    );
};

export default LeadCard;
