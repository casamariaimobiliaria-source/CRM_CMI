import React, { useMemo } from 'react';
import { useLead } from '../contexts/LeadContext';
import { useUser } from '../contexts/UserContext';
import { useBrokers } from '../hooks/useBrokers';
import { LeadStatus, LeadTemperature } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, RefreshCw, ShieldAlert, TrendingUp, Target } from 'lucide-react';
import StatCard from '../components/StatCard';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { cn } from '../lib/utils';
import { ExecutiveAIInsight } from '../components/ExecutiveAIInsight';
import { Lead } from '../types';

const Dashboard: React.FC = () => {
    const { leads } = useLead();
    const { userProfile } = useUser();
    const { brokers } = useBrokers();
    const navigate = useNavigate();

    const safeLeads = useMemo(() => Array.isArray(leads) ? leads.filter(l => l && typeof l === 'object') : [], [leads]);

    const stats = useMemo(() => {
        const total = safeLeads.length;
        const active = safeLeads.filter(l => l.status === LeadStatus.ATIVO).length;
        const hot = safeLeads.filter(l => l.temperatura === LeadTemperature.QUENTE).length;
        const comprouCount = safeLeads.filter(l => l.status === LeadStatus.COMPROU).length;
        const conversion = total > 0 ? ((comprouCount / total) * 100).toFixed(1) : "0";

        return { total, active, hot, conversion };
    }, [safeLeads]);

    const chartData = useMemo(() => {
        try {
            if (safeLeads.length === 0) return [];
            const statusCounts: Record<string, number> = {};
            Object.values(LeadStatus).forEach(s => statusCounts[s] = 0);
            safeLeads.forEach(l => {
                if (l && l.status) {
                    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
                }
            });
            return Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] })).filter(item => item.value > 0);
        } catch (error) {
            console.error("Error calculating chartData:", error);
            return [];
        }
    }, [safeLeads]);

    const projectData = useMemo(() => {
        if (safeLeads.length === 0) return [];
        const projectCounts: Record<string, number> = {};
        safeLeads.forEach(l => {
            const project = l.empreendimento || 'Geral';
            projectCounts[project] = (projectCounts[project] || 0) + 1;
        });
        return Object.keys(projectCounts)
            .map(key => ({ name: key, value: projectCounts[key] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [safeLeads]);

    const brokerStats = useMemo(() => {
        if (!brokers || brokers.length === 0) return [];

        return brokers.map(broker => {
            const brokerLeads = safeLeads.filter(l => l.user_id === broker.id);
            const total = brokerLeads.length;
            const comprou = brokerLeads.filter(l => l.status === LeadStatus.COMPROU).length;
            const conversion = total > 0 ? ((comprou / total) * 100).toFixed(1) : "0";

            return {
                ...broker,
                total,
                comprou,
                conversion: parseFloat(conversion)
            };
        }).sort((a, b) => b.total - a.total);
    }, [safeLeads, brokers]);

    if (safeLeads.length === 0) {
        console.log("Dashboard: No leads found, rendering empty state");
        return (
            <div
                className="flex-1 flex flex-col items-center justify-center py-20 text-center p-4 h-full"
            >
                <Helmet>
                    <title>Painel | ImobLeads</title>
                </Helmet>
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground/40 mb-6 border border-white/5">
                    <TrendingUp className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">Aguardando Inteligência</h3>
                <p className="text-muted-foreground text-sm max-w-xs mt-2 font-medium">Adicione seus primeiros leads exclusivos para iniciar o motor de análise de desempenho.</p>
                <Button variant="luxury" className="mt-8 px-10 rounded-full" onClick={() => navigate('/add')}>COMEÇAR AGORA</Button>
            </div>
        );
    }

    return (
        <div className="px-6 md:px-10 py-8 md:py-12 pb-32 space-y-12 max-w-7xl mx-auto w-full">
            <Helmet>
                <title>Painel de Inteligência | ImobLeads</title>
            </Helmet>

            <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 border-b border-white/5 pb-8 md:pb-10 relative overflow-hidden"
            >
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tighter italic">
                        Dashboard
                    </h1>
                    <p className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mt-4 flex items-center gap-3">
                        <span className="h-[1px] w-8 bg-primary/30" />
                        Performance & Inteligência
                    </p>
                </div>
                <div className="flex flex-row flex-wrap gap-3 md:gap-4 relative z-10 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        className="flex-1 md:flex-none h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl border border-white/5 bg-white/5 text-[9px] md:text-[10px] font-bold tracking-widest uppercase hover:bg-white/10"
                        onClick={() => navigate('/kanban')}
                    >
                        Fluxo de Vendas
                    </Button>
                    <Button
                        className="flex-1 md:flex-none h-10 md:h-12 px-6 md:px-8 rounded-xl md:rounded-2xl bg-primary text-primary-foreground font-bold text-[9px] md:text-[10px] tracking-widest uppercase shadow-neon-cyan hover:scale-105 transition-all"
                        onClick={() => navigate('/reports')}
                    >
                        Relatórios Elite
                    </Button>
                </div>
            </div>

            {/* AI Executive Insight */}
            <div className="space-y-8">
                <ExecutiveAIInsight leads={safeLeads as Lead[]} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total de Leads', value: stats.total, icon: TrendingUp, color: 'text-primary' },
                    { label: 'Negócios Ativos', value: stats.active, icon: RefreshCw, color: 'text-purple-400' },
                    { label: 'Conversão', value: `${stats.conversion}%`, icon: BarChart3, color: 'text-emerald-400' },
                    { label: 'Leads Quentes', value: stats.hot, icon: Target, color: 'text-amber-500' }
                ].map((stat, i) => (
                    <StatCard
                        key={stat.label}
                        index={i}
                        label={stat.label}
                        value={stat.value}
                        colorClass={stat.color}
                        icon={<stat.icon className="w-6 h-6 opacity-60" />}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Secondary Metrics */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="p-8 space-y-8">
                        <div>
                            {userProfile?.role !== 'member' && (
                                <div className="flex items-center gap-2 mb-6">
                                    <Users className="w-4 h-4 text-primary" />
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Desempenho da Equipe</h4>
                                </div>
                            )}
                            {userProfile?.role === 'member' && (
                                <div className="flex items-center gap-2 mb-6">
                                    <Users className="w-4 h-4 text-primary" />
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Saúde da Carteira</h4>
                                </div>
                            )}
                            <div className="space-y-6">
                                {['Ativos', 'Inativos', 'Desperdício'].map((status, i) => {
                                    const percentage = i === 0 ? 85 : i === 1 ? 12 : 3;
                                    const color = i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-amber-500' : 'bg-destructive';
                                    return (
                                        <div key={status} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{status}</span>
                                                <span className="text-[11px] font-mono font-bold">{percentage}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    className={cn("h-full rounded-full", color)}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mb-4">Negócios Parados</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-display font-bold italic">0 Negócios</span>
                                <span className="text-[10px] font-bold text-emerald-500">OK</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/40 mt-2 font-medium">Sem mudança de estágio há +10 dias.</p>
                        </div>
                    </Card>

                    <Card className="p-8 bg-gradient-to-br from-primary/5 to-transparent">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mb-4">Leads Exclusivos</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-display font-bold italic text-primary">{stats.total}</span>
                            <span className="text-[10px] font-bold text-foreground/40">TOTAL</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/40 mt-2 font-medium italic">Base total de contatos em sua carteira.</p>
                    </Card>
                </div>

                {/* Main Visualizations */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-8">
                            <div>
                                <CardTitle className="text-2xl font-display italic tracking-tight">Estágios do Pipeline</CardTitle>
                                <CardDescription className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 mt-1">Movimentação de Leads</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <div className="h-2 w-2 rounded-full bg-primary/20" />
                                <div className="h-2 w-2 rounded-full bg-primary/20" />
                            </div>
                        </CardHeader>
                        <CardContent className="h-[300px] md:h-[400px] pt-6 md:pt-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}
                                        dy={10}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'white', opacity: 0.02 }}
                                        contentStyle={{
                                            borderRadius: '24px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
                                            backgroundColor: 'rgba(5,5,5,0.95)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '20px'
                                        }}
                                        itemStyle={{ color: '#F1F1F1', fontSize: '14px', fontWeight: 'bold' }}
                                        labelStyle={{ color: 'hsl(var(--primary))', marginBottom: '8px', fontWeight: '900', fontSize: '12px', letterSpacing: '2px' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={45}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={'hsl(var(--primary))'} opacity={0.3 + (index / chartData.length) * 0.7} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="font-display font-bold italic text-xl">Atividades Recentes</h4>
                                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 mt-1">Real-time performance feed</p>
                            </div>
                            <RefreshCw className="w-4 h-4 text-muted-foreground/20" />
                        </div>
                        <div className="flex flex-col items-center justify-center py-16 opacity-30">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-4 transition-all duration-700 group-hover:border-primary/20 group-hover:bg-primary/5">
                                <ShieldAlert className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                            </div>
                            <p className="text-[10px] font-bold tracking-widest uppercase">Nenhuma atividade recente registrada</p>
                        </div>
                        <Button variant="ghost" className="w-full h-12 border border-white/5 bg-white/5 text-[10px] font-bold tracking-widest uppercase hover:bg-white/10">
                            Ver todas as atividades
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
