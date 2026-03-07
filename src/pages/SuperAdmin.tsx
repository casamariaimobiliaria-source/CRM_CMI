import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import {
    Users,
    Building2,
    ShieldCheck,
    Plus,
    Search,
    Eye,
    TrendingUp,
    ShieldAlert,
    X,
    CheckCircle2,
    Pencil,
    Trash2,
    Ban,
    ChevronRight,
    Lock,
    Unlock,
    AlertTriangle,
    Link as LinkIcon
} from 'lucide-react';

interface Organization {
    id: string;
    name: string;
    slug: string;
    plan_tier: 'free' | 'pro' | 'enterprise';
    subscription_status: string;
    leads_limit: number;
    created_at: string;
    _count?: {
        leads: number;
        members: number;
    }
}

const SuperAdmin: React.FC = () => {
    const { userProfile, setImpersonatedOrg, impersonatedOrgId } = useUser();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalLeads: 0, totalUsers: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isCreating, setIsCreating] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);

    // Form States
    const [newOrg, setNewOrg] = useState({ name: '', slug: '', plan_tier: 'free' as const, leads_limit: 100 });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (userProfile?.is_super_admin) {
            fetchData();
        }
    }, [userProfile]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: orgs, error: orgsError } = await supabase
                .from('organizations')
                .select('*')
                .order('created_at', { ascending: false });

            if (orgsError) throw orgsError;

            const fullOrgs = await Promise.all((orgs || []).map(async (org) => {
                const [leadsCount, membersCount] = await Promise.all([
                    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
                    supabase.from('organization_members').select('*', { count: 'exact', head: true }).eq('organization_id', org.id)
                ]);
                return {
                    ...org,
                    _count: {
                        leads: leadsCount.count || 0,
                        members: membersCount.count || 0
                    }
                };
            }));

            setOrganizations(fullOrgs);

            const [leadsTotal, usersTotal] = await Promise.all([
                supabase.from('leads').select('*', { count: 'exact', head: true }),
                supabase.from('users').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                totalLeads: leadsTotal.count || 0,
                totalUsers: usersTotal.count || 0
            });
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Erro ao carregar dados do Super Admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('organizations')
                .insert([{
                    name: newOrg.name,
                    slug: newOrg.slug.toLowerCase().replace(/\s+/g, '-'),
                    plan_tier: newOrg.plan_tier,
                    leads_limit: newOrg.leads_limit,
                    subscription_status: 'active'
                }]);

            if (error) throw error;

            toast.success('Organização criada com sucesso!');
            setIsCreating(false);
            setNewOrg({ name: '', slug: '', plan_tier: 'free', leads_limit: 100 });
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao criar organização.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrg) return;
        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('organizations')
                .update({
                    name: editingOrg.name,
                    slug: editingOrg.slug.toLowerCase().replace(/\s+/g, '-'),
                    plan_tier: editingOrg.plan_tier,
                    leads_limit: editingOrg.leads_limit,
                    subscription_status: editingOrg.subscription_status
                })
                .eq('id', editingOrg.id);

            if (error) throw error;

            toast.success('Organização atualizada com sucesso!');
            setEditingOrg(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar organização.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggleStatus = async (org: Organization) => {
        const newStatus = org.subscription_status === 'active' ? 'inactive' : 'active';
        try {
            const { error } = await supabase
                .from('organizations')
                .update({ subscription_status: newStatus })
                .eq('id', org.id);

            if (error) throw error;

            toast.success(`Organização ${newStatus === 'active' ? 'desbloqueada' : 'bloqueada'} com sucesso!`);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao alterar status.');
        }
    };

    const handleCopyInviteLink = (slug: string) => {
        const url = `${window.location.origin}/register?org=${slug}`;
        navigator.clipboard.writeText(url);
        toast.success('Link de convite copiado para a área de transferência!', {
            description: 'Envie este link para o dono da imobiliária via WhatsApp ou E-mail.'
        });
    };

    const handleDeleteOrg = async () => {
        if (!orgToDelete) return;
        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('organizations')
                .delete()
                .eq('id', orgToDelete.id);

            if (error) throw error;

            toast.success('Organização excluída permanentemente.');
            setOrgToDelete(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao excluir organização.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!userProfile?.is_super_admin) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <ShieldAlert className="w-16 h-16 text-destructive opacity-20" />
                <h2 className="text-xl font-bold italic font-display">Acesso Restrito</h2>
                <p className="text-muted-foreground text-sm">Esta área é exclusiva para a administração do sistema.</p>
            </div>
        );
    }

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-6 pb-32 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-x-hidden">
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white italic tracking-tighter flex items-center gap-3">
                        <ShieldCheck className="w-10 h-10 text-primary" />
                        Super Admin Dashboard
                    </h1>
                    <p className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase flex items-center gap-3">
                        <span className="h-[1px] w-8 bg-primary/30" />
                        Gestão de Instâncias & Multi-Tenancy
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {impersonatedOrgId && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20 rounded-xl"
                            onClick={() => setImpersonatedOrg(null)}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Sair do Suporte
                        </Button>
                    )}
                    <Button onClick={() => setIsCreating(true)} className="rounded-2xl h-12 px-6 gap-2 font-bold tracking-tight shadow-[0_0_20px_rgba(96,165,250,0.2)]">
                        <Plus className="w-4 h-4" />
                        Nova Imobiliária
                    </Button>
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-high-fidelity rounded-[2rem] border-white/5 relative overflow-hidden group">
                    <Building2 className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
                    <CardContent className="pt-8 flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Instâncias Ativas</p>
                            <h3 className="text-3xl font-display font-bold text-white">{organizations.length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-high-fidelity rounded-[2rem] border-white/5 relative overflow-hidden group">
                    <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
                    <CardContent className="pt-8 flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total de Leads</p>
                            <h3 className="text-3xl font-display font-bold text-white">{stats.totalLeads.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-high-fidelity rounded-[2rem] border-white/5 relative overflow-hidden group">
                    <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
                    <CardContent className="pt-8 flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Corretores Totais</p>
                            <h3 className="text-3xl font-display font-bold text-white">{stats.totalUsers.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <Card className="glass-high-fidelity rounded-[2.5rem] border-white/5 overflow-hidden">
                <CardHeader className="border-b border-white/5 py-8 px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl text-white">Carteira de Clientes</CardTitle>
                            <CardDescription>Monitoramento e gestão administrativa de inquilinos</CardDescription>
                        </div>
                        <div className="relative group max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Buscar imobiliária por nome ou slug..."
                                className="pl-11 h-12 bg-white/5 border-white/20 rounded-2xl focus:ring-primary/20 placeholder:text-gray-600"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                    <th className="px-8 py-5">Identificação</th>
                                    <th className="px-6 py-5">Plano / Tier</th>
                                    <th className="px-6 py-5">Métricas</th>
                                    <th className="px-6 py-5">Situação</th>
                                    <th className="px-8 py-5 text-right">Ações de Gestão</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredOrgs.map(org => (
                                    <tr key={org.id} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white flex items-center gap-2">
                                                    {org.name}
                                                    {impersonatedOrgId === org.id && <Badge className="bg-primary/20 text-primary h-5 text-[9px] border-primary/20">ATIVO EM SUPORTE</Badge>}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono opacity-60">/{org.slug}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <Badge variant={org.plan_tier === 'enterprise' ? 'default' : org.plan_tier === 'pro' ? 'secondary' : 'outline'} className="rounded-lg px-2 text-[10px] font-mono">
                                                {org.plan_tier.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-6 font-mono">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-white">
                                                    <ChevronRight className="w-3 h-3 text-emerald-400" />
                                                    {org._count?.leads} / {org.leads_limit} Leads
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <ChevronRight className="w-3 h-3 text-blue-400" />
                                                    {org._count?.members} Usuários
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px] ${org.subscription_status === 'active' ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-red-400 shadow-red-400/50 blink'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${org.subscription_status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {org.subscription_status === 'active' ? 'Operacional' : 'Bloqueado'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Espelhar Ambiente"
                                                    className="h-10 w-10 text-emerald-400 hover:bg-emerald-400/10 rounded-xl"
                                                    onClick={() => setImpersonatedOrg(org.id)}
                                                    disabled={impersonatedOrgId === org.id}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Copiar Link de Convite"
                                                    className="h-10 w-10 text-emerald-400 hover:bg-emerald-400/10 rounded-xl"
                                                    onClick={() => handleCopyInviteLink(org.slug)}
                                                >
                                                    <LinkIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Editar Dados"
                                                    className="h-10 w-10 text-blue-400 hover:bg-blue-400/10 rounded-xl"
                                                    onClick={() => setEditingOrg(org)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={org.subscription_status === 'active' ? "Suspender Acesso" : "Liberar Acesso"}
                                                    className={`h-10 w-10 rounded-xl ${org.subscription_status === 'active' ? 'text-amber-400 hover:bg-amber-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'}`}
                                                    onClick={() => handleToggleStatus(org)}
                                                >
                                                    {org.subscription_status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Excluir Definitivamente"
                                                    className="h-10 w-10 text-red-500 hover:bg-red-500/10 rounded-xl"
                                                    onClick={() => setOrgToDelete(org)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <AnimatePresence>
                {/* Create Modal */}
                {isCreating && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCreating(false)} />
                        <Card className="glass-high-fidelity rounded-[2.5rem] w-full max-w-lg relative z-[70] border-white/10 shadow-2xl overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="rounded-full hover:bg-white/5">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                                <CardTitle className="text-2xl text-white">Criar Nova Instância</CardTitle>
                                <CardDescription>Provisionamento de novo cliente SaaS</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleCreateOrg} className="space-y-6">
                                    <div className="space-y-5">
                                        <Input
                                            label="Nome Corporativo"
                                            placeholder="Ex: Aliança Imóveis de Elite"
                                            required
                                            value={newOrg.name}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setNewOrg(prev => ({
                                                    ...prev,
                                                    name: val,
                                                    slug: val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
                                                }));
                                            }}
                                        />
                                        <Input
                                            label="Slug de Acesso (URL)"
                                            placeholder="alianca-imoveis"
                                            required
                                            value={newOrg.slug}
                                            onChange={e => setNewOrg(prev => ({ ...prev, slug: e.target.value }))}
                                        />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Plan Tier</label>
                                            <select
                                                className="flex h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-2 text-sm text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all appearance-none outline-none"
                                                value={newOrg.plan_tier}
                                                onChange={e => setNewOrg(prev => ({ ...prev, plan_tier: e.target.value as any }))}
                                            >
                                                <option value="free" className="bg-[#0a0a0a]">Free Tier</option>
                                                <option value="pro" className="bg-[#0a0a0a]">Pro Growth</option>
                                                <option value="enterprise" className="bg-[#0a0a0a]">Enterprise Scaler</option>
                                            </select>
                                        </div>
                                        <Input
                                            label="Limite de Leads"
                                            type="number"
                                            value={newOrg.leads_limit}
                                            onChange={e => setNewOrg(prev => ({ ...prev, leads_limit: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <Button variant="ghost" className="flex-1 rounded-2xl h-14 font-bold" type="button" onClick={() => setIsCreating(false)}>Cancelar</Button>
                                        <Button className="flex-1 rounded-2xl h-14 gap-2 font-bold shadow-lg shadow-primary/20" type="submit" isLoading={isProcessing}>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Criar Agora
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Edit Modal */}
                {editingOrg && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingOrg(null)} />
                        <Card className="glass-high-fidelity rounded-[2.5rem] w-full max-w-lg relative z-[70] border-white/10 shadow-2xl overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <Pencil className="w-5 h-5" />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setEditingOrg(null)} className="rounded-full">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                                <CardTitle className="text-2xl text-white">Editar Instância</CardTitle>
                                <CardDescription>Modificando parâmetros de {editingOrg.name}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleUpdateOrg} className="space-y-6">
                                    <div className="space-y-5">
                                        <Input
                                            label="Nome Corporativo"
                                            required
                                            value={editingOrg.name}
                                            onChange={e => setEditingOrg({ ...editingOrg, name: e.target.value })}
                                        />
                                        <Input
                                            label="Slug de Acesso"
                                            required
                                            value={editingOrg.slug}
                                            onChange={e => setEditingOrg({ ...editingOrg, slug: e.target.value })}
                                        />
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Plan Tier</label>
                                                <select
                                                    className="flex h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-2 text-sm text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all appearance-none outline-none"
                                                    value={editingOrg.plan_tier}
                                                    onChange={e => setEditingOrg({ ...editingOrg, plan_tier: e.target.value as any })}
                                                >
                                                    <option value="free" className="bg-[#0a0a0a]">Free Tier</option>
                                                    <option value="pro" className="bg-[#0a0a0a]">Pro Growth</option>
                                                    <option value="enterprise" className="bg-[#0a0a0a]">Enterprise Scaler</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Status do Acesso</label>
                                                <select
                                                    className="flex h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-2 text-sm text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all appearance-none outline-none"
                                                    value={editingOrg.subscription_status}
                                                    onChange={e => setEditingOrg({ ...editingOrg, subscription_status: e.target.value })}
                                                >
                                                    <option value="active" className="bg-[#0a0a0a]">Ativo / Operacional</option>
                                                    <option value="inactive" className="bg-[#0a0a0a]">Bloqueado / Suspenso</option>
                                                    <option value="trialing" className="bg-[#0a0a0a]">Período de Testes</option>
                                                </select>
                                            </div>
                                            <Input
                                                label="Limite de Leads"
                                                type="number"
                                                value={editingOrg.leads_limit}
                                                onChange={e => setEditingOrg({ ...editingOrg, leads_limit: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <Button variant="ghost" className="flex-1 rounded-2xl h-14 font-bold" type="button" onClick={() => setEditingOrg(null)}>Cancelar</Button>
                                        <Button className="flex-1 rounded-2xl h-14 gap-2 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20" type="submit" isLoading={isProcessing}>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Delete Modal */}
                {orgToDelete && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setOrgToDelete(null)} />
                        <Card className="glass-high-fidelity rounded-[2.5rem] w-full max-w-sm relative z-[70] border-red-500/20 shadow-2xl overflow-hidden border">
                            <CardHeader className="text-center pt-10">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <CardTitle className="text-2xl text-white">Exclusão Crítica</CardTitle>
                                <CardDescription className="text-red-400/80 font-medium">Esta ação não pode ser desfeita.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center pb-10">
                                <p className="text-sm text-muted-foreground mb-8 text-balance">
                                    Você está prestes a apagar permanentemente a imobiliária <span className="text-white font-bold">{orgToDelete.name}</span> e TODOS os dados vinculados a ela.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        variant="destructive"
                                        className="w-full h-14 rounded-2xl gap-2 font-bold bg-red-600 hover:bg-red-500"
                                        onClick={handleDeleteOrg}
                                        isLoading={isProcessing}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Sim, Excluir Definitivamente
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full h-14 rounded-2xl font-bold"
                                        onClick={() => setOrgToDelete(null)}
                                        disabled={isProcessing}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .blink {
                    animation: blink 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .3; }
                }
            `}</style>
        </div>
    );
};

export default SuperAdmin;
