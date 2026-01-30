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
import { Building2 } from 'lucide-react';

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
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <Card className="w-full max-w-md border-border shadow-2xl bg-card/95 backdrop-blur-xl z-10 animate-in zoom-in-95 duration-700 slide-in-from-bottom-4">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl font-black mx-auto mb-6 shadow-xl shadow-primary/10 border border-primary/20">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-3xl font-display">Configurar Imobiliária</CardTitle>
                    <CardDescription>
                        Finalize seu cadastro criando uma nova organização para gerenciar sua equipe e leads.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-1">
                            <Input
                                label="Nome da Imobiliária"
                                placeholder="Ex: Imobiliária Silva"
                                error={errors.companyName?.message}
                                {...register('companyName')}
                            />
                            <p className="text-[10px] text-muted-foreground px-1">O nome da sua empresa (ex: Casa Maria Imóveis).</p>
                        </div>

                        <div className="space-y-1">
                            <Input
                                label="Seu Nome Completo"
                                placeholder="Ex: João Silva"
                                error={errors.userName?.message}
                                {...register('userName')}
                            />
                            <p className="text-[10px] text-muted-foreground px-1">Como você quer ser chamado no sistema.</p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full h-12 text-base shadow-lg shadow-primary/20"
                            isLoading={loading}
                        >
                            Começar Agora
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => signOut()}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
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
