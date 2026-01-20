import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { Building2, Users, Target, ShieldAlert, RefreshCw, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface OrgStats {
    id: string;
    name: string;
    plan_tier: string;
    max_leads: number;
    subscription_status: string;
    created_at: string;
    lead_count: number;
    member_count: number;
}

const AdminPanel: React.FC = () => {
    const [stats, setStats] = useState<OrgStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        setRefreshing(true);
        try {
            const { data, error } = await supabase
                .from('global_organization_stats')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStats(data || []);
        } catch (error: any) {
            console.error('Error fetching admin stats:', error);
            toast.error('Erro ao carregar dados administrativos.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const updatePlan = async (orgId: string, tier: string, maxLeads: number) => {
        try {
            const { error } = await supabase
                .from('organizations')
                .update({
                    plan_tier: tier,
                    max_leads: maxLeads
                })
                .eq('id', orgId);

            if (error) throw error;
            toast.success('Plano atualizado com sucesso!');
            fetchStats();
        } catch (error: any) {
            toast.error('Erro ao atualizar plano.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 pb-24 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-primary" />
                        Admin Console
                    </h2>
                    <p className="text-muted-foreground font-medium">Gestão global de organizações e faturamento.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchStats}
                    disabled={refreshing}
                    className="gap-2"
                >
                    <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                    Atualizar
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-0 shadow-xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b">
                        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                            <span>Organização / Cliente</span>
                            <div className="flex gap-12 mr-12 text-right">
                                <span className="w-24">Plano</span>
                                <span className="w-24">Leads</span>
                                <span className="w-24">Equipe</span>
                                <span className="w-32">Ações</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 divide-y">
                        {stats.map((org) => (
                            <motion.div
                                key={org.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 hover:bg-slate-50/50 flex items-center justify-between transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{org.name}</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">ID: {org.id.split('-')[0]}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 font-jakarta">
                                    <div className="w-24">
                                        <Badge variant={org.plan_tier === 'free' ? 'outline' : 'default'} className="capitalize font-black">
                                            {org.plan_tier}
                                        </Badge>
                                    </div>
                                    <div className="w-24 flex flex-col items-center">
                                        <span className="text-sm font-bold text-slate-900">{org.lead_count} / {org.max_leads}</span>
                                        <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${Math.min((org.lead_count / org.max_leads) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-24 flex items-center gap-1 justify-center">
                                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-sm font-bold">{org.member_count}</span>
                                    </div>
                                    <div className="w-32 flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 px-2 text-[10px] items-center gap-1 font-bold"
                                            onClick={() => updatePlan(org.id, 'pro', 999999)}
                                        >
                                            <Target className="w-3 h-3" />
                                            PRO
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 px-2 text-[10px] items-center gap-1 font-bold"
                                            onClick={() => updatePlan(org.id, 'free', 50)}
                                        >
                                            FREE
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminPanel;
