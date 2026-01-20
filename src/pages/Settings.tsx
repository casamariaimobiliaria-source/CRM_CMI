import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLead } from '../contexts/LeadContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CreditCard, Rocket, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile, leads } = useLead();
    const org = userProfile?.organization;

    if (!org) return null;

    const usagePercent = Math.min((leads.length / org.max_leads) * 100, 100);
    const isOverLimit = leads.length >= org.max_leads;

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
        <div className="max-w-6xl mx-auto p-6 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-foreground tracking-tight">Configurações</h2>
                <p className="text-muted-foreground font-medium">Gerencie sua imobiliária e plano de assinatura.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Org Details & Usage */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                Minha Imobiliária
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Nome</label>
                                <p className="font-bold text-lg">{org.name}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Status da Conta</label>
                                <Badge variant={org.subscription_status === 'active' ? 'success' : 'warning'} className="capitalize">
                                    {org.subscription_status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                        <CardHeader className="border-b">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                Uso do Plano
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Leads Cadastrados</span>
                                    <span className="text-sm font-black">{leads.length} / {org.max_leads}</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                    <div
                                        className={`h-full transition-all duration-1000 ${isOverLimit ? 'bg-destructive' : 'bg-primary'}`}
                                        style={{ width: `${usagePercent}%` }}
                                    />
                                </div>
                                {isOverLimit && (
                                    <p className="text-[10px] text-destructive font-black uppercase text-center animate-pulse">
                                        ⚠ Limite atingido! Faça upgrade para adicionar mais.
                                    </p>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                className="w-full border-primary/20 text-primary hover:bg-primary/5"
                                onClick={() => navigate('/')}
                            >
                                <Rocket className="w-4 h-4 mr-2" />
                                Ver Meus Leads
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Plans Grid */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.tier}
                                className={`flex flex-col border-2 relative transition-all duration-300 ${plan.isCurrent ? 'border-primary bg-white shadow-xl' : 'border-transparent bg-white/40 hover:bg-white hover:border-slate-200 shadow-lg'}`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        Popular
                                    </div>
                                )}
                                {plan.isCurrent && (
                                    <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        Plano Atual
                                    </div>
                                )}

                                <CardHeader className="text-center pb-2">
                                    <CardTitle className="text-2xl font-black">{plan.name}</CardTitle>
                                    <CardDescription className="text-xl font-bold text-foreground/80">{plan.price}</CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 pt-4 space-y-4">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="pt-6">
                                    <Button
                                        className="w-full h-11 font-bold"
                                        variant={plan.isCurrent ? 'secondary' : 'primary'}
                                        disabled={plan.isCurrent}
                                        onClick={() => onUpgrade(plan.tier)}
                                    >
                                        {plan.isCurrent ? 'Plano Ativo' : 'Fazer Upgrade'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-slate-950 rounded-2xl text-white flex items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold">Integração de Pagamento</h4>
                                <p className="text-xs text-white/60">Estamos finalizando a conexão com o Stripe para pagamentos automáticos.</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-white/10 text-white border-0 py-1">Em Breve</Badge>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
