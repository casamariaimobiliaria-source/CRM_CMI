import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLead } from '../contexts/LeadContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { toast } from 'sonner';

const JoinOrganization: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { session } = useLead();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [inviteData, setInviteData] = useState<any>(null);

    useEffect(() => {
        if (!token) {
            toast.error('Token de convite inválido.');
            navigate('/');
            return;
        }

        // Verify token validity
        const verifyToken = async () => {
            try {
                const { data, error } = await supabase
                    .from('organization_invites')
                    .select('*, organizations(name)')
                    .eq('token', token)
                    .single();

                if (error || !data) throw new Error('Convite inválido ou expirado.');

                if (new Date(data.expires_at) < new Date()) {
                    throw new Error('Este convite expirou.');
                }

                if (data.status !== 'pending') {
                    throw new Error('Este convite já foi utilizado.');
                }

                setInviteData(data);
            } catch (error: any) {
                toast.error(error.message);
                navigate('/');
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token, navigate]);

    const handleAccept = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const { error } = await supabase.rpc('accept_invite', { token });
            if (error) throw error;

            toast.success('Convite aceito com sucesso! Bem-vindo.');
            // Force reload to update context
            window.location.href = '/';
        } catch (error: any) {
            console.error('Error accepting invite:', error);
            toast.error(error.message || 'Erro ao aceitar convite.');
            setLoading(false);
        }
    };

    if (verifying) {
        return <div className="min-h-screen flex items-center justify-center">Verificando convite...</div>;
    }

    if (!session) {
        // Redirect to login preserving the token
        // In a real app, passing state to login would be better
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Você foi convidado!</CardTitle>
                        <CardDescription>
                            Para entrar na organização <strong>{inviteData?.organizations?.name}</strong>, você precisa fazer login primeiro.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => navigate(`/login?redirectTo=/join?token=${token}`)}
                            className="w-full"
                        >
                            Fazer Login ou Criar Conta
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        🎉
                    </div>
                    <CardTitle className="text-2xl">Convite para Equipe</CardTitle>
                    <CardDescription className="text-base">
                        Você foi convidado para participar da organização <br />
                        <span className="font-bold text-foreground block mt-1 text-lg">{inviteData?.organizations?.name}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-50 p-4 rounded-lg mb-6 text-sm text-center text-muted-foreground border border-slate-100">
                        Ao aceitar, você terá acesso aos recursos compartilhados da equipe.
                    </div>
                    <Button
                        onClick={handleAccept}
                        className="w-full h-12 text-base"
                        isLoading={loading}
                    >
                        Aceitar Convite e Entrar
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default JoinOrganization;
