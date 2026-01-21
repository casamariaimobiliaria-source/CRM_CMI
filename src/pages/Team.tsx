import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useLead } from '../contexts/LeadContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MaskedInput } from '../components/ui/MaskedInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { UserPlus, Trash2 } from 'lucide-react';

interface Member {
    id: string;
    organization_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    created_at: string;
    user: {
        email: string;
        name: string;
        phone?: string;
    } | null;
}

const registerSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    phone: z.string().min(10, 'Telefone inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    role: z.enum(['admin', 'member']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Team: React.FC = () => {
    const { userProfile } = useLead();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: 'member' }
    });

    const fetchData = async () => {
        if (!userProfile?.organization_id) return;

        try {
            // Fetch Members
            const { data: membersData, error: membersError } = await supabase
                .from('organization_members')
                .select('*')
                .eq('organization_id', userProfile.organization_id);

            if (membersError) throw membersError;

            // Fetch User Details for Members
            const userIds = membersData?.map(m => m.user_id) || [];
            let fullMembers: Member[] = [];

            if (userIds.length > 0) {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .in('id', userIds);

                if (usersError) throw usersError;

                // Merge Data
                fullMembers = (membersData || []).map((member: any) => {
                    const user = usersData?.find(u => u.id === member.user_id);
                    return {
                        ...member,
                        user: user || { name: 'Usuário', email: '...' }
                    };
                });
            }

            setMembers(fullMembers);
        } catch (error) {
            console.error('Error fetching team data:', error);
            toast.error('Erro ao carregar dados da equipe.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userProfile?.organization_id]);

    const onRegister = async (data: RegisterFormValues) => {
        if (!userProfile?.organization_id) return;
        setRegistering(true);

        try {
            // 1. Create User using a temporary client to avoid signing out the admin
            const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
            });

            const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                        phone: data.phone // Metadata for triggers potentially
                    }
                }
            });

            let userId = authData.user?.id;

            if (authError) {
                if (authError.message === 'User already registered') {
                    // Try to sign in with provided credentials to recover ID
                    // This handles cases where user was created but flow failed mid-way
                    const { data: signInData, error: signInError } = await tempSupabase.auth.signInWithPassword({
                        email: data.email,
                        password: data.password
                    });

                    if (signInError) {
                        throw new Error('Este e-mail já está cadastrado. Se o usuário já existe, use a senha correta para adicioná-lo.');
                    }

                    if (signInData.user) {
                        userId = signInData.user.id;
                    } else {
                        throw new Error('Falha ao recuperar usuário existente.');
                    }
                } else {
                    throw authError;
                }
            }

            if (!userId) throw new Error('Usuário não identificado.');

            // 2. Insert into public.users (Profile)
            // Even if trigger exists, we force update to ensure Organization ID
            const { error: profileError } = await supabase // Using admin client (current session needs permissions)
                .from('users')
                .upsert({
                    id: userId,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    organization_id: userProfile.organization_id
                });

            if (profileError) {
                console.error('Profile creation warning:', profileError);
                // We proceed to add to org members anyway
            }

            // 3. Add to Organization Members
            const { error: memberError } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: userProfile.organization_id,
                    user_id: userId,
                    role: data.role as 'admin' | 'member'
                });

            if (memberError) throw memberError;

            toast.success('Membro cadastrado com sucesso!');
            reset();
            fetchData();
        } catch (error: any) {
            console.error('Error registering member:', error);
            toast.error(`Erro ao cadastrar: ${error.message || 'Verifique os dados.'}`);
        } finally {
            setRegistering(false);
        }
    };

    const removeMember = async (memberId: string, userId: string) => {
        if (!confirm('Tem certeza que deseja remover este membro da equipe?')) return;

        if (userId === userProfile?.id) {
            toast.error('Você não pode remover a si mesmo.');
            return;
        }

        try {
            // Remove from org members
            const { error } = await supabase
                .from('organization_members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;

            // Update user to remove org_id (optional, depends on logic, maybe just leave as orphan or delete user?)
            // For now just removing from org access is safest.

            toast.success('Membro removido.');
            setMembers(prev => prev.filter(m => m.id !== memberId));
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error('Erro ao remover membro.');
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando equipe...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 pb-32 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gerenciar Equipe</h1>
                <p className="text-muted-foreground mt-1">Cadastre novos corretores e gerencie o acesso à sua equipe.</p>
            </div>

            <div className={`grid grid-cols-1 ${userProfile?.role === 'admin' || userProfile?.role === 'owner' ? 'lg:grid-cols-3' : ''} gap-8`}>
                {/* Registration Form */}
                {(userProfile?.role === 'admin' || userProfile?.role === 'owner') && (
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-lg sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-lg">Cadastrar Membro</CardTitle>
                                <CardDescription>Adicione um novo usuário.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
                                    <Input
                                        label="Nome Completo"
                                        placeholder="Nome do Corretor"
                                        error={errors.name?.message}
                                        {...register('name')}
                                    />
                                    <Input
                                        label="E-mail"
                                        placeholder="email@exemplo.com"
                                        error={errors.email?.message}
                                        {...register('email')}
                                    />
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 mb-1.5 block">
                                            Telefone (WhatsApp)
                                        </label>
                                        <Controller
                                            name="phone"
                                            control={control}
                                            render={({ field }: { field: any }) => (
                                                <MaskedInput
                                                    placeholder="(11) 99999-9999"
                                                    error={errors.phone?.message}
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </div>
                                    <Input
                                        label="Senha Inicial"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        error={errors.password?.message}
                                        {...register('password')}
                                    />
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 mb-1.5 block">
                                            Função
                                        </label>
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            {...register('role')}
                                        >
                                            <option value="member">Corretor (Membro)</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                    <Button type="submit" className="w-full" isLoading={registering}>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Cadastrar
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Members List */}
                <div className={`${userProfile?.role === 'admin' || userProfile?.role === 'owner' ? 'lg:col-span-2' : 'max-w-3xl mx-auto w-full'} space-y-6`}>
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Membros da Equipe</CardTitle>
                            <CardDescription>{members.length} colaboradores ativos</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {members.map(member => (
                                <div key={member.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase">
                                            {member.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-slate-900">{member.user?.name || 'Usuário'}</p>
                                            <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={member.role === 'owner' ? 'default' : member.role === 'admin' ? 'secondary' : 'outline'}>
                                            {member.role === 'owner' ? 'Proprietário' : member.role === 'admin' ? 'Admin' : 'Corretor'}
                                        </Badge>
                                        {(userProfile?.role === 'admin' || userProfile?.role === 'owner') && member.role !== 'owner' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeMember(member.id, member.user_id)}
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Team;
