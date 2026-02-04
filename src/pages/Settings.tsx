import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLead } from '../contexts/LeadContext';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ShieldCheck, Zap, TrendingUp, Users, Target, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Helmet } from 'react-helmet-async';
import { LeadStatus } from '../types';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { leads } = useLead();
    const { userProfile, fetchUserProfile } = useUser();
    const org = userProfile?.organization;

    const [isEditingBrand, setIsEditingBrand] = React.useState(false);
    const [brandName, setBrandName] = React.useState(org?.name || '');
    const [brandLogo, setBrandLogo] = React.useState(org?.logo_url || '');
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (org) {
            setBrandName(org.brand_display_name || org.name);
            setBrandLogo(org.logo_url || '');
        }
    }, [org]);

    const canEditBranding = userProfile?.role === 'owner' || userProfile?.role === 'admin' || userProfile?.is_super_admin;

    // Agency Intelligence Metrics
    const metrics = useMemo(() => {
        const total = leads.length;
        if (total === 0) return { conversion: 0, topSource: 'N/A', activeBrokers: 0 };

        const closed = leads.filter(l => l.status === LeadStatus.COMPROU).length;
        const conversion = ((closed / total) * 100).toFixed(1);

        const sources: Record<string, number> = {};
        leads.forEach(l => {
            const s = l.midia || 'Orgânico';
            sources[s] = (sources[s] || 0) + 1;
        });
        const topSource = Object.entries(sources).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        const brokers = new Set(leads.map(l => l.user_id)).size;

        return { conversion, topSource, activeBrokers: brokers };
    }, [leads]);

    if (!org) return null;

    const handleSaveBranding = async () => {
        if (!org) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('organizations')
                .update({
                    name: brandName,
                    brand_display_name: brandName,
                    logo_url: brandLogo || null
                })
                .eq('id', org.id);

            if (error) throw error;
            toast.success('Identidade visual atualizada!');
            setIsEditingBrand(false);
            if (userProfile?.id) fetchUserProfile(userProfile.id);
        } catch (error: any) {
            console.error('Error saving branding:', error);
            toast.error('Erro ao salvar marca.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16 pb-40 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Helmet>
                <title>Inteligência da Agência | ImobLeads</title>
                <meta name="description" content="Gestão de marca e inteligência operacional da Casa Maria Imobiliária." />
            </Helmet>
            <header className="mb-12 space-y-4">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground italic tracking-tighter">Configurações</h1>
                <p className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase flex items-center gap-3">
                    <span className="h-[1px] w-8 bg-primary/30" />
                    Centro de Inteligência da Agência
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <Card className="glass-high-fidelity rounded-[2.5rem] overflow-hidden group">
                        <CardHeader className="border-b border-white/5 pb-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-display italic flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary opacity-60" />
                                Identidade da Agência
                            </CardTitle>
                            {canEditBranding && !isEditingBrand && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[10px] font-bold tracking-widest text-primary/60 hover:text-primary uppercase"
                                    onClick={() => setIsEditingBrand(true)}
                                >
                                    Editar
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            {isEditingBrand ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] block">Nome de Exibição</label>
                                        <input
                                            type="text"
                                            value={brandName}
                                            onChange={(e) => setBrandName(e.target.value)}
                                            className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] block">URL do Logo</label>
                                        <input
                                            type="text"
                                            value={brandLogo}
                                            onChange={(e) => setBrandLogo(e.target.value)}
                                            className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button size="sm" className="grow" onClick={handleSaveBranding} isLoading={isSaving}>Salvar</Button>
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditingBrand(false)}>Cancelar</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] block mb-2">Instituição</label>
                                        <p className="font-display font-bold text-xl text-foreground italic">{org.brand_display_name || org.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] block mb-2">Status da Licença</label>
                                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-bold tracking-widest px-3 py-1">
                                            ESTRUTURA VERIFICADA
                                        </Badge>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden">
                        <CardHeader className="border-b border-white/5 pb-6">
                            <CardTitle className="text-xl font-display italic flex items-center gap-3">
                                <Zap className="w-5 h-5 text-primary opacity-60" />
                                Integridade da Base
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 mb-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Volume Operacional</span>
                                    <span className="text-[11px] font-mono text-foreground font-bold">{leads.length} LEADS ATIVOS</span>
                                </div>
                                <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary shadow-luxury w-full opacity-30" />
                                </div>
                                <p className="text-[9px] text-muted-foreground/40 font-bold uppercase text-center tracking-widest">
                                    Sincronização global ativa e protegida
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Intelligence Card: Efficiency */}
                        <Card className="glass-high-fidelity rounded-[2rem] border-white/5 hover:border-primary/20 transition-all duration-500 overflow-hidden relative group p-8 space-y-6">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit text-emerald-500">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Pipeline Efficiency</h4>
                                <p className="text-4xl font-display font-bold italic text-foreground tracking-tighter">
                                    {metrics.conversion}%
                                </p>
                                <p className="text-[10px] text-emerald-500/60 font-bold mt-2 uppercase tracking-widest">Taxa de Conversão Real</p>
                            </div>
                        </Card>

                        {/* Intelligence Card: Top Source */}
                        <Card className="glass-high-fidelity rounded-[2rem] border-white/5 hover:border-primary/20 transition-all duration-500 overflow-hidden relative group p-8 space-y-6">
                            <div className="p-3 bg-primary/10 rounded-2xl w-fit text-primary">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Source Velocity</h4>
                                <p className="text-3xl font-display font-bold italic text-foreground tracking-tighter truncate">
                                    {metrics.topSource}
                                </p>
                                <p className="text-[10px] text-primary/60 font-bold mt-2 uppercase tracking-widest">Canal de Maior Tração</p>
                            </div>
                        </Card>

                        {/* Intelligence Card: Team */}
                        <Card className="glass-high-fidelity rounded-[2rem] border-white/5 hover:border-primary/20 transition-all duration-500 overflow-hidden relative group p-8 space-y-6">
                            <div className="p-3 bg-amber-500/10 rounded-2xl w-fit text-amber-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Broker Activity</h4>
                                <p className="text-4xl font-display font-bold italic text-foreground tracking-tighter">
                                    {metrics.activeBrokers}
                                </p>
                                <p className="text-[10px] text-amber-500/60 font-bold mt-2 uppercase tracking-widest">Corretores em Operação</p>
                            </div>
                        </Card>
                    </div>

                    <div className="p-10 bg-card dark:bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-border/50 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden group">
                        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-primary/2blur-[100px] pointer-events-none group-hover:bg-primary/5 transition-all duration-1000" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110">
                                <ShieldCheck className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-display font-bold italic text-2xl leading-tight">Configurações Avançadas</h4>
                                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-[0.2em] mt-2 max-w-sm">
                                    Ajuste os parâmetros fundamentais da sua base exclusiva de dados.
                                </p>
                            </div>
                        </div>
                        <Button
                            className="h-14 px-10 rounded-2xl font-bold tracking-widest text-[10px] shadow-luxury"
                            onClick={() => navigate('/reports')}
                        >
                            VER RELATÓRIOS COMPLETOS
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
