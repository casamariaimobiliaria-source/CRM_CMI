import React, { useMemo } from 'react';
import { useLead } from '../contexts/LeadContext';
import { useBrokers } from '../hooks/useBrokers';
import { LeadStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, RefreshCw, ShieldAlert, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const Dashboard: React.FC = () => {
    const { leads } = useLead();
    const { brokers } = useBrokers();
    const navigate = useNavigate();

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
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center py-20 text-center p-4 h-full"
            >
                <Helmet>
                    <title>Painel | ImobLeads</title>
                </Helmet>
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground/40 mb-6 border border-white/5">
                    <TrendingUp className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">Waiting for Intelligence</h3>
                <p className="text-muted-foreground text-sm max-w-xs mt-2 font-medium">Add your first exclusive leads to start the performance analytics engine.</p>
                <Button variant="luxury" className="mt-8 px-10 rounded-full" onClick={() => navigate('/add')}>START NOW</Button>
            </motion.div>
        );
    }

    return (
        <div className="px-6 md:px-10 py-8 md:py-12 pb-32 space-y-12 max-w-7xl mx-auto w-full">
            <Helmet>
                <title>Painel de Inteligência | ImobLeads</title>
            </Helmet>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-10"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight italic">
                        O Painel
                    </h1>
                    <p className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mt-2">
                        Performance & Inteligência
                    </p>
                </div>
                <Button
                    variant="luxury"
                    className="h-12 px-8 rounded-full"
                    onClick={() => navigate('/reports')}
                >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    RELATÓRIOS COMPLETOS
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'TOTAL DE LEADS', value: stats.total, icon: Users, color: 'text-primary' },
                    { label: 'NEGÓCIOS ATIVOS', value: stats.active, icon: RefreshCw, color: 'text-secondary' },
                    { label: 'POTENCIAIS ELITE', value: stats.hot, icon: ShieldAlert, color: 'text-destructive' },
                    { label: 'CONVERSÃO', value: `${stats.conversion}%`, icon: BarChart3, color: 'text-primary' }
                ].map((stat, i) => (
                    <StatCard
                        key={stat.label}
                        index={i}
                        label={stat.label}
                        value={stat.value}
                        colorClass={stat.color}
                        icon={<stat.icon className="w-5 h-5 opacity-40" />}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-card/40 backdrop-blur-sm border border-white/5 hover:border-primary/20 transition-all duration-700">
                        <CardHeader>
                            <CardTitle className="text-xl font-display italic">Lead Pipeline</CardTitle>
                            <CardDescription className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/60">Distribution by status</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9, fontWeight: 600, letterSpacing: 1 }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'white', opacity: 0.03 }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                            backgroundColor: '#0A0A0A',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: '#F1F1F1', fontSize: '12px', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#D4AF37', marginBottom: '4px', fontWeight: '800' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={30}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={'hsl(var(--primary))'} opacity={0.5 + (index / chartData.length) * 0.5} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="bg-card/40 backdrop-blur-sm border border-white/5 hover:border-primary/20 transition-all duration-700">
                        <CardHeader>
                            <CardTitle className="text-xl font-display italic">Temperature</CardTitle>
                            <CardDescription className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/60">Prospect Quality</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-10 py-6">
                            {['Frio', 'Morno', 'Quente'].map(temp => {
                                const count = safeLeads.filter(l => l.temperatura === temp).length;
                                const percentage = safeLeads.length > 0 ? (count / safeLeads.length) * 100 : 0;
                                const color = temp === 'Frio' ? 'bg-platinum-400' : temp === 'Morno' ? 'bg-secondary' : 'bg-primary';
                                return (
                                    <div key={temp}>
                                        <div className="flex justify-between mb-4 items-end">
                                            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest opacity-60">{temp}</span>
                                            <span className="text-[9px] font-luxury italic text-muted-foreground uppercase">{count} LEADS / {percentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1.5, ease: 'circOut' }}
                                                className={`h-full rounded-full ${color} shadow-lg`}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card className="bg-card/40 backdrop-blur-sm border border-white/5 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
                        <div>
                            <CardTitle className="text-xl font-display italic">Elite Projects</CardTitle>
                            <CardDescription className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/60">Top 10 performing properties</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-96 pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectData} layout="vertical" margin={{ left: 20, right: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={120}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'white', opacity: 0.03 }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0A0A0A' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                    {projectData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={'hsl(var(--primary))'} opacity={0.8 - (index * 0.05)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {brokerStats.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Card className="bg-card/40 backdrop-blur-sm border border-white/5 overflow-hidden">
                        <CardHeader className="border-b border-white/5 pb-6">
                            <CardTitle className="text-xl font-display italic">Executive Team</CardTitle>
                            <CardDescription className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/60">Broker performance benchmarks</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 px-0">
                            <div className="overflow-x-auto px-6">
                                <table className="w-full text-sm font-medium">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] py-4">Executive</th>
                                            <th className="text-right font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] py-4">Portfolio</th>
                                            <th className="text-right font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] py-4">Closes</th>
                                            <th className="text-right font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] py-4">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {brokerStats.map((stat) => (
                                            <tr key={stat.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="py-5 font-display font-bold text-foreground italic">{stat.name}</td>
                                                <td className="py-5 text-right font-mono text-[11px]">{stat.total} units</td>
                                                <td className="py-5 text-right text-primary font-bold">{stat.comprou}</td>
                                                <td className="py-5 text-right font-mono text-[11px]">
                                                    {stat.conversion}%
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
