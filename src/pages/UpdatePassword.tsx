import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { z } from 'zod';
import { motion } from 'framer-motion';

const updatePasswordSchema = z.object({
    password: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'A confirmação deve ter pelo menos 6 caracteres')
}).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
});

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

const UpdatePassword: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar se há uma sessão ativa
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                toast.error('Sessão expirada ou inválida. Solicite a redefinição novamente.');
                navigate('/login');
            }
        });
    }, [navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<UpdatePasswordFormValues>({
        resolver: zodResolver(updatePasswordSchema)
    });

    const onSubmit = async (data: UpdatePasswordFormValues) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password
            });

            if (error) throw error;

            toast.success('Senha atualizada com sucesso!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar a senha');
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
            </div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-10 w-full max-w-sm"
            >
                <div className="animate-float">
                    <Card className="w-full border-white/5 bg-card/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] neon-border-glow overflow-visible">
                        <CardHeader className="text-center pb-2 relative z-10">
                            <motion.div
                                initial={{ scale: 0.8, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary text-4xl font-black mx-auto mb-8 shadow-luxury border border-primary/20 backdrop-blur-md"
                            >
                                🔒
                            </motion.div>
                            <CardTitle className="text-4xl font-display italic tracking-tight mb-2">
                                Nova Senha
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/80">
                                Defina sua nova credencial de acesso
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
                            <CardContent className="space-y-6 pt-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-1">Nova Senha</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="bg-white/5 border-white/10 h-12 focus:border-primary/50 transition-all"
                                        error={errors.password?.message}
                                        {...register('password')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-1">Confirmar Senha</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="bg-white/5 border-white/10 h-12 focus:border-primary/50 transition-all"
                                        error={errors.confirmPassword?.message}
                                        {...register('confirmPassword')}
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-6 pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-sm font-bold tracking-[0.2em] uppercase bg-primary hover:bg-primary/80 text-primary-foreground shadow-luxury transition-all"
                                    isLoading={loading}
                                >
                                    ATUALIZAR SENHA
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors"
                                >
                                    Voltar ao Login
                                </button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default UpdatePassword;
