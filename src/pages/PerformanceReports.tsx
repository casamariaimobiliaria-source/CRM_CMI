import React, { useMemo, useState } from 'react';
import { useLead } from '../contexts/LeadContext';
import { LeadStatus, LeadTemperature } from '../types';
import { useBrokers } from '../hooks/useBrokers';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Target, PieChart as PieIcon, Calendar, Filter, ChevronDown } from 'lucide-react';
import { format, subDays, isSameDay, startOfDay, isAfter } from 'date-fns';
import { cn } from '../lib/utils';

const PerformanceReports: React.FC = () => {
    const { leads } = useLead();
    const { brokers } = useBrokers();

    // States
    const [filterBroker, setFilterBroker] = useState('Todos');
    const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [tempFilter, setTempFilter] = useState<LeadTemperature | 'Todos'>('Todos');
    const [sourceFilter, setSourceFilter] = useState('Todos');

    const dateOptions = [
        { id: '7', label: '7 dias' },
        { id: '30', label: '30 dias' },
        { id: '90', label: '90 dias' },
        { id: 'all', label: 'Sempre' }
    ];

    const safeLeads = useMemo(() => {
        let result = Array.isArray(leads) ? leads : [];

        // Date Filter
        if (dateRange !== 'all') {
            const days = parseInt(dateRange);
            const cutoff = startOfDay(subDays(new Date(), days));
            result = result.filter(l => isAfter(new Date(l.createdAt), cutoff));
        }

        // Broker Filter
        if (filterBroker !== 'Todos') {
            result = result.filter(l => l.user_id === filterBroker);
        }

        // Temperature Filter
        if (tempFilter !== 'Todos') {
            result = result.filter(l => l.temperatura === tempFilter);
        }

        // Source Filter
        if (sourceFilter !== 'Todos') {
            result = result.filter(l => l.midia === sourceFilter);
        }

        return result;
    }, [leads, filterBroker, dateRange, tempFilter, sourceFilter]);

    // Unique Sources for Filter
    const uniqueSources = useMemo(() => {
        const sources = new Set<string>();
        leads.forEach(l => { if (l.midia) sources.add(l.midia); });
        return Array.from(sources);
    }, [leads]);

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

    // 2. Evolution (Leads over time)
    const evolutionData = useMemo(() => {
        const daysToMap = dateRange === 'all' ? 30 : parseInt(dateRange);
        const data = Array.from({ length: daysToMap }).map((_, i) => {
            const date = subDays(new Date(), (daysToMap - 1) - i);
            return {
                date: format(date, 'dd/MM'),
                fullDate: startOfDay(date),
                count: 0
            };
        });

        safeLeads.forEach(l => {
            const leadDate = startOfDay(new Date(l.createdAt));
            const daySlot = data.find(d => isSameDay(d.fullDate, leadDate));
            if (daySlot) daySlot.count++;
        });

        return data;
    }, [safeLeads, dateRange]);

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
        <div className="max-w-7xl mx-auto p-4 md:p-6 pb-32 space-y-6 md:space-y-8 animate-in fade-in duration-700">
            {/* Header section with refined design */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Performance Pro</h2>
                        <Badge variant="secondary" className="bg-slate-900 text-white border-0 font-black px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">Platinum</Badge>
                    </div>
                    <p className="text-muted-foreground font-medium text-sm">Inteligência de dados e análise de conversão.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Period Selector */}
                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-2xl border border-border/50">
                        {dateOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setDateRange(opt.id as any)}
                                className={cn(
                                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    dateRange === opt.id
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant={isFilterOpen ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="gap-2 rounded-2xl h-11 px-5 border-border/50 shadow-sm"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Filtrar</span>
                        <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isFilterOpen && "rotate-180")} />
                    </Button>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-muted/20 border border-border/30 rounded-3xl shadow-inner mb-2">
                            {/* Broker Selection */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-2">Corretor</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <select
                                        className="w-full h-12 pl-11 pr-4 bg-white border border-border/50 rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                                        value={filterBroker}
                                        onChange={(e) => setFilterBroker(e.target.value)}
                                    >
                                        <option value="Todos">Todos os Corretores</option>
                                        {brokers.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            {/* Temperature Select */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-2">Qualidade</label>
                                <div className="flex gap-2">
                                    {(['Todos', LeadTemperature.FRIO, LeadTemperature.MORNO, LeadTemperature.QUENTE] as string[]).map(temp => (
                                        <button
                                            key={temp}
                                            onClick={() => setTempFilter(temp as any)}
                                            className={cn(
                                                "flex-1 h-12 rounded-2xl text-[10px] font-black uppercase transition-all border",
                                                tempFilter === temp
                                                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                                                    : "bg-white border-border/50 text-muted-foreground hover:border-primary/30"
                                            )}
                                        >
                                            {temp}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Source Select */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-2">Origem</label>
                                <div className="relative group">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <select
                                        className="w-full h-12 pl-11 pr-4 bg-white border border-border/50 rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                                        value={sourceFilter}
                                        onChange={(e) => setSourceFilter(e.target.value)}
                                    >
                                        <option value="Todos">Todos os Canais</option>
                                        {uniqueSources.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <Card className="lg:col-span-2 border-0 shadow-xl bg-white rounded-3xl overflow-hidden group">
                    <CardHeader className="md:pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <Target className="w-5 h-5" />
                                </div>
                                Conversão por Etapa
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-muted-foreground tracking-tighter uppercase">Tempo Real</span>
                            </div>
                        </div>
                        <CardDescription>Fluxo detalhado de leads no funil de vendas.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px] md:h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 60, top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" opacity={0.6} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={120}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 800, textAnchor: 'start' }}
                                    dx={-110}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--primary)/0.03)' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={44}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden group">
                    <CardHeader className="md:pb-2">
                        <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                                <PieIcon className="w-5 h-5" />
                            </div>
                            Mix de Origens
                        </CardTitle>
                        <CardDescription>Participação por canal de mídia.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px] md:h-[380px] flex flex-col justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mediaData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {mediaData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={80}
                                    iconType="circle"
                                    formatter={(value: string) => <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-6">
                        <div>
                            <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                Crescimento da Base
                            </CardTitle>
                            <CardDescription>Taxa de entrada de novos leads no período selecionado.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px] p-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.4} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 800 }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PerformanceReports;
