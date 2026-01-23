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

const LeadForm: React.FC = () => {
    const { addLead, updateLead, leads } = useLead();
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

    const labelClasses = "text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 mb-1.5 block";
    const selectClasses = "flex h-12 w-full items-center justify-between rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-medium";

    return (
        <div className="max-w-4xl mx-auto p-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-sm">
                <CardHeader className="border-b bg-white/50 pb-8">
                    <CardTitle className="text-2xl">{id ? 'Editar Lead' : 'Novo Lead'}</CardTitle>
                    <CardDescription>Preencha os dados abaixo para {id ? 'atualizar' : 'cadastrar'} um potencial cliente.</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Input
                                    label="Nome Completo"
                                    placeholder="Ex: João Silva"
                                    className="bg-white/80"
                                    error={errors.nome?.message}
                                    {...register('nome')}
                                />
                            </div>

                            <div>
                                <Input
                                    label="E-mail"
                                    type="email"
                                    placeholder="exemplo@email.com"
                                    className="bg-white/80"
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>

                            <div>
                                <MaskedInput
                                    label="WhatsApp"
                                    placeholder="(99) 99999-9999"
                                    className="bg-white/80"
                                    error={errors.telefone?.message}
                                    {...register('telefone', {
                                        onChange: (e) => {
                                            const isDup = checkDuplicate(e.target.value);
                                            if (isDup) {
                                                toast.warning('Este telefone já está cadastrado em nossa base!', {
                                                    description: 'Verifique se não é um lead duplicado.',
                                                    duration: 5000
                                                });
                                            }
                                        }
                                    })}
                                />
                                {checkDuplicate(register('telefone').name) && (
                                    <p className="text-[10px] text-amber-600 font-bold mt-1 px-1">⚠️ Este número já existe na sua base!</p>
                                )}
                            </div>

                            <div>
                                <Input
                                    label="Próximo Contato (Lembrete)"
                                    type="datetime-local"
                                    className="bg-white/80"
                                    error={errors.nextContact?.message}
                                    {...register('nextContact')}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Empreendimento"
                                    placeholder="Nome do Edifício / Loteamento"
                                    className="bg-white/80"
                                    {...register('empreendimento')}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Mídia / Origem"
                                    placeholder="Instagram, Site, Indicação..."
                                    className="bg-white/80"
                                    {...register('midia')}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Potencial</label>
                                <div className="relative">
                                    <select
                                        className={cn(
                                            selectClasses,
                                            errors.temperatura && "border-destructive focus:ring-destructive",
                                            "bg-white/80"
                                        )}
                                        {...register('temperatura')}
                                    >
                                        {(Object.values(LeadTemperature) as string[]).map((temp: string) => (
                                            <option key={temp} value={temp}>{temp}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                {errors.temperatura && (
                                    <p className="text-[10px] text-destructive font-medium ml-1 mt-1">{errors.temperatura.message}</p>
                                )}
                            </div>

                            <div>
                                <label className={labelClasses}>Status</label>
                                <div className="relative">
                                    <select
                                        className={cn(
                                            selectClasses,
                                            errors.status && "border-destructive focus:ring-destructive",
                                            "bg-white/80"
                                        )}
                                        {...register('status')}
                                    >
                                        {(Object.values(LeadStatus) as string[]).map((status: string) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                {errors.status && (
                                    <p className="text-[10px] text-destructive font-medium ml-1 mt-1">{errors.status.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClasses}>Histórico e Notas</label>
                            <textarea
                                rows={4}
                                className={cn(
                                    "flex w-full rounded-xl border border-input bg-white/80 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none font-medium",
                                    errors.historico && "border-destructive focus-visible:ring-destructive"
                                )}
                                placeholder="Descreva o andamento do atendimento..."
                                {...register('historico')}
                            />
                            {errors.historico && (
                                <p className="text-[10px] text-destructive font-medium ml-1">{errors.historico.message}</p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col md:flex-row justify-between gap-3 p-8 border-t bg-white/50">
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/')}
                                className="w-32"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            {id && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full md:w-48 bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-200"
                                    onClick={() => {
                                        const phone = getValues('telefone').replace(/\D/g, '');
                                        const finalPhone = phone.length === 11 || phone.length === 10
                                            ? `55${phone}`
                                            : phone;
                                        window.open(`https://wa.me/${finalPhone}`, '_blank');
                                    }}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    WhatsApp
                                </Button>
                            )}
                            <Button
                                type="submit"
                                className="w-full md:w-48"
                                isLoading={isSubmitting}
                            >
                                {id ? 'Salvar' : 'Cadastrar'}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default LeadForm;


