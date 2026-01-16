import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLead } from '../contexts/LeadContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { onboardingSchema, type OnboardingFormValues } from '../lib/validations';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { z } from 'zod';

const authSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional().or(z.literal(''))
});

type AuthFormValues = z.infer<typeof authSchema>;

const Onboarding: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<AuthFormValues>({
        resolver: zodResolver(authSchema)
    });

    const onForgotPassword = async () => {
        const email = (document.getElementsByName('email')[0] as HTMLInputElement)?.value;
        if (!email || !z.string().email().safeParse(email).success) {
            toast.error('Informe um e-mail válido para recuperar a senha');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login`,
            });
            if (error) throw error;
            toast.success('E-mail de recuperação enviado!');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao enviar e-mail de recuperação');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: AuthFormValues) => {
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password
                });
                if (error) throw error;
                toast.success('Bem-vindo de volta!');
            } else {
                if (!data.name) {
                    toast.error('Por favor, informe seu nome completo');
                    setLoading(false);
                    return;
                }
                const { error } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        data: {
                            name: data.name
                        }
                    }
                });
                if (error) {
                    if (error.message.includes('already registered')) {
                        toast.error('Este e-mail já possui uma conta. Tente fazer login.');
                        setIsLogin(true);
                        return;
                    }
                    throw error;
                }
                toast.success('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro na autenticação');
        } finally {
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

            <Card className="w-full max-w-sm border-0 shadow-2xl bg-white/95 backdrop-blur-xl z-10 animate-in zoom-in-95 duration-700 slide-in-from-bottom-4">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground text-3xl font-black mx-auto mb-6 shadow-xl shadow-primary/30">
                        L
                    </div>
                    <CardTitle className="text-3xl">{isLogin ? 'Bem-vindo' : 'Criar Conta'}</CardTitle>
                    <CardDescription>
                        {isLogin ? 'Acesse sua conta para gerenciar seus leads.' : 'Comece agora a profissionalizar seus leads.'}
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4 pt-6">
                        {!isLogin && (
                            <Input
                                label="Nome Completo"
                                placeholder="Seu nome aqui"
                                className="bg-slate-50 border-slate-200"
                                error={errors.name?.message}
                                {...register('name')}
                            />
                        )}
                        <Input
                            label="E-mail"
                            placeholder="exemplo@email.com"
                            className="bg-slate-50 border-slate-200"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                        <Input
                            label="Senha"
                            type="password"
                            placeholder="••••••••"
                            className="bg-slate-50 border-slate-200"
                            error={errors.password?.message}
                            {...register('password')}
                        />
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full h-12 text-base bg-gradient-to-r from-primary to-slate-800"
                            isLoading={loading}
                        >
                            {isLogin ? 'Entrar Agora' : 'Criar Minha Conta'}
                        </Button>

                        {isLogin && (
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-xs text-slate-500 hover:text-primary transition-colors text-center"
                            >
                                Esqueci minha senha
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-slate-600 hover:text-primary transition-colors font-medium"
                        >
                            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
                        </button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Onboarding;
