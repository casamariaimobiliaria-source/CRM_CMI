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
import { motion } from 'framer-motion';

const authSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional().or(z.literal(''))
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
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0 bg-background">
                <div className="absolute inset-0 subtle-dot-grid opacity-30" />
                <div className="absolute top-[10%] left-[15%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] animate-smoke" />
                <div className="absolute bottom-[10%] right-[15%] w-[35vw] h-[35vw] bg-purple-500/10 rounded-full blur-[120px] animate-smoke" style={{ animationDelay: '-5s' }} />
                <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] bg-amber-500/5 rounded-full blur-[120px] animate-smoke" style={{ animationDelay: '-10s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="z-10 w-full max-w-sm"
            >
                <div className="animate-float">
                    <Card className="w-full border-white/5 bg-card/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] neon-border-glow overflow-visible">
                        <CardHeader className="text-center pb-2 relative z-10">
                            <motion.div
                                initial={{ scale: 0.8, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary text-4xl font-black mx-auto mb-8 shadow-luxury border border-primary/20 backdrop-blur-md"
                            >
                                N
                            </motion.div>
                            <CardTitle className="text-4xl font-display italic tracking-tight mb-2">
                                Login
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/40">
                                CRM de Alta Performance
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
                            <CardContent className="space-y-6 pt-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-1">E-mail Corporativo</label>
                                    <Input
                                        placeholder="exemplo@email.com"
                                        className="bg-white/5 border-white/10 h-12 focus:border-primary/50 transition-all"
                                        error={errors.email?.message}
                                        {...register('email')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-1">Senha de Acesso</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="bg-white/5 border-white/10 h-12 focus:border-primary/50 transition-all"
                                        error={errors.password?.message}
                                        {...register('password')}
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-6 pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-sm font-bold tracking-[0.2em] uppercase bg-primary hover:bg-primary/80 text-primary-foreground shadow-luxury transition-all"
                                    isLoading={loading}
                                >
                                    ENTRAR AGORA
                                </Button>

                                <div className="flex flex-col gap-3 w-full">
                                    <button
                                        type="button"
                                        onClick={onForgotPassword}
                                        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors"
                                    >
                                        Recuperar Senha
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            window.open('https://wa.me/5511999999999?text=Olá! Gostaria de solicitar acesso ao ImobLeads.', '_blank');
                                        }}
                                        className="text-[11px] font-bold text-foreground/60 hover:text-primary transition-all border-t border-white/5 pt-4 mt-2"
                                    >
                                        NÃO TEM CONTA? SOLICITAR ACESSO VIA WHATSAPP
                                    </button>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;
