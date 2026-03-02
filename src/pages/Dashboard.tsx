import React, { useMemo, useState } from 'react';
import { useLead } from '../contexts/LeadContext';
import { useUser } from '../contexts/UserContext';
import { useBrokers } from '../hooks/useBrokers';
import { LeadStatus, LeadTemperature } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, RefreshCw, ShieldAlert, TrendingUp, Target, DollarSign, Award, Calendar } from 'lucide-react';
import StatCard from '../components/StatCard';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { cn } from '../lib/utils';
import { ExecutiveAIInsight } from '../components/ExecutiveAIInsight';
import { Lead } from '../types';

type TopBrokerPeriod = 'month' | 'quarter' | 'semester' | 'year';

const Dashboard: React.FC = () => {
    const { leads } = useLead();
    const { userProfile } = useUser();
    const { brokers } = useBrokers();
    const navigate = useNavigate();

    const [topBrokersPeriod, setTopBrokersPeriod] = useState<TopBrokerPeriod>('month');

    const safeLeads = useMemo(() => Array.isArray(leads) ? leads.filter(l => l && typeof l === 'object') : [], [leads]);

    const stats = useMemo(() => {
        const total = safeLeads.length;
        const active = safeLeads.filter(l => l.status === LeadStatus.ATIVO).length;
        const hot = safeLeads.filter(l => l.temperatura === LeadTemperature.QUENTE).length;

        const salesLeads = safeLeads.filter(l => l.status === LeadStatus.COMPROU);
        const comprouCount = salesLeads.length;
        const conversion = total > 0 ? ((comprouCount / total) * 100).toFixed(1) : "0";

        const totalSalesValue = salesLeads.reduce((acc, lead) => acc + (Number(lead.valor) || 0), 0);

        return { total, active, hot, conversion, totalSalesValue };
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

    const salesOverTimeData = useMemo(() => {
        const salesLeads = safeLeads.filter(l => l.status === LeadStatus.COMPROU);
        if (salesLeads.length === 0) return [];

        const groupedSales: Record<string, number> = {};

        salesLeads.forEach(lead => {
            const dateStr = lead.data_compra || lead.createdAt;
            if (!dateStr) return;
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return;

            const monthYear = `${date.toLocaleString('pt-BR', { month: 'short' })} ${date.getFullYear()}`;
            groupedSales[monthYear] = (groupedSales[monthYear] || 0) + (Number(lead.valor) || 0);
        });

        // Sort chronologically (assuming keys represent chronological order well enough for recent data, better to sort by actual date)
        const sortedData = Object.entries(groupedSales).map(([name, value]) => {
            const [month, year] = name.split(' ');
            const monthIndex = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(month.replace('.', '').toLowerCase());
            return { name, value, dateVal: new Date(Number(year), monthIndex, 1).getTime() };
        }).sort((a, b) => a.dateVal - b.dateVal);

        return sortedData.map(({ name, value }) => ({ name, value }));

    }, [safeLeads]);

    const topBrokersData = useMemo(() => {
        if (!brokers || brokers.length === 0) return [];
        const now = new Date();

        let startDate = new Date();
        switch (topBrokersPeriod) {
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'semester':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }

        const brokerSales = brokers.map(broker => {
            const brokerSalesLeads = safeLeads.filter(l => {
                const isBrokerMatch = l.user_id === broker.id || (l.corretor && l.corretor.toLowerCase() === broker.name.toLowerCase());
                const isSale = l.status === LeadStatus.COMPROU;
                if (!isBrokerMatch || !isSale) return false;

                const saleDate = new Date(l.data_compra || l.createdAt);
                return saleDate >= startDate && saleDate <= now;
            });

            const totalValue = brokerSalesLeads.reduce((sum, lead) => sum + (Number(lead.valor) || 0), 0);

            return {
                id: broker.id,
                name: broker.name,
                salesCount: brokerSalesLeads.length,
                totalValue
            };
        });

        return brokerSales
            .filter(b => b.totalValue > 0)
            .sort((a, b) => b.totalValue - a.totalValue)
            .slice(0, 5);

    }, [safeLeads, brokers, topBrokersPeriod]);

    const brokerStats = useMemo(() => {
        if (!brokers || brokers.length === 0) return [];

        return brokers.map(broker => {
            const brokerLeads = safeLeads.filter(l => l.user_id === broker.id || (l.corretor && l.corretor.toLowerCase() === broker.name.toLowerCase()));
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

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
                    { label: 'Vendas Totais', value: formatCurrency(stats.totalSalesValue), icon: DollarSign, color: 'text-emerald-400' },
                    { label: 'Total de Leads', value: stats.total, icon: TrendingUp, color: 'text-primary' },
                    { label: 'Conversão', value: `${stats.conversion}%`, icon: BarChart3, color: 'text-sky-400' },
                    { label: 'Negócios Ativos', value: stats.active, icon: RefreshCw, color: 'text-purple-400' },
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

                    {/* Top 5 Brokers Card */}
                    <Card className="p-8 space-y-6 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Award className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 mb-1">Top Performance</h4>
                                    <h3 className="font-display font-bold text-xl italic">Ranking 5+</h3>
                                </div>

                                <select
                                    className="bg-white/5 border border-white/10 rounded-lg text-xs p-1 text-muted-foreground font-medium focus:ring-1 focus:ring-primary outline-none"
                                    value={topBrokersPeriod}
                                    onChange={(e) => setTopBrokersPeriod(e.target.value as TopBrokerPeriod)}
                                >
                                    <option value="month">Mês</option>
                                    <option value="quarter">Trimestre</option>
                                    <option value="semester">Semestre</option>
                                    <option value="year">Anual</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                {topBrokersData.length > 0 ? (
                                    topBrokersData.map((broker, i) => (
                                        <div key={broker.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                                    i === 0 ? "bg-amber-500/20 text-amber-500" :
                                                        i === 1 ? "bg-slate-300/20 text-slate-300" :
                                                            i === 2 ? "bg-orange-700/20 text-orange-400" :
                                                                "bg-white/5 text-muted-foreground"
                                                )}>
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{broker.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{broker.salesCount} vendas</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-sm font-bold text-emerald-400">{formatCurrency(broker.totalValue)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold">Nenhuma venda registrada<br />neste período</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

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
                                {['Ativos', 'Mornos', 'Inativos'].map((status, i) => {
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
                    </Card>
                </div>

                {/* Main Visualizations */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Sales Over Time Area Chart */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-8">
                            <div>
                                <CardTitle className="text-2xl font-display italic tracking-tight">Evolução de Vendas</CardTitle>
                                <CardDescription className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 mt-1">Volume de Vendas (Mês/Ano)</CardDescription>
                            </div>
                            <div className="flex gap-2 bg-white/5 p-2 rounded-lg">
                                <Calendar className="w-4 h-4 text-primary/60" />
                            </div>
                        </CardHeader>
                        <CardContent className="h-[300px] pt-6 md:pt-10">
                            {salesOverTimeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesOverTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            hide
                                        />
                                        <Tooltip
                                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                backgroundColor: 'rgba(5,5,5,0.95)',
                                                backdropFilter: 'blur(10px)',
                                                padding: '16px'
                                            }}
                                            formatter={(value: number) => [formatCurrency(value), 'Total Vendas']}
                                            labelStyle={{ color: 'hsl(var(--primary))', marginBottom: '8px', fontWeight: '900', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                            activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: '#000', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-40">
                                    <p className="text-xs uppercase tracking-widest font-bold font-mono">Dados Insuficientes</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

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
                        <CardContent className="h-[300px] pt-6 md:pt-10">
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

                </div>
            </div>
        </div>
    );
};

export default Dashboard;

