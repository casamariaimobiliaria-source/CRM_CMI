import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLead } from '../contexts/LeadContext';
import { useUser } from '../contexts/UserContext';
import { LeadTemperature, LeadStatus } from '../types';
import { Input } from '../components/ui/Input';
import { MaskedInput } from '../components/MaskedInput';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { toast } from 'sonner';
import { leadFormSchema, type LeadFormValues } from '../lib/validations';
import { cn } from '../lib/utils';
import { Trash2, Sparkles } from 'lucide-react';
import { AIAssistant } from '../components/AIAssistant';
import { Lead } from '../types';

const LeadForm: React.FC = () => {
    const { addLead, updateLead, deleteLead, leads } = useLead();
    const { userProfile } = useUser();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [enterpriseOptions, setEnterpriseOptions] = React.useState<{ id: string, name: string }[]>([]);
    const [sourceOptions, setSourceOptions] = React.useState<{ id: string, name: string }[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        getValues,
        watch
    } = useForm<LeadFormValues>({
        resolver: zodResolver(leadFormSchema),
        defaultValues: {
            nome: '',
            telefone: '',
            email: '',
            midia: '',
            empreendimento_id: '',
            origem_id: '',
            data_compra: '',
            corretor: '',
            empreendimento: '',
            temperatura: LeadTemperature.FRIO,
            status: LeadStatus.ATIVO,
            historico: '',
            proximo_contato: ''
        }
    });

    const { impersonatedOrgId } = useUser();

    useEffect(() => {
        const fetchOptions = async () => {
            const currentOrgId = impersonatedOrgId || userProfile?.organization_id;
            console.log('LeadForm: currentOrgId:', currentOrgId);
            if (!currentOrgId) {
                console.log('LeadForm: No organization_id found');
                return;
            }

            try {
                const [entRes, srcRes] = await Promise.all([
                    supabase.from('empreendimentos').select('id, nome').eq('organization_id', currentOrgId).order('nome'),
                    supabase.from('origens_lead').select('id, nome').eq('organization_id', currentOrgId).order('nome')
                ]);

                console.log('LeadForm: entRes:', entRes);
                console.log('LeadForm: srcRes:', srcRes);

                if (entRes.data) {
                    console.log('LeadForm: setEnterpriseOptions:', entRes.data.length);
                    setEnterpriseOptions(entRes.data.map(e => ({ id: e.id, name: e.nome })));
                }
                if (srcRes.data) {
                    console.log('LeadForm: setSourceOptions:', srcRes.data.length);
                    setSourceOptions(srcRes.data.map(s => ({ id: s.id, name: s.nome })));
                }
            } catch (error) {
                console.error('LeadForm: Error fetching options:', error);
                toast.error('Erro ao carregar opções de empreendimento/origem');
            }
        };
        fetchOptions();
    }, [userProfile?.organization_id, impersonatedOrgId]);

    const watchTelefone = watch('telefone');

    useEffect(() => {
        if (id && leads.length > 0) {
            const existingLead = leads.find(l => l.id === id);
            if (existingLead) {
                // Try to resolve IDs if they are missing but names exist, now checking even if options load later
                let resolvedEnterpriseId = existingLead.empreendimento_id || '';
                if (!resolvedEnterpriseId && existingLead.empreendimento && enterpriseOptions.length > 0) {
                    const match = enterpriseOptions.find(opt =>
                        opt.name.trim().toLowerCase() === existingLead.empreendimento?.trim().toLowerCase()
                    );
                    if (match) resolvedEnterpriseId = match.id;
                }

                let resolvedSourceId = existingLead.origem_id || '';
                const sourceName = existingLead.midia || (existingLead as any).source;
                if (!resolvedSourceId && sourceName && sourceOptions.length > 0) {
                    const match = sourceOptions.find(opt =>
                        opt.name.trim().toLowerCase() === sourceName.trim().toLowerCase()
                    );
                    if (match) resolvedSourceId = match.id;
                }

                // Format proximo_contato for datetime-local input (YYYY-MM-DDTHH:mm)
                let formattedProximoContato = '';
                if (existingLead.proximo_contato) {
                    try {
                        const date = new Date(existingLead.proximo_contato);
                        if (!isNaN(date.getTime())) {
                            // Ensure local time formatting for datetime-local
                            const pad = (n: number) => String(n).padStart(2, '0');
                            const year = date.getFullYear();
                            const month = pad(date.getMonth() + 1);
                            const day = pad(date.getDate());
                            const hours = pad(date.getHours());
                            const minutes = pad(date.getMinutes());
                            formattedProximoContato = `${year}-${month}-${day}T${hours}:${minutes}`;
                        }
                    } catch (e) {
                        console.error("Error formatting date", e);
                    }
                }

                const empreendimentoIdToSet = resolvedEnterpriseId || '';
                const origemIdToSet = resolvedSourceId || '';

                reset({
                    nome: existingLead.nome || '',
                    telefone: existingLead.telefone || '',
                    email: existingLead.email || '',
                    midia: sourceName || '',
                    empreendimento_id: empreendimentoIdToSet,
                    origem_id: origemIdToSet,
                    data_compra: existingLead.data_compra || '',
                    corretor: existingLead.corretor || '',
                    empreendimento: existingLead.empreendimento || '',
                    temperatura: existingLead.temperatura,
                    status: existingLead.status,
                    historico: existingLead.historico || '',
                    proximo_contato: formattedProximoContato
                });

                // Force set values because sometimes reset doesn't trigger select updates correctly with dynamic options
                if (empreendimentoIdToSet) setValue('empreendimento_id', empreendimentoIdToSet);
                if (origemIdToSet) setValue('origem_id', origemIdToSet);
            }
        }
    }, [id, leads.length, reset, enterpriseOptions.length, sourceOptions.length, setValue]);

    // Duplicate Check
    const checkDuplicate = (phone: string) => {
        if (!phone || id) return false; // Don't check if editing
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) return false;

        return leads.some(l => l.telefone.replace(/\D/g, '') === cleanPhone);
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("DEBUG - Form errors:", errors);
        }
        console.log("DEBUG - isSubmitting:", isSubmitting);
    }, [errors, isSubmitting]);

    useEffect(() => {
        window.onerror = (msg, url, lineNo, columnNo, error) => {
            const errorMsg = `Global Error: ${msg} at ${lineNo}:${columnNo}`;
            console.error(errorMsg);
            toast.error('Erro Crítico no Navegador', { description: errorMsg });
            return false;
        };
    }, []);

    const onSubmit = async (data: LeadFormValues) => {
        const loadingToast = toast.loading('Salvando alterações...');
        try {
            // Find names for enterprise and source to keep them synced with IDs
            const enterpriseName = enterpriseOptions.find(opt => opt.id === data.empreendimento_id)?.name || '';
            const sourceName = sourceOptions.find(opt => opt.id === data.origem_id)?.name || '';

            const payload: any = {
                ...data,
                empreendimento_id: data.empreendimento_id || null,
                origem_id: data.origem_id || null,
                empreendimento: enterpriseName || data.empreendimento,
                midia: sourceName || data.midia
            };

            if (id) {
                await updateLead(id, payload);
                toast.success('Lead atualizado com sucesso!', { id: loadingToast });
            } else {
                await addLead(payload);
                toast.success('Lead criado com sucesso!', { id: loadingToast });
            }
            navigate('/');
        } catch (error: any) {
            console.error("Error saving lead", error);
            toast.error('Erro ao salvar lead', {
                id: loadingToast,
                description: error.message || 'Erro desconhecido'
            });
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
            try {
                if (id) {
                    await deleteLead(id);
                    toast.success('Lead excluído com sucesso');
                    navigate('/');
                }
            } catch (error) {
                toast.error('Erro ao excluir lead');
            }
        }
    };

    const currentLead = id ? leads.find(l => l.id === id) : null;

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-16 pb-20">
            <header className="mb-8 md:mb-12 text-center">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground italic tracking-tight px-4">
                    {id ? 'Detalhes do Lead' : 'Identificar Novo Lead'}
                </h1>
                <p className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mt-4">
                    Inteligência de Leads
                </p>
            </header>

            <div className={cn("grid grid-cols-1 gap-8", id && "lg:grid-cols-3")}>
                <div className={cn("space-y-8", id && "lg:col-span-2")}>
                    <Card className="bg-card border border-border rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <form onSubmit={handleSubmit(onSubmit, (errs) => {
                            console.error("Validation errors blocking submit:", errs);
                            const errorFields = Object.keys(errs).map(field => field).join(', ');
                            toast.error('Verifique os campos obrigatórios', {
                                description: `Campos com erro: ${errorFields}`
                            });
                        })}>
                            <CardContent className="p-6 md:p-12 space-y-8 md:space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Nome Completo"
                                            placeholder="Digite o nome completo..."
                                            error={errors.nome?.message}
                                            {...register('nome')}
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            label="E-mail"
                                            type="email"
                                            placeholder="contato@exemplo.com"
                                            error={errors.email?.message}
                                            {...register('email')}
                                        />
                                    </div>

                                    <div>
                                        <MaskedInput
                                            label="Contato Direto (WhatsApp)"
                                            placeholder="+55 (00) 00000-0000"
                                            error={errors.telefone?.message}
                                            {...register('telefone', {
                                                onChange: (e) => {
                                                    const isDup = checkDuplicate(e.target.value);
                                                    if (isDup) {
                                                        toast.warning('Contato duplicado detectado na base exclusiva', {
                                                            description: 'Este lead de alta prioridade já pode estar atribuído.',
                                                            duration: 5000
                                                        });
                                                    }
                                                }
                                            })}
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            label="Próximo Contato"
                                            type="datetime-local"
                                            error={errors.proximo_contato?.message}
                                            {...register('proximo_contato')}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mb-2 block ml-1">Empreendimento</label>
                                        <div className="relative">
                                            <select
                                                className={cn(
                                                    "flex h-14 w-full items-center justify-between rounded-2xl border border-input bg-secondary/50 px-5 py-2 text-base ring-offset-background appearance-none font-medium transition-all duration-500 text-foreground",
                                                    errors.empreendimento_id && "border-destructive focus-visible:ring-destructive"
                                                )}
                                                {...register('empreendimento_id')}
                                            >
                                                <option value="">Selecione um empreendimento...</option>
                                                {enterpriseOptions.map(opt => (
                                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                        {errors.empreendimento_id && <p className="text-[10px] font-bold text-destructive mt-1 ml-1 uppercase tracking-wider">{errors.empreendimento_id.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mb-2 block ml-1">Origem do Lead</label>
                                        <div className="relative">
                                            <select
                                                className={cn(
                                                    "flex h-14 w-full items-center justify-between rounded-2xl border border-input bg-secondary/50 px-5 py-2 text-base ring-offset-background appearance-none font-medium transition-all duration-500 text-foreground",
                                                    errors.origem_id && "border-destructive focus-visible:ring-destructive"
                                                )}
                                                {...register('origem_id')}
                                            >
                                                <option value="">Selecione uma origem...</option>
                                                {sourceOptions.map(opt => (
                                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                        {errors.origem_id && <p className="text-[10px] font-bold text-destructive mt-1 ml-1 uppercase tracking-wider">{errors.origem_id.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mb-2 block ml-1">Temperatura</label>
                                        <div className="relative">
                                            <select
                                                className={cn(
                                                    "flex h-14 w-full items-center justify-between rounded-2xl border border-input bg-secondary/50 px-5 py-2 text-base ring-offset-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-medium transition-all duration-500 text-foreground",
                                                    errors.temperatura && "border-destructive focus:ring-destructive"
                                                )}
                                                {...register('temperatura')}
                                            >
                                                {(Object.values(LeadTemperature) as string[]).map((temp: string) => (
                                                    <option key={temp} value={temp} className="bg-card text-foreground">{temp}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mb-2 block ml-1">Estágio do Funil</label>
                                        <div className="relative">
                                            <select
                                                className={cn(
                                                    "flex h-14 w-full items-center justify-between rounded-2xl border border-input bg-secondary/50 px-5 py-2 text-base ring-offset-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-medium transition-all duration-500 text-foreground",
                                                    errors.status && "border-destructive focus:ring-destructive"
                                                )}
                                                {...register('status')}
                                            >
                                                {(Object.values(LeadStatus) as string[]).map((status: string) => (
                                                    <option key={status} value={status} className="bg-card text-foreground">{status}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Input
                                            label="Corretor Responsável"
                                            placeholder="Nome do corretor..."
                                            error={errors.corretor?.message}
                                            {...register('corretor')}
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            label="Data da Compra"
                                            type="date"
                                            error={errors.data_compra?.message}
                                            {...register('data_compra')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mb-2 block ml-1">Histórico e Notas</label>
                                    <textarea
                                        rows={6}
                                        className={cn(
                                            "flex w-full rounded-[1.5rem] border border-input bg-secondary/50 px-6 py-5 text-base shadow-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-medium transition-all duration-500 text-foreground",
                                            errors.historico && "border-destructive focus-visible:ring-destructive"
                                        )}
                                        placeholder="Descreva o histórico do lead..."
                                        {...register('historico')}
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="p-6 md:p-12 border-t border-border flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => navigate('/')}
                                        className="h-14 px-6 text-[10px] font-bold tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-2xl w-full md:w-auto"
                                        disabled={isSubmitting}
                                    >
                                        CANCELAR
                                    </Button>

                                    {id && (userProfile?.role === 'admin' || userProfile?.role === 'owner') && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleDelete}
                                            className="h-14 px-6 text-[10px] font-bold tracking-widest text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl w-full md:w-auto"
                                            disabled={isSubmitting}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            EXCLUIR
                                        </Button>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                    {id && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-14 px-8 rounded-2xl border-emerald-500/50 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10 transition-all w-full md:w-auto"
                                            onClick={() => {
                                                const phone = getValues('telefone').replace(/\D/g, '');
                                                const finalPhone = phone.length === 11 || phone.length === 10
                                                    ? `55${phone}`
                                                    : phone;
                                                window.open(`https://wa.me/${finalPhone}`, '_blank');
                                            }}
                                        >
                                            WHATSAPP
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-sm font-bold tracking-widest"
                                        isLoading={isSubmitting}
                                    >
                                        {id ? 'SALVAR ALTERAÇÕES' : 'CRIAR LEAD'}
                                    </Button>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                {id && currentLead && (
                    <div className="space-y-6">
                        <AIAssistant lead={currentLead as Lead} className="lg:sticky lg:top-8" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadForm;
