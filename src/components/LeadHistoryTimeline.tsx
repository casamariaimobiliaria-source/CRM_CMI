import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { History, UserCircle, ArrowRight, ArrowRightLeft, FilePlus, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
    id: string;
    action: string;
    changed_fields: Record<string, any>;
    created_at: string;
    user_id: string;
    users: {
        name: string;
        email: string;
    };
}

interface LeadHistoryTimelineProps {
    leadId: string;
}

export const LeadHistoryTimeline: React.FC<LeadHistoryTimelineProps> = ({ leadId }) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { userProfile } = useUser();

    useEffect(() => {
        async function fetchLogs() {
            if (!leadId) return;

            try {
                setLoading(true);
                // Supabase has foreign key linking `user_id` to auth.users or public.users.
                // Assuming your users table is public.users based on typical setup.
                const { data, error } = await supabase
                    .from('lead_audit_logs')
                    .select(`
            *,
            users:user_id(name, email)
          `)
                    .eq('lead_id', leadId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching audit logs", error);
                } else {
                    setLogs(data as AuditLog[]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchLogs();
    }, [leadId]);

    const renderChangedFields = (fields: Record<string, any>) => {
        if (!fields || Object.keys(fields).length === 0) return null;

        // Handle initial insert custom event
        if (fields.event) {
            return (
                <div className="mt-2 text-xs font-mono font-medium text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded border border-emerald-400/20 inline-block">
                    {fields.event}
                </div>
            )
        }

        return (
            <div className="mt-3 space-y-2">
                {Object.entries(fields).map(([key, value]) => {
                    let oldVal = value?.old;
                    let newVal = value?.new;

                    // Format strings if empty
                    if (oldVal === null || oldVal === '') oldVal = 'vazio';
                    if (newVal === null || newVal === '') newVal = 'vazio';

                    return (
                        <div key={key} className="flex items-center gap-2 text-xs bg-white/5 border border-white/5 rounded-md p-2 w-max max-w-full overflow-hidden">
                            <span className="font-bold text-muted-foreground uppercase tracking-wider">{key}:</span>
                            <span className="text-destructive line-through max-w-[150px] truncate" title={String(oldVal)}>{String(oldVal)}</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground/50 mx-1 flex-shrink-0" />
                            <span className="text-primary font-bold max-w-[150px] truncate" title={String(newVal)}>{String(newVal)}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'INSERT': return <FilePlus className="w-4 h-4 text-emerald-400" />;
            case 'UPDATE': return <ArrowRightLeft className="w-4 h-4 text-primary" />;
            case 'DELETE': return <AlertTriangle className="w-4 h-4 text-destructive" />;
            default: return <History className="w-4 h-4 text-muted-foreground" />;
        }
    }

    if (loading) {
        return (
            <Card className="w-full bg-white/5 animate-pulse border-white/5">
                <CardContent className="h-40 flex items-center justify-center">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Carregando Histórico...</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <History className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-display italic">Histórico</CardTitle>
                        <CardDescription className="text-[10px] uppercase tracking-widest mt-1">Timeline inalterável do Lead</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-8">
                {logs.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <History className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="text-xs uppercase tracking-widest font-bold">Nenhum evento registrado</p>
                    </div>
                ) : (
                    <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
                        {logs.map((log) => (
                            <div key={log.id} className="relative pl-8">
                                {/* Timeline Node */}
                                <div className="absolute -left-[18px] top-1 p-1.5 rounded-full bg-background border border-white/10 flex items-center justify-center">
                                    <div className="p-1 rounded-full bg-white/5">
                                        {getActionIcon(log.action)}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="font-bold flex items-center gap-1.5 text-foreground/90">
                                            <UserCircle className="w-3.5 h-3.5 opacity-50" />
                                            {log.users?.name || 'Sistema / Usuário Removido'}
                                        </span>
                                        <span className="text-muted-foreground/40 text-xs">—</span>
                                        <span className="text-xs font-mono text-muted-foreground">
                                            {format(new Date(log.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                        </span>

                                        {log.action === 'INSERT' && (
                                            <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded">Criação</span>
                                        )}
                                        {log.action === 'UPDATE' && (
                                            <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-0.5 rounded">Edição</span>
                                        )}
                                    </div>

                                    {/* Detailed changes */}
                                    <div className="mt-1">
                                        {renderChangedFields(log.changed_fields)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
