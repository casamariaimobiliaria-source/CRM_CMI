import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MaskedInput } from '../components/MaskedInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';
import { UserPlus, Trash2, Pencil, X } from 'lucide-react';

interface Member {
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
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
    role: z.enum(['owner', 'admin', 'member']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Team: React.FC = () => {
    const { userProfile } = useUser();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<RegisterFormValues>({
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
                    .select('id, name, email, phone')
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
            if (editingMember) {
                // UPDATE Logic
                const userId = editingMember.user_id;

                // 1. Update Profile (public.users)
                const { error: profileError } = await supabase
                    .from('users')
                    .update({
                        name: data.name,
                        role: data.role,
                        phone: data.phone
                    })
                    .eq('id', userId);

                if (profileError) throw profileError;

                // 2. Update Org Member Role
                const { error: memberError } = await supabase
                    .from('organization_members')
                    .update({ role: data.role as 'owner' | 'admin' | 'member' })
                    .match({
                        organization_id: userProfile.organization_id,
                        user_id: userId
                    });

                if (memberError) throw memberError;

                toast.success('Membro atualizado com sucesso!');
                setEditingMember(null);
            } else {
                // CREATE Logic
                if (!data.password) throw new Error('Senha é obrigatória para novos cadastros.');

                const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
                    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
                });

                const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                    options: {
                        data: {
                            name: data.name,
                            phone: data.phone
                        }
                    }
                });

                let userId = authData.user?.id;

                if (authError) {
                    if (authError.message === 'User already registered') {
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
                const { error: profileError } = await supabase
                    .from('users')
                    .upsert({
                        id: userId,
                        name: data.name,
                        email: data.email,
                        role: data.role,
                        phone: data.phone,
                        organization_id: userProfile.organization_id
                    });

                if (profileError) throw profileError;

                // 3. Add to Organization Members
                const { error: memberError } = await supabase
                    .from('organization_members')
                    .insert({
                        organization_id: userProfile.organization_id,
                        user_id: userId,
                        role: data.role as 'owner' | 'admin' | 'member'
                    });

                if (memberError) throw memberError;

                toast.success('Membro cadastrado com sucesso!');
            }

            reset();
            fetchData();
        } catch (error: any) {
            console.error('Error registering member:', error);
            const msg = error.message || '';
            if (msg.includes('email rate limit exceeded')) {
                toast.error('Limite de emails do Supabase atingido. Sugestão: Desabilite "Confirm Email" no Dashboard do Supabase.');
            } else if (msg.includes('Email not confirmed')) {
                toast.error('E-mail não confirmado. O trigger de auto-confirmação deve resolver isso no próximo login.');
            } else {
                toast.error(`Erro ao cadastrar: ${msg || 'Verifique os dados.'}`);
            }
        } finally {
            setRegistering(false);
        }
    };

    const removeMember = async (userId: string) => {
        if (!confirm('Tem certeza que deseja remover este membro da equipe?')) return;

        if (userId === userProfile?.id) {
            toast.error('Você não pode remover a si mesmo.');
            return;
        }

        try {
            const { error } = await supabase
                .from('organization_members')
                .delete()
                .match({
                    organization_id: userProfile!.organization_id,
                    user_id: userId
                });

            if (error) throw error;

            toast.success('Membro removido.');
            setMembers(prev => prev.filter(m => m.user_id !== userId));
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error('Erro ao remover membro.');
        }
    };

    const handleEditMember = (member: Member) => {
        setEditingMember(member);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Setting form values
        setValue('name', member.user?.name || '');
        setValue('email', member.user?.email || '');
        setValue('phone', member.user?.phone || '');
        setValue('role', member.role as 'owner' | 'admin' | 'member');
    };

    const cancelEdit = () => {
        setEditingMember(null);
        reset();
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando equipe...</div>;

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'owner' || userProfile?.is_super_admin;

    return (
        <div className="max-w-5xl mx-auto p-6 pb-32 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground italic tracking-tighter">Gerenciar Equipe</h1>
                <p className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase flex items-center gap-3">
                    <span className="h-[1px] w-8 bg-primary/30" />
                    Equipe & Governança
                </p>
            </div>

            <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : ''} gap-8`}>
                {isAdmin && (
                    <div className="lg:col-span-1">
                        <Card className="glass-high-fidelity rounded-[2.5rem] sticky top-24">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-lg">
                                        {editingMember ? 'Editar Membro' : 'Cadastrar Membro'}
                                    </CardTitle>
                                    <CardDescription>
                                        {editingMember ? 'Atualize os dados do colaborador.' : 'Adicione um novo usuário.'}
                                    </CardDescription>
                                </div>
                                {editingMember && (
                                    <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8">
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
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
                                        disabled={!!editingMember}
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
                                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-base ring-offset-background focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-medium transition-all duration-500 text-foreground"
                                            {...register('role')}
                                        >
                                            <option value="member" className="bg-[#0a0a0a] text-foreground">Corretor (Membro)</option>
                                            <option value="admin" className="bg-[#0a0a0a] text-foreground">Administrador</option>
                                            <option value="owner" className="bg-[#0a0a0a] text-foreground">Proprietário</option>
                                        </select>
                                    </div>
                                    <Button type="submit" className="w-full" isLoading={registering}>
                                        {editingMember ? <Pencil className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                        {editingMember ? 'Salvar Alterações' : 'Cadastrar Membro'}
                                    </Button>
                                    {editingMember && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full mt-2"
                                            onClick={cancelEdit}
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Members List */}
                <div className={`${isAdmin ? 'lg:col-span-2' : 'max-w-3xl mx-auto w-full'} space-y-6`}>
                    <Card className="glass-high-fidelity rounded-[2.5rem]">
                        <CardHeader>
                            <CardTitle className="text-lg">Membros da Equipe</CardTitle>
                            <CardDescription>{members.length} colaboradores ativos</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {members.map(member => (
                                <div key={member.user_id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary font-bold uppercase border border-white/5">
                                            {member.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">{member.user?.name || 'Usuário'}</p>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                                                {member.user?.phone && (
                                                    <>
                                                        <span className="hidden sm:inline text-muted-foreground/30">•</span>
                                                        <p className="text-xs text-primary font-medium">{member.user.phone}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={member.role === 'owner' ? 'default' : member.role === 'admin' ? 'secondary' : 'outline'}>
                                            {member.role === 'owner' ? 'Proprietário' : member.role === 'admin' ? 'Administrador' : 'Corretor'}
                                        </Badge>
                                        {isAdmin && member.role !== 'owner' && (
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditMember(member)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => removeMember(member.user_id)}
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
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
