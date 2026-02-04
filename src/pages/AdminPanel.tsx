import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { Building2, Users, ShieldAlert, RefreshCw, Plus, Pencil, Trash2, X, Eye, UserPlus, Copy, Check, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Organization, UserProfile } from '../types';
import { useUser } from '../contexts/UserContext';

interface OrgStats extends Organization {
    lead_count: number;
    member_count: number;
    created_at: string;
}

const AdminPanel: React.FC = () => {
    const { setImpersonatedOrg, impersonatedOrgId } = useUser();
    const [stats, setStats] = useState<OrgStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'orgs' | 'settings'>('orgs');

    // Global Settings State
    const [globalSettings, setGlobalSettings] = useState({
        app_name: 'NossoCRM',
        app_logo_url: ''
    });
    const [savingSettings, setSavingSettings] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<OrgStats | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        plan_tier: 'free',
        max_leads: 50,
        max_users: 1,
        subscription_status: 'active'
    });

    // Invitation State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [invitingOrg, setInvitingOrg] = useState<OrgStats | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [isCreatingInvite, setIsCreatingInvite] = useState(false);

    const fetchGlobalSettings = async () => {
        const { data } = await supabase
            .from('system_settings')
            .select('*')
            .eq('id', 'global')
            .single();
        if (data) setGlobalSettings({ app_name: data.app_name, app_logo_url: data.app_logo_url || '' });
    };

    const fetchStats = async () => {
        setRefreshing(true);
        try {
            await fetchGlobalSettings();
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

    const resetForm = () => {
        setFormData({ name: '', plan_tier: 'free', max_leads: 50, max_users: 1, subscription_status: 'active' });
        setEditingOrg(null);
        setIsModalOpen(false);
    };

    const handleEdit = (org: OrgStats) => {
        setEditingOrg(org);
        setFormData({
            name: org.name,
            plan_tier: org.plan_tier,
            max_leads: org.max_leads,
            max_users: org.max_users,
            subscription_status: org.subscription_status
        });
        setIsModalOpen(true);
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const { error } = await supabase
                .from('system_settings')
                .upsert({
                    id: 'global',
                    app_name: globalSettings.app_name,
                    app_logo_url: globalSettings.app_logo_url || null,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            toast.success('Configurações globais salvas!');
            window.location.reload();
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast.error('Erro ao salvar configurações.');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingOrg) {
                // Update
                const { error } = await supabase
                    .from('organizations')
                    .update({
                        name: formData.name,
                        plan_tier: formData.plan_tier as any,
                        max_leads: formData.max_leads,
                        max_users: formData.max_users,
                        subscription_status: formData.subscription_status
                    })
                    .eq('id', editingOrg.id);

                if (error) throw error;
                toast.success('Organização atualizada!');
            } else {
                // Create
                const slug = formData.name.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();

                const { error } = await supabase
                    .from('organizations')
                    .insert([{
                        name: formData.name,
                        slug: slug,
                        plan_tier: formData.plan_tier as any,
                        max_leads: formData.max_leads,
                        max_users: formData.max_users,
                        subscription_status: formData.subscription_status
                    }]);

                if (error) throw error;
                toast.success('Nova organização criada!');
            }
            fetchStats();
            resetForm();
        } catch (error: any) {
            console.error('SERVER ERROR:', error);
            toast.error(`Falha ao salvar: ${error.message}`);
        }
    };

    const toggleStatus = async (orgId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'canceled' : 'active';
        try {
            const { error } = await supabase
                .from('organizations')
                .update({ subscription_status: newStatus })
                .eq('id', orgId);

            if (error) throw error;
            toast.success(`Organização ${newStatus === 'active' ? 'ativada' : 'pausada'}!`);
            fetchStats();
        } catch (error) {
            toast.error('Erro ao alterar status.');
        }
    };

    const deleteOrg = async (orgId: string) => {
        if (!window.confirm('TEM CERTEZA? Isso apagará todos os usuários e leads desta organização.')) return;

        try {
            const { error } = await supabase
                .from('organizations')
                .delete()
                .eq('id', orgId);

            if (error) throw error;
            toast.success('Organização removida.');
            fetchStats();
        } catch (error) {
            toast.error('Erro ao remover organização.');
        }
    }

    const generateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invitingOrg) return;
        setIsCreatingInvite(true);
        try {
            const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            const { error } = await supabase
                .from('organization_invites')
                .insert([{
                    organization_id: invitingOrg.id,
                    email: inviteEmail.trim().toLowerCase(),
                    role: 'owner',
                    token: token,
                    status: 'pending',
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                }]);

            if (error) throw error;

            const link = `${window.location.origin}/join?token=${token}`;
            setGeneratedLink(link);
            toast.success('Convite gerado com sucesso!');
        } catch (error: any) {
            console.error('Error creating invite:', error);
            toast.error('Erro ao gerar convite: ' + error.message);
        } finally {
            setIsCreatingInvite(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        toast.success('Link copiado!');
        setTimeout(() => setCopied(false), 2000);
    };

    const closeInviteModal = () => {
        setIsInviteModalOpen(false);
        setInvitingOrg(null);
        setInviteEmail('');
        setGeneratedLink('');
        setCopied(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-primary" />
                        Console de Administração
                    </h2>
                    <p className="text-muted-foreground font-medium mt-1">Gestão global de organizações e faturamento.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="flex p-1 bg-muted/30 rounded-xl border border-border mr-2">
                        <button
                            onClick={() => setActiveTab('orgs')}
                            className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", activeTab === 'orgs' ? "bg-card text-primary shadow-sm" : "hover:bg-card/50 text-muted-foreground")}
                        >
                            Organizações
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", activeTab === 'settings' ? "bg-card text-primary shadow-sm" : "hover:bg-card/50 text-muted-foreground")}
                        >
                            Configurações App
                        </button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchStats}
                        disabled={refreshing}
                        className="gap-2 flex-1 md:flex-none border-border hover:bg-muted/50"
                    >
                        <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                        Atualizar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 flex-1 md:flex-none bg-primary text-primary-foreground font-bold shadow-luxury"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Organização
                    </Button>
                </div>
            </div>

            {activeTab === 'orgs' ? (
                <div className="grid grid-cols-1 gap-6">
                    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
                        <CardHeader className="bg-muted/20 border-b border-border">
                            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                                <span>Organização / Cliente</span>
                                <div className="hidden md:flex gap-12 mr-12 text-right">
                                    <span className="w-24">Plano</span>
                                    <span className="w-24">Status</span>
                                    <span className="w-24">Leads</span>
                                    <span className="w-24">Equipe</span>
                                    <span className="w-32">Ações</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-border">
                            {stats.map((org) => (
                                <motion.div
                                    key={org.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 hover:bg-muted/30 flex flex-col md:flex-row items-center justify-between transition-colors gap-4"
                                >
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Building2 className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">{org.name}</h4>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                                ID: {(org.id || '').split('-')[0]} • {new Date(org.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-12 w-full md:w-auto justify-between md:justify-end text-sm">
                                        <div className="w-auto md:w-24">
                                            <Badge variant={org.plan_tier === 'free' ? 'outline' : 'default'} className="capitalize font-black">
                                                {org.plan_tier}
                                            </Badge>
                                        </div>
                                        <div className="w-auto md:w-24">
                                            <Badge
                                                variant={org.subscription_status === 'active' ? 'secondary' : 'destructive'}
                                                className="capitalize text-[10px]"
                                            >
                                                {org.subscription_status === 'active' ? 'Ativo' :
                                                    org.subscription_status === 'paused' ? 'Pausado' : 'Cancelado'}
                                            </Badge>
                                        </div>
                                        <div className="w-auto md:w-24 flex flex-col items-center">
                                            <span className="font-bold text-foreground">{org.lead_count} <span className="text-muted-foreground">/ {org.max_leads}</span></span>
                                        </div>
                                        <div className="w-auto md:w-24 flex items-center gap-1 justify-center">
                                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="font-bold text-foreground">{org.member_count}</span>
                                        </div>
                                        <div className="w-auto md:w-32 flex justify-end gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-primary/60 hover:text-primary"
                                                onClick={() => setImpersonatedOrg(org.id)}
                                                title="Acessar como Suporte"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-cyan-500 hover:text-cyan-400"
                                                onClick={() => {
                                                    setInvitingOrg(org);
                                                    setIsInviteModalOpen(true);
                                                }}
                                                title="Gerar Convite"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => handleEdit(org)}
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className={cn("h-8 w-8", org.subscription_status === 'active' ? "text-amber-500 hover:text-amber-400" : "text-emerald-500 hover:text-emerald-400")}
                                                onClick={() => toggleStatus(org.id, org.subscription_status)}
                                                title={org.subscription_status === 'active' ? 'Pausar' : 'Ativar'}
                                            >
                                                {org.subscription_status === 'active' ? <X className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => deleteOrg(org.id)}
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto py-12">
                    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl">
                        <CardHeader>
                            <CardTitle>Identidade do Sistema</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveSettings} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Nome do Aplicativo (White Label)</label>
                                    <Input
                                        value={globalSettings.app_name}
                                        onChange={e => setGlobalSettings({ ...globalSettings, app_name: e.target.value })}
                                        placeholder="Ex: NossoCRM"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">URL do Logo (SVG ou PNG)</label>
                                    <Input
                                        value={globalSettings.app_logo_url}
                                        onChange={e => setGlobalSettings({ ...globalSettings, app_logo_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" isLoading={savingSettings} className="w-full bg-primary text-primary-foreground font-bold shadow-luxury">
                                        Salvar Configurações
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetForm}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 md:p-8 space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-foreground">
                                    {editingOrg ? 'Editar Organização' : 'Nova Organização'}
                                </h3>
                                <Button size="icon" variant="ghost" onClick={resetForm}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Nome da Empresa</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Imobiliária Silva"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Plano</label>
                                        <select
                                            value={formData.plan_tier}
                                            onChange={e => setFormData({ ...formData, plan_tier: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="free">Free</option>
                                            <option value="pro">Pro</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <select
                                            value={formData.subscription_status}
                                            onChange={e => setFormData({ ...formData, subscription_status: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="active">Ativo</option>
                                            <option value="canceled">Cancelado</option>
                                            <option value="paused">Pausado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Máx. Leads</label>
                                        <Input
                                            type="number"
                                            required
                                            value={formData.max_leads}
                                            onChange={e => setFormData({ ...formData, max_leads: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Máx. Usuários</label>
                                        <Input
                                            type="number"
                                            required
                                            value={formData.max_users}
                                            onChange={e => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <Button type="button" variant="ghost" onClick={resetForm}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" variant="luxury" className="px-8">
                                        {editingOrg ? 'Salvar Alterações' : 'Criar Organização'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >

            <AnimatePresence>
                {isInviteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeInviteModal}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">Convidar para {invitingOrg?.name}</h3>
                                        <p className="text-xs text-muted-foreground">O usuário entrará como Proprietário (Owner).</p>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" onClick={closeInviteModal}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {!generatedLink ? (
                                <form onSubmit={generateInvite} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground px-1">E-mail do Convidado</label>
                                        <Input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            placeholder="exemplo@email.com"
                                        />
                                    </div>
                                    <Button type="submit" variant="luxury" className="w-full" isLoading={isCreatingInvite}>
                                        Gerar Link de Convite
                                    </Button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-sm font-medium flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        Convite gerado! Copie o link abaixo para enviar.
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground px-1">Link de Acesso</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-secondary p-3 rounded-lg border border-border font-mono text-[10px] break-all select-all">
                                                {generatedLink}
                                            </div>
                                            <Button
                                                size="icon"
                                                onClick={copyToClipboard}
                                                className={cn("shrink-0", copied ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary")}
                                            >
                                                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="w-full" onClick={closeInviteModal}>
                                        Fechar
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default AdminPanel;
