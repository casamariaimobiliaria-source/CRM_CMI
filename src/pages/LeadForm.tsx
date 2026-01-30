import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLead } from '../contexts/LeadContext';
import { LeadTemperature, LeadStatus } from '../types';
import { Input } from '../components/ui/Input';
import { MaskedInput } from '../components/ui/MaskedInput';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { toast } from 'sonner';
import { leadFormSchema, type LeadFormValues } from '../lib/validations';
import { cn } from '../lib/utils';
import { Trash2 } from 'lucide-react';

const LeadForm: React.FC = () => {
    const { addLead, updateLead, deleteLead, leads } = useLead();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

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
            dataCompra: '',
            corretor: '',
            empreendimento: '',
            temperatura: LeadTemperature.FRIO,
            status: LeadStatus.ATIVO,
            historico: '',
            nextContact: ''
        }
    });

    const watchTelefone = watch('telefone');

    useEffect(() => {
        if (id && leads.length > 0) {
            const existingLead = leads.find(l => l.id === id);
            if (existingLead) {
                reset({
                    nome: existingLead.nome,
                    telefone: existingLead.telefone,
                    email: existingLead.email || '',
                    midia: existingLead.midia || '',
                    dataCompra: existingLead.dataCompra || '',
                    corretor: existingLead.corretor || '',
                    empreendimento: existingLead.empreendimento || '',
                    temperatura: existingLead.temperatura,
                    status: existingLead.status,
                    historico: existingLead.historico || '',
                    nextContact: existingLead.nextContact || ''
                });
            }
        }
    }, [id, leads, reset]);

    // Duplicate Check
    const checkDuplicate = (phone: string) => {
        if (!phone || id) return false; // Don't check if editing
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) return false;

        return leads.some(l => l.telefone.replace(/\D/g, '') === cleanPhone);
    };

    const onSubmit = async (data: LeadFormValues) => {
        try {
            if (id) {
                await updateLead(id, data);
                toast.success('Lead atualizado com sucesso!', {
                    description: `${data.nome} foi atualizado.`
                });
            } else {
                await addLead(data);
                toast.success('Lead criado com sucesso!', {
                    description: `${data.nome} foi adicionado à sua base.`
                });
            }
            navigate('/');
        } catch (error) {
            console.error("Error saving lead", error);
            const errorMessage = error instanceof Error
                ? error.message
                : (typeof error === 'object' && error !== null && 'message' in error)
                    ? (error as any).message
                    : JSON.stringify(error);

            toast.error('Erro ao salvar lead', {
                description: errorMessage
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

    const labelClasses = "text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mb-2 block ml-1";
    const inputClasses = "bg-secondary/50 border-input focus:bg-background focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 rounded-2xl h-14 px-5 text-base transition-all duration-500 border focus:ring-4 focus:ring-primary/10";
    const selectClasses = "flex h-14 w-full items-center justify-between rounded-2xl border border-input bg-secondary/50 px-5 py-2 text-base ring-offset-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-medium transition-all duration-500 text-foreground";

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 pb-40 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground italic tracking-tight">
                    {id ? 'Detalhes do Registro Elite' : 'Identificar Nova Oportunidade'}
                </h1>
                <p className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mt-4">
                    Inteligência Exclusiva de Leads
                </p>
            </header>

            <Card className="bg-card/40 backdrop-blur-xl border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="p-8 md:p-12 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Identidade Completa</label>
                                <Input
                                    placeholder="Digite o nome completo..."
                                    className={inputClasses}
                                    error={errors.nome?.message}
                                    {...register('nome')}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Endereço de E-mail</label>
                                <Input
                                    type="email"
                                    placeholder="email@luxo.com"
                                    className={inputClasses}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Contato Direto (WhatsApp)</label>
                                <MaskedInput
                                    placeholder="+55 (00) 00000-0000"
                                    className={inputClasses}
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
                                <label className={labelClasses}>Acompanhamento Estratégico</label>
                                <Input
                                    type="datetime-local"
                                    className={cn(inputClasses, "block")}
                                    error={errors.nextContact?.message}
                                    {...register('nextContact')}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Empreendimento Elite</label>
                                <Input
                                    placeholder="Nome do Edifício / Ativo"
                                    className={inputClasses}
                                    {...register('empreendimento')}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Canal de Aquisição</label>
                                <Input
                                    placeholder="Origem da exclusividade"
                                    className={inputClasses}
                                    {...register('midia')}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Nível de Interesse (Calor)</label>
                                <div className="relative">
                                    <select
                                        className={cn(
                                            selectClasses,
                                            errors.temperatura && "border-destructive focus:ring-destructive"
                                        )}
                                        {...register('temperatura')}
                                    >
                                        {(Object.values(LeadTemperature) as string[]).map((temp: string) => (
                                            <option key={temp} value={temp}>{temp}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Status do Funil</label>
                                <div className="relative">
                                    <select
                                        className={cn(
                                            selectClasses,
                                            errors.status && "border-destructive focus:ring-destructive"
                                        )}
                                        {...register('status')}
                                    >
                                        {(Object.values(LeadStatus) as string[]).map((status: string) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className={labelClasses}>Briefing Confidencial & Inteligência</label>
                            <textarea
                                rows={6}
                                className={cn(
                                    "flex w-full rounded-[1.5rem] border border-input bg-secondary/50 px-6 py-5 text-base shadow-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-medium transition-all duration-500 text-foreground",
                                    errors.historico && "border-destructive focus-visible:ring-destructive"
                                )}
                                placeholder="Descreva o movimento estratégico..."
                                {...register('historico')}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/30 p-8 md:p-12 border-t border-border flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/')}
                                className="h-14 px-6 text-[10px] font-bold tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-2xl w-full md:w-auto"
                                disabled={isSubmitting}
                            >
                                CANCELAR
                            </Button>

                            {id && (
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
                                {id ? 'SALVAR DADOS' : 'CRIAR LEAD'}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default LeadForm;


