import React, { useMemo } from 'react';
import { useLead } from '../contexts/LeadContext';
import { useBrokers } from '../hooks/useBrokers';
import { LeadStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import StatCard from '../components/StatCard';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
    const { leads } = useLead();
    const { brokers } = useBrokers();

    const safeLeads = useMemo(() => Array.isArray(leads) ? leads.filter(l => l && typeof l === 'object') : [], [leads]);

    const stats = useMemo(() => {
        const total = safeLeads.length;
        const active = safeLeads.filter(l => l.status === LeadStatus.ATIVO).length;
        const hot = safeLeads.filter(l => l.temperatura === 'Quente').length;
        const comprouCount = safeLeads.filter(l => l.status === LeadStatus.COMPROU).length;
        const conversion = total > 0 ? ((comprouCount / total) * 100).toFixed(1) : "0";

        return { total, active, hot, conversion };
    }, [safeLeads]);

    const chartData = useMemo(() => {
        if (safeLeads.length === 0) return [];
        const statusCounts: Record<string, number> = {};
        Object.values(LeadStatus).forEach(s => statusCounts[s] = 0);
        safeLeads.forEach(l => { if (l.status) statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });
        return Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] })).filter(item => item.value > 0);
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
            .slice(0, 10); // Show top 10 projects
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

    // Use CSS variables for chart colors to support dark mode naturally
    const CHART_COLORS = [
        'hsl(var(--primary))',
        'hsl(var(--secondary))',
        '#10b981', // emerald
        '#f59e0b', // amber
        '#ef4444', // rose
    ];

    if (safeLeads.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center py-20 text-center p-4"
            >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="text-lg font-black text-foreground">Sem dados para análise</h3>
                <p className="text-muted-foreground text-sm max-w-xs mt-2 font-medium">Cadastre seus primeiros leads para visualizar as estatísticas de desempenho.</p>
            </motion.div>
        );
    }

    return (
        <div className="p-6 pb-32 space-y-8 max-w-7xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
            >
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-sm font-medium">Visão geral do seu desempenho comercial.</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    index={0}
                    label="Leads na Base"
                    value={stats.total}
                    colorClass="text-primary"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857"></path></svg>}
                />
                <StatCard
                    index={1}
                    label="Em Negociação"
                    value={stats.active}
                    colorClass="text-emerald-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                <StatCard
                    index={2}
                    label="Altas Chances"
                    value={stats.hot}
                    colorClass="text-rose-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                />
                <StatCard
                    index={3}
                    label="Conversão"
                    value={`${stats.conversion}%`}
                    colorClass="text-secondary"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="col-span-1 shadow-sm border-border overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl">Status do Pipeline</CardTitle>
                            <CardDescription>Distribuição por etapa do funil.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="col-span-1 shadow-sm border-border">
                        <CardHeader>
                            <CardTitle className="text-xl">Análise Térmica</CardTitle>
                            <CardDescription>Qualidade dos leads.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {['Frio', 'Morno', 'Quente'].map(temp => {
                                const count = safeLeads.filter(l => l.temperatura === temp).length;
                                const percentage = safeLeads.length > 0 ? (count / safeLeads.length) * 100 : 0;
                                const color = temp === 'Frio' ? 'bg-blue-500' : temp === 'Morno' ? 'bg-orange-500' : 'bg-rose-500';
                                return (
                                    <div key={temp}>
                                        <div className="flex justify-between mb-3 items-end">
                                            <span className="text-xs font-black text-foreground uppercase tracking-widest">{temp}</span>
                                            <span className="text-xs font-bold text-muted-foreground uppercase">{count} leads ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-secondary/10 rounded-full h-3 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-3 rounded-full shadow-sm ${color}`}
                                            ></motion.div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
            >
                <Card className="shadow-sm border-border overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl">Leads por Empreendimento</CardTitle>
                        <CardDescription>Top 10 projetos por volume de leads.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" opacity={0.5} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={120}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                                    {projectData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {brokerStats.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <Card className="shadow-sm border-border overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl">Desempenho da Equipe</CardTitle>
                            <CardDescription>Performance por corretor.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm font-medium">
                                    <thead>
                                        <tr className="border-b border-border/50">
                                            <th className="text-left font-black text-xs text-muted-foreground uppercase tracking-widest py-3 px-2">Corretor</th>
                                            <th className="text-right font-black text-xs text-muted-foreground uppercase tracking-widest py-3 px-2">Leads</th>
                                            <th className="text-right font-black text-xs text-muted-foreground uppercase tracking-widest py-3 px-2">Vendas</th>
                                            <th className="text-right font-black text-xs text-muted-foreground uppercase tracking-widest py-3 px-2">Conversão</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {brokerStats.map((stat, i) => (
                                            <tr key={stat.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="py-3 px-2 font-bold text-foreground">{stat.name}</td>
                                                <td className="py-3 px-2 text-right">{stat.total}</td>
                                                <td className="py-3 px-2 text-right text-emerald-600 font-bold">{stat.comprou}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${stat.conversion > 5 ? 'bg-emerald-500/10 text-emerald-600' :
                                                            stat.conversion > 2 ? 'bg-amber-500/10 text-amber-600' :
                                                                'bg-red-500/10 text-red-600'
                                                        }`}>
                                                        {stat.conversion}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;
