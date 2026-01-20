import React, { useMemo } from 'react';
import { useLead } from '../contexts/LeadContext';
import { LeadStatus } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, PieChart as PieIcon, Calendar, Filter, Rocket } from 'lucide-react';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';

const PerformanceReports: React.FC = () => {
    const { leads, userProfile } = useLead();
    const isPro = userProfile?.organization?.plan_tier !== 'free';

    const safeLeads = useMemo(() => Array.isArray(leads) ? leads : [], [leads]);

    // 1. Media ROI (Leads by Source)
    const mediaData = useMemo(() => {
        const counts: Record<string, number> = {};
        safeLeads.forEach(l => {
            const source = l.midia || 'Não Informado';
            counts[source] = (counts[source] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [safeLeads]);

    // 2. Evolution (Leads over time - Last 30 days)
    const evolutionData = useMemo(() => {
        const last30Days = Array.from({ length: 30 }).map((_, i) => {
            const date = subDays(new Date(), 29 - i);
            return {
                date: format(date, 'dd/MM'),
                fullDate: startOfDay(date),
                count: 0
            };
        });

        safeLeads.forEach(l => {
            const leadDate = startOfDay(new Date(l.createdAt));
            const daySlot = last30Days.find(d => isSameDay(d.fullDate, leadDate));
            if (daySlot) daySlot.count++;
        });

        return last30Days;
    }, [safeLeads]);

    // 3. Conversion Funnel (Detailed Status)
    const funnelData = useMemo(() => {
        const stages = [
            { name: 'Total Leads', value: safeLeads.length, color: 'hsl(var(--primary))' },
            { name: 'Em Atendimento', value: safeLeads.filter(l => l.status !== LeadStatus.PERDIDO).length, color: '#6366f1' },
            { name: 'Interessados', value: safeLeads.filter(l => [LeadStatus.ATIVO, LeadStatus.AGENDOU, LeadStatus.COMPROU].includes(l.status)).length, color: '#8b5cf6' },
            { name: 'Vendas', value: safeLeads.filter(l => l.status === LeadStatus.COMPROU).length, color: '#10b981' }
        ];
        return stages;
    }, [safeLeads]);

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

    return (
        <div className="max-w-7xl mx-auto p-6 pb-32 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Relatórios de Performance</h2>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-black">PRO</Badge>
                    </div>
                    <p className="text-muted-foreground font-medium">Análise detalhada de conversão e origens de leads.</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Últimos 30 dias
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filtrar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Funnel Chart (Bar Chart styled as funnel) */}
                <Card className="lg:col-span-2 border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Funil de Vendas Detalhado
                        </CardTitle>
                        <CardDescription>Taxa de conversão entre as etapas do processo.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={120}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 2. Media ROI (Pie Chart) */}
                <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieIcon className="w-5 h-5 text-amber-500" />
                            Origem dos Leads
                        </CardTitle>
                        <CardDescription>Quais canais trazem mais volume.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mediaData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {mediaData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 3. Evolution Chart (Area Chart) */}
                <Card className="lg:col-span-3 border-0 shadow-lg bg-white/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                Evolução de Captação
                            </CardTitle>
                            <CardDescription>Volume de novos leads nos últimos 30 dias.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-64 px-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {!isPro && (
                <div className="p-8 bg-slate-900 rounded-3xl text-white flex flex-col items-center text-center space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -ml-32 -mb-32" />

                    <Rocket className="w-12 h-12 text-primary" />
                    <div className="max-w-lg">
                        <h3 className="text-2xl font-black mb-2">Desbloqueie Todo o Potencial</h3>
                        <p className="text-slate-400 font-medium">Você está visualizando uma prévia dos relatórios avançados. Faça upgrade para o plano PRO e tenha acesso a filtros personalizados, exportação completa e inteligência de dados.</p>
                    </div>
                    <Button variant="primary" className="bg-white text-slate-900 hover:bg-slate-100 font-black px-8 h-12 rounded-xl">
                        Conhecer Planos
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PerformanceReports;
