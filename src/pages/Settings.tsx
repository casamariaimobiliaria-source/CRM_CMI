import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLead } from '../contexts/LeadContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CreditCard, Rocket, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile, leads } = useLead();
    const org = userProfile?.organization;

    if (!org) return null;

    const safeLeads = Array.isArray(leads) ? leads : [];
    const usagePercent = Math.min((safeLeads.length / org.max_leads) * 100, 100);
    const isOverLimit = safeLeads.length >= org.max_leads;

    const plans = [
        {
            name: 'Free',
            tier: 'free',
            price: 'R$ 0',
            features: ['Até 50 Leads', '1 Usuário', 'Funil de Vendas', 'WhatsApp Direct'],
            isCurrent: org.plan_tier === 'free'
        },
        {
            name: 'Pro',
            tier: 'pro',
            price: 'R$ 49,90/mês',
            features: ['Leads Ilimitados', 'Equipe até 5 pessoas', 'Dashboard Avançado', 'Exportação Excel', 'Suporte Prioritário'],
            isCurrent: org.plan_tier === 'pro',
            popular: true
        },
        {
            name: 'Enterprise',
            tier: 'enterprise',
            price: 'Sob Consulta',
            features: ['Múltiplas Filiais', 'Usuários Ilimitados', 'Configurações Customizadas', 'Treinamento VIP'],
            isCurrent: org.plan_tier === 'enterprise'
        }
    ];

    const onUpgrade = (tier: string) => {
        if (tier === 'free') return;
        toast.info('Em breve!', {
            description: `Estamos refinando a integração com pagamentos. O plano ${tier.toUpperCase()} estará disponível para contratação automática nos próximos dias.`
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16 pb-40 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground italic tracking-tight">Configurações do Sistema</h1>
                <p className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mt-2">Gestão de Recursos Empresariais</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <Card className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden group">
                        <CardHeader className="border-b border-white/5 pb-6">
                            <CardTitle className="text-xl font-display italic flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary opacity-60" />
                                Identidade Corporativa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] block mb-2">Nome da Instituição</label>
                                <p className="font-display font-bold text-xl text-foreground italic">{org.name}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] block mb-2">Credencial da Conta</label>
                                <Badge variant="outline" className="capitalize bg-white/5 border-white/10 text-primary font-bold tracking-widest px-3 py-1">
                                    {org.subscription_status === 'active' ? 'ATIVO VERIFICADO' : org.subscription_status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden">
                        <CardHeader className="border-b border-white/5 pb-6">
                            <CardTitle className="text-xl font-display italic flex items-center gap-3">
                                <Zap className="w-5 h-5 text-primary opacity-60" />
                                Alocação de Quota
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Uso de Recursos</span>
                                    <span className="text-[11px] font-mono text-foreground font-bold">{safeLeads.length} / {org.max_leads} UN</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${usagePercent}%` }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            isOverLimit ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "bg-primary shadow-gold-glow"
                                        )}
                                    />
                                </div>
                                {isOverLimit && (
                                    <p className="text-[9px] text-destructive font-bold uppercase text-center tracking-widest animate-pulse">
                                        ⚠ QUOTA EXCEDIDA - UPGRADE NECESSÁRIO
                                    </p>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                className="w-full border-white/5 h-12 rounded-xl text-[10px] font-bold tracking-widest hover:bg-white/5"
                                onClick={() => navigate('/')}
                            >
                                <Rocket className="w-4 h-4 mr-3" />
                                ACESSAR REPOSITÓRIO
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.tier}
                                className={cn(
                                    "flex flex-col border transition-all duration-700 rounded-[2rem] overflow-hidden relative group",
                                    plan.isCurrent
                                        ? "bg-white/[0.03] border-primary/30 shadow-gold-glow/10"
                                        : "bg-card/20 border-white/5 hover:border-primary/20 hover:bg-white/[0.02]"
                                )}
                            >
                                {plan.isCurrent && (
                                    <div className="absolute top-0 inset-x-0 h-1 bg-primary shadow-gold-glow" />
                                )}

                                <CardHeader className="text-center pt-10 pb-6 relative">
                                    {plan.isCurrent && (
                                        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary uppercase tracking-[0.3em]">Plano Institucional</span>
                                    )}
                                    <CardTitle className="text-2xl font-display font-bold italic mb-2">{plan.name}</CardTitle>
                                    <CardDescription className="text-lg font-bold text-foreground/60">{plan.price}</CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 px-8 py-6">
                                    <ul className="space-y-4">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[11px] font-medium text-muted-foreground/60 leading-relaxed group-hover:text-muted-foreground transition-colors">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary/40 shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="p-8 pt-4">
                                    <Button
                                        className={cn(
                                            "w-full h-12 rounded-xl text-[10px] font-bold tracking-widest transition-all duration-500",
                                            plan.isCurrent
                                                ? "bg-white/5 text-muted-foreground cursor-default border border-white/10"
                                                : ""
                                        )}
                                        variant={plan.isCurrent ? 'ghost' : 'luxury'}
                                        disabled={plan.isCurrent}
                                        onClick={() => onUpgrade(plan.tier)}
                                    >
                                        {plan.isCurrent ? 'ATIVO' : 'FAZER UPGRADE'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-10 p-8 bg-black/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 flex items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-primary/5 blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:border-primary/20">
                                <CreditCard className="w-6 h-6 text-primary opacity-60" />
                            </div>
                            <div>
                                <h4 className="font-display font-bold italic text-lg leading-tight">Integração de Pagamento</h4>
                                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-widest mt-1">Sincronização com Gateway Stripe em andamento</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground/40 text-[9px] font-bold tracking-[0.2em] py-1 px-3">EM BREVE</Badge>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
