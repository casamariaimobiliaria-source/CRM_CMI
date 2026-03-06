import React, { useMemo } from 'react';
import { useLead } from '../contexts/LeadContext';
import { LeadStatus } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    AreaChart, Area, PieChart, Pie, Label
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, Home, Users,
    FileText, Calendar, DollarSign, Plus, ArrowUpRight,
    ArrowDownRight, Building2, Landmark, Store, Activity,
    Pencil
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { cn } from '../lib/utils';

const Dashboard: React.FC = () => {
    const { leads } = useLead();
    const navigate = useNavigate();

    const safeLeads = useMemo(() => Array.isArray(leads) ? leads : [], [leads]);

    const leadsInService = useMemo(() => {
        return safeLeads.filter(l => ['atendimento', 'visita', 'proposta', 'negociacao'].includes(l.status)).length;
    }, [safeLeads]);

    // Calcular Vendas Reais
    const salesLeads = useMemo(() => {
        return safeLeads.filter(l => l.status === LeadStatus.COMPROU);
    }, [safeLeads]);

    // Dados para o Donut de Faturamento (VGV)
    const revenueData = useMemo(() => {
        const categories = {
            'Apartamentos': 0,
            'Casas': 0,
            'Terrenos': 0,
            'Comercial': 0
        };

        salesLeads.forEach(lead => {
            const category = lead.empreendimento?.toLowerCase().includes('casa') ? 'Casas' :
                lead.empreendimento?.toLowerCase().includes('terreno') ? 'Terrenos' :
                    lead.empreendimento?.toLowerCase().includes('sala') ? 'Comercial' : 'Apartamentos';
            categories[category as keyof typeof categories] += lead.valor || 0;
        });

        return [
            { name: 'Apartamentos', value: categories.Apartamentos, color: '#60a5fa' },
            { name: 'Casas', value: categories.Casas, color: '#f472b6' },
            { name: 'Terrenos', value: categories.Terrenos, color: '#fbbf24' },
            { name: 'Comercial', value: categories.Comercial, color: '#a78bfa' },
        ];
    }, [salesLeads]);

    const totalVGV = useMemo(() => {
        return salesLeads.reduce((sum, lead) => sum + (lead.valor || 0), 0);
    }, [salesLeads]);

    // Visitas Reais (Baseado no status Agendou)
    const scheduledVisits = useMemo(() => safeLeads.filter(l => l.status === LeadStatus.AGENDOU).length, [safeLeads]);

    const visitsData = [
        { day: 'Hoje', count: scheduledVisits },
        { day: 'Amanhã', count: 0 },
        { day: 'Próx', count: 0 },
    ];

    // Vendas Mensais Reais
    const salesTrendData = useMemo(() => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const currentMonthIdx = new Date().getMonth();
        const trend = months.slice(Math.max(0, currentMonthIdx - 5), currentMonthIdx + 1).map(month => ({
            month,
            value: 0
        }));

        salesLeads.forEach(lead => {
            if (lead.data_compra) {
                const date = new Date(lead.data_compra);
                const leadMonth = months[date.getMonth()];
                const dataPoint = trend.find(d => d.month === leadMonth);
                if (dataPoint) dataPoint.value += 1;
            }
        });

        return trend.length > 0 ? trend : [{ month: months[currentMonthIdx], value: 0 }];
    }, [salesLeads]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 1,
            notation: value > 1000000 ? 'compact' : 'standard'
        }).format(value);
    };

    return (
        <div className="space-y-8 pb-20">
            <Helmet>
                <title>Dashboard | Casa Maria Imóveis</title>
            </Helmet>

            {/* Top Row: 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Expected Revenue Donut */}
                <Card className="bg-[#252836] border-none p-6 rounded-[12px] shadow-modern min-h-[300px] flex flex-col justify-between card-hover">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[#8b8fa3] text-sm font-medium">Faturamento Total (VGV)</p>
                            <h2 className="text-3xl font-bold text-white mt-1">{formatCurrency(totalVGV)}</h2>
                        </div>
                        <div className="flex items-center text-green-400 text-xs font-bold gap-1 bg-green-400/10 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            {totalVGV > 0 ? 'Atualizado' : '0%'}
                        </div>
                    </div>
                    <div className="h-[180px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={revenueData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {revenueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                    <Label
                                        value="VGV"
                                        position="center"
                                        fill="#8b8fa3"
                                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#252836', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Scheduled Visits Bar */}
                <Card className="bg-[#252836] border-none p-6 rounded-[12px] shadow-modern min-h-[300px] flex flex-col justify-between card-hover">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[#8b8fa3] text-sm font-medium">Visitas Agendadas</p>
                            <h2 className="text-3xl font-bold text-white mt-1">{scheduledVisits}</h2>
                        </div>
                        <div className="flex items-center text-muted-foreground text-xs font-bold gap-1 bg-white/5 px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3" />
                            Hoje
                        </div>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={visitsData}>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8b8fa3', fontSize: 10 }}
                                />
                                <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={20} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ display: 'none' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Sales Monthly Line */}
                <Card className="bg-[#252836] border-none p-6 rounded-[12px] shadow-modern min-h-[300px] flex flex-col justify-between card-hover">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[#8b8fa3] text-sm font-medium">Vendas Realizadas</p>
                            <h2 className="text-3xl font-bold text-white mt-1">{salesLeads.length}</h2>
                        </div>
                        <div className="flex items-center text-green-400 text-xs font-bold gap-1 bg-green-400/10 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            Histórico
                        </div>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrendData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#f472b6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                                <Tooltip contentStyle={{ display: 'none' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Middle Row: 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#252836] border-none p-6 rounded-[12px] shadow-modern card-hover">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-cyan-400/10 rounded-xl">
                                <FileText className="w-6 h-6 text-cyan-400" />
                            </div>
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-400/5 px-2 py-1 rounded">Taxa de Conversão</span>
                        </div>
                        <p className="text-[#8b8fa3] text-sm font-medium">Contratos Assinados</p>
                        <h2 className="text-3xl font-bold text-white mt-1 mb-4">{salesLeads.length}</h2>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.min(100, (salesLeads.length / (safeLeads.length || 1)) * 100)}%` }} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#252836] border-none p-6 rounded-[12px] shadow-modern card-hover">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-purple-400/10 rounded-xl">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-[#252836] bg-[#1a1d2e] flex items-center justify-center text-[10px] font-bold text-muted-foreground">{safeLeads.length}</div>
                            </div>
                        </div>
                        <p className="text-[#8b8fa3] text-sm font-medium">Total de Leads</p>
                        <h2 className="text-3xl font-bold text-white mt-1 mb-2">{safeLeads.length}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                            <ArrowUpRight className="w-4 h-4 opacity-30" />
                            <span>Contatos na Base</span>
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#252836] border-none p-6 rounded-[12px] shadow-modern card-hover">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-cyan-400/10 rounded-xl">
                                <Activity className="w-6 h-6 text-cyan-400" />
                            </div>
                            <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-[#8b8fa3] text-sm font-medium">Leads em Atendimento</p>
                        <h2 className="text-3xl font-bold text-white mt-1 mb-4">{leadsInService}</h2>
                        <div className="h-8 w-full flex items-end gap-1">
                            {[40, 60, 45, 70, 50, 80, 60, 90, 75, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-cyan-400/20 rounded-t-sm" style={{ height: `${(leadsInService / (safeLeads.length || 1) * 100) || 5}%` }} />
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bottom Row: Recent Sales Table */}
            <Card className="bg-[#252836] border-none rounded-[12px] shadow-modern overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Últimas Vendas/Contratos</h3>
                        <p className="text-sm text-[#8b8fa3] mt-1">Monitoramento em tempo real de negociações concluídas</p>
                    </div>
                    <div className="flex bg-[#1a1d2e] p-1 rounded-xl">
                        {[
                            { label: 'Apartamentos', icon: Building2, color: 'text-cyan-400' },
                            { label: 'Casas', icon: Home, color: 'text-pink-400' },
                            { label: 'Terrenos', icon: Landmark, color: 'text-yellow-400' },
                            { label: 'Comercial', icon: Store, color: 'text-purple-400' }
                        ].map(type => (
                            <button key={type.label} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-white transition-all">
                                <type.icon className={cn("w-4 h-4", type.color)} />
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/2 text-[#8b8fa3] text-[10px] uppercase font-bold tracking-widest">
                                <th className="px-8 py-4">Lead / Empreendimento</th>
                                <th className="px-8 py-4">Data</th>
                                <th className="px-8 py-4">Valor</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {salesLeads.length > 0 ? (
                                salesLeads.slice(0, 5).map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                                        onClick={() => navigate(`/edit/${lead.id}`)}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-400/10 flex items-center justify-center">
                                                    <DollarSign className="w-5 h-5 text-green-400" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-white block">{lead.nome}</span>
                                                    <span className="text-[10px] text-[#8b8fa3] uppercase tracking-wider">{lead.empreendimento || 'Geral'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs text-[#8b8fa3] font-medium">
                                                {lead.data_compra ? new Date(lead.data_compra).toLocaleDateString('pt-BR') : 'Recente'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-bold text-white">{formatCurrency(lead.valor || 0)}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="status-badge bg-green-400/10 text-green-400 border border-green-400/20">Vendido</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white opacity-0 group-hover:opacity-100 transition-all">
                                                <Pencil className="w-4 h-4 text-[#8b8fa3]" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="hover:bg-white/5 transition-colors group">
                                    <td colSpan={4} className="px-8 py-10 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <Building2 className="w-8 h-8 text-muted-foreground" />
                                            <span className="text-sm font-medium">Nenhuma venda ou contrato registrado ainda</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
