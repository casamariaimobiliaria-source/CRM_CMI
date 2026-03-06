import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { z } from 'zod';
import { motion } from 'framer-motion';

const authSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Onboarding: React.FC = () => {
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
                redirectTo: `${window.location.origin}/update-password`,
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
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            });
            if (error) throw error;
            toast.success('Bem-vindo de volta!');
        } catch (error: any) {
            toast.error(error.message || 'Erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1d2e] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#60a5fa]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f472b6]/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="z-10 w-full max-w-sm"
            >
                <div className="mb-12 text-center">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-primary rounded-[20px] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-modern-lg"
                    >
                        M
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Casa Maria
                    </h1>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/80">
                        Imobiliária de Alta Performance
                    </p>
                </div>

                <Card className="w-full border-white/5 bg-[#252836]/80 backdrop-blur-xl shadow-modern-lg overflow-hidden rounded-[12px]">
                    <CardHeader className="pb-0 pt-10 text-center">
                        <CardTitle className="text-xl font-bold text-white tracking-tight">
                            Acesso Restrito
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm mt-2">
                            Entre com suas credenciais corporativas
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6 pt-10 px-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#8b8fa3] uppercase tracking-wider ml-1">E-mail Corporativo</label>
                                <Input
                                    placeholder="seu@email.com"
                                    className="bg-[#1a1d2e] border-white/5 h-12 text-white placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary transition-all rounded-[10px]"
                                    error={errors.email?.message}
                                    {...register('email')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-[#8b8fa3] uppercase tracking-wider ml-1">Senha de Acesso</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-[#1a1d2e] border-white/5 h-12 text-white placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary transition-all rounded-[10px]"
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-6 pb-10 px-8">
                            <Button
                                type="submit"
                                className="w-full h-12 text-sm font-bold tracking-wide bg-primary hover:bg-primary/90 text-white transition-all rounded-[10px] shadow-lg shadow-primary/20"
                                isLoading={loading}
                            >
                                ACESSAR DASHBOARD
                            </Button>

                            <div className="flex flex-col gap-4 w-full text-center">
                                <button
                                    type="button"
                                    onClick={onForgotPassword}
                                    className="text-[11px] font-medium text-muted-foreground hover:text-white transition-colors"
                                >
                                    Esqueceu sua senha?
                                </button>
                                <div className="h-[1px] w-full bg-white/5 my-1" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        window.open('https://wa.me/5511999999999?text=Olá! Gostaria de solicitar acesso à plataforma Casa Maria Imóveis.', '_blank');
                                    }}
                                    className="text-[11px] font-bold text-primary hover:text-primary/80 transition-all uppercase tracking-widest"
                                >
                                    Solicitar Acesso via WhatsApp
                                </button>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default Onboarding;
