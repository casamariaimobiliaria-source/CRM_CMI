import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useLead } from '../contexts/LeadContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const setupSchema = z.object({
    companyName: z.string().min(3, 'Nome da imobiliária deve ter pelo menos 3 caracteres'),
    userName: z.string().min(2, 'Seu nome deve ter pelo menos 2 caracteres'),
});

type SetupFormValues = z.infer<typeof setupSchema>;

const SetupOrganization: React.FC = () => {
    const { session, signOut } = useLead();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SetupFormValues>({
        resolver: zodResolver(setupSchema),
        defaultValues: {
            userName: session?.user?.user_metadata?.name || ''
        }
    });

    const onSubmit = async (data: SetupFormValues) => {
        if (!session?.user?.email) return;

        setLoading(true);
        try {
            const { error: rpcError } = await supabase.rpc('create_new_organization', {
                company_name: data.companyName,
                user_name: data.userName,
                user_email: session.user.email
            });

            if (rpcError) throw rpcError;

            // Refresh page to trigger context re-fetch and redirection
            window.location.reload();
        } catch (error: any) {
            console.error('Error creating organization:', error);
            toast.error(error.message || 'Erro ao criar organização.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-xl z-10">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-slate-800 rounded-2xl flex items-center justify-center text-primary-foreground text-3xl font-black mx-auto mb-6 shadow-xl shadow-primary/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <CardTitle className="text-2xl">Configurar Imobiliária</CardTitle>
                    <CardDescription>
                        Finalize seu cadastro criando uma nova organização para gerenciar sua equipe e leads.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4 pt-6">
                        <Input
                            label="Nome da Imobiliária"
                            placeholder="Ex: Imobiliária Silva"
                            className="bg-slate-50 border-slate-200"
                            error={errors.companyName?.message}
                            {...register('companyName')}
                        />
                        <Input
                            label="Seu Nome Completo"
                            placeholder="Ex: João Silva"
                            className="bg-slate-50 border-slate-200"
                            error={errors.userName?.message}
                            {...register('userName')}
                        />
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full h-12 text-base bg-gradient-to-r from-primary to-slate-800"
                            isLoading={loading}
                        >
                            Começar Agora
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => signOut()}
                            className="text-muted-foreground w-full"
                        >
                            Sair e tentar outro login
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default SetupOrganization;
